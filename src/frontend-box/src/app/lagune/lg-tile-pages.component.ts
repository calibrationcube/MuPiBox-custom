import { AsyncPipe } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core'
import { PlayerService } from '../player.service'
import type { SwiperData } from '../swiper/swiper.component'
import { LgPageDotsComponent } from './lg-page-dots.component'
import { LgTileComponent } from './lg-tile.component'

/** Three columns times two rows fit on the 800x480 screen below the header. */
const TILES_PER_PAGE = 6

/**
 * Paged 3x2 tile grid of the Figma "Album" frame: every page is one screen high and snaps into place, a column of dots
 * on the right shows the current page. Takes the same list as the swiper of the other themes, so the pages only swap
 * the component. A tap on a name reads it aloud, as the swiper does.
 */
@Component({
  selector: 'mupi-lg-tile-pages',
  templateUrl: './lg-tile-pages.component.html',
  styleUrls: ['./lg-tile-pages.component.scss'],
  imports: [AsyncPipe, LgPageDotsComponent, LgTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LgTilePagesComponent<T> {
  public data = input<SwiperData<T>[] | undefined>([])
  /** What the list is of (artist, folder level): when it changes the grid starts at its first page again. */
  public listKey = input<string>('')
  public elementClicked = output<SwiperData<T>>()

  private readonly playerService = inject(PlayerService)
  protected readonly activePage = signal(0)
  protected readonly pages = computed(() => {
    const items = this.data() ?? []
    const pages: SwiperData<T>[][] = []
    for (let i = 0; i < items.length; i += TILES_PER_PAGE) {
      pages.push(items.slice(i, i + TILES_PER_PAGE))
    }
    return pages
  })

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller')

  constructor() {
    effect(() => {
      this.listKey()
      const element = untracked(() => this.scroller()?.nativeElement)
      if (element) element.scrollTop = 0
      this.activePage.set(0)
    })
  }

  protected onScroll(): void {
    const element = this.scroller()?.nativeElement
    if (!element || element.clientHeight === 0) return
    this.activePage.set(Math.round(element.scrollTop / element.clientHeight))
  }

  protected scrollToPage(index: number): void {
    const element = this.scroller()?.nativeElement
    element?.scrollTo({ top: index * element.clientHeight, behavior: 'smooth' })
  }

  protected readText(text: string): void {
    this.playerService.sayText(text)
  }
}
