import { AsyncPipe } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  type Signal,
  signal,
} from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { IonIcon, IonSpinner } from '@ionic/angular/standalone'
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  type Observable,
  of,
  switchMap,
  tap,
} from 'rxjs'
import { environment } from '../../environments/environment'
import type { Artist } from '../artist'
import { ArtworkService } from '../artwork.service'
import { DisplayTextsService } from '../display-texts.service'
import type { CategoryType } from '../media'
import { MediaService } from '../media.service'
import type { MupiboxConfig } from '../mupibox-config.model'
import { PlayerService } from '../player.service'
import { registerLaguneIcons } from './lagune-theme'
import { LgHeaderComponent } from './lg-header.component'
import { LgTileComponent } from './lg-tile.component'

/** The categories in the order of the start page, with the theme's symbols. */
const CATEGORY_ICONS: Record<CategoryType, string> = {
  audiobook: 'lg-headphones',
  music: 'lg-music',
  nas: 'lg-server',
  other: 'lg-podcast',
  resume: 'lg-history',
}

// The section titles in the display's language (German and English; every other language takes the English ones).
const LABELS: Record<string, Partial<Record<CategoryType | 'empty', string>>> = {
  de: {
    audiobook: 'Hörspiele',
    music: 'Musik',
    nas: 'NAS',
    other: 'Podcasts & Radio',
    empty: 'Noch nichts eingerichtet',
  },
  en: { audiobook: 'Audiobooks', music: 'Music', nas: 'NAS', other: 'Podcasts & Radio', empty: 'Nothing here yet' },
}

/** One horizontally scrolling category of the start page. */
interface Section {
  category: CategoryType
  icon: string
  loading: Signal<boolean>
  tiles: Signal<{ artist: Artist; imgSrc: Observable<string> }[]>
}

/**
 * The start page of the Lagune theme (Figma home board): all categories one below the other, each a row of tiles that
 * scrolls sideways, the page itself scrolls up and down. "Weiterhören" in the top left corner, the status pill (long
 * press: settings) at the top right. The lists come from the same MediaService calls as the swiper of the other themes
 * (kept lists first, a quiet reload when the library changes); a category stays out when the parents hid it.
 */
@Component({
  selector: 'mupi-lg-home',
  templateUrl: './lg-home.component.html',
  styleUrls: ['./lg-home.component.scss'],
  imports: [AsyncPipe, IonIcon, IonSpinner, LgHeaderComponent, LgTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LgHomeComponent {
  /** the categories the start page shows (hidden ones and an unwanted NAS tab left out), in their order */
  public categories = input.required<{ key: CategoryType }[]>()
  public artistClicked = output<{ artist: Artist; category: CategoryType }>()
  public resumeClicked = output<void>()

  private readonly mediaService = inject(MediaService)
  private readonly playerService = inject(PlayerService)
  private readonly artwork = inject(ArtworkService)
  protected readonly texts = inject(DisplayTextsService)

  protected readonly settingsHoldMs = signal(3000)
  private readonly language = signal('en')
  // one section per category, made up front (toSignal may not be called inside a computed); a section only loads
  // while its category is shown
  private readonly allSections = new Map<CategoryType, Section>()
  protected readonly sections = computed(() =>
    this.categories()
      .map((c) => this.allSections.get(c.key))
      .filter((section): section is Section => section !== undefined),
  )
  protected readonly nasUnavailable = this.mediaService.nasUnavailable
  // counts up to load the NAS row again while the NAS does not answer
  private readonly nasReload = signal(0)

  constructor() {
    registerLaguneIcons()
    for (const category of ['audiobook', 'music', 'nas', 'other'] as CategoryType[]) {
      this.allSections.set(category, this.makeSection(category))
    }
    inject(HttpClient)
      .get<MupiboxConfig>(`${environment.backend.apiUrl}/config`)
      .subscribe({
        next: (config) => {
          const seconds = config?.mupibox?.settingsAccessTimer
          if (typeof seconds === 'number' && seconds > 0) this.settingsHoldMs.set(seconds * 1000)
          const language = (config as { displayLanguage?: unknown })?.displayLanguage
          if (typeof language === 'string') this.language.set(language)
        },
        error: () => undefined,
      })
    // the NAS row is asked for again every 30 s while the NAS is not reachable (as the NAS tab of the other themes)
    effect((onCleanup) => {
      if (!this.nasUnavailable() || !this.categories().some((c) => c.key === 'nas')) return
      const timer = window.setInterval(() => this.nasReload.update((n) => n + 1), 30_000)
      onCleanup(() => window.clearInterval(timer))
    })
  }

  protected label(key: CategoryType | 'empty'): string {
    return LABELS[this.language()]?.[key] ?? LABELS.en[key] ?? key
  }

  protected readText(text: string): void {
    this.playerService.sayText(text)
  }

  private makeSection(category: CategoryType): Section {
    const loading = signal(true)
    let shownJson = ''
    const visible = computed(() => this.categories().some((c) => c.key === category))
    const artists = toSignal(
      combineLatest([
        toObservable(visible),
        this.mediaService.getLibraryVersion(),
        toObservable(category === 'nas' ? this.nasReload : signal(0)),
      ]).pipe(
        distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]),
        switchMap(([shown]): Observable<Artist[]> => {
          if (!shown) return EMPTY
          // the row is on the screen already: loaded again quietly, only a list that changed is shown
          const background = shownJson !== ''
          if (!background) loading.set(true)
          return this.mediaService.fetchArtistData(category, background).pipe(
            catchError((error) => {
              console.error(error)
              return background ? EMPTY : of([] as Artist[])
            }),
            // (a big library first answers with an empty list after a few seconds and the rest later: the row keeps
            // its spinner until entries are there or the answer is complete, instead of saying "nothing here")
            tap({
              next: (list) => {
                if (list.length > 0) loading.set(false)
              },
              complete: () => loading.set(false),
            }),
            map((list) => ({ list, json: JSON.stringify(list) })),
            filter(({ json }) => !background || json !== shownJson),
            tap(({ json }) => {
              shownJson = json
            }),
            map(({ list }) => list),
          )
        }),
      ),
      { initialValue: [] as Artist[] },
    )
    // (the picture's observable is made once per list, not at every check of the template)
    const tiles = computed(() =>
      artists().map((artist) => ({ artist, imgSrc: this.artwork.getArtistArtwork(artist.coverMedia) })),
    )
    return { category, icon: CATEGORY_ICONS[category], loading, tiles }
  }
}
