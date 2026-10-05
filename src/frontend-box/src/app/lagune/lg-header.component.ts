import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core'
import { IonIcon } from '@ionic/angular/standalone'
import { ArtworkService } from '../artwork.service'
import type { Media } from '../media'
import { NowPlayingPillComponent } from '../now-playing-pill/now-playing-pill.component'
import { registerLaguneIcons } from './lagune-theme'
import { LgStatusPillComponent } from './lg-status-pill.component'

/**
 * Figma "Album" frame: no bar or line, only a square in the top left corner (a cover or a symbol, 82x82, bottom right
 * corner rounded - a tap leads back), the title (Nunito Extra Bold 24) with an optional second line, and the status
 * pill at the top right. "Läuft gerade" (something plays on after the player was left) sits in front of the status.
 */
@Component({
  selector: 'mupi-lg-header',
  templateUrl: './lg-header.component.html',
  styleUrls: ['./lg-header.component.scss'],
  imports: [IonIcon, NowPlayingPillComponent, LgStatusPillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LgHeaderComponent {
  /** picture in the corner (artist cover); without one the symbol is shown */
  public cover = input<string | null | undefined>(undefined)
  /** or the entry whose artist picture goes into the corner (as on its tile) */
  public coverOf = input<Media | undefined>(undefined)
  public icon = input('lg-history')
  public cornerLabel = input('')
  public title = input('')
  public subtitle = input('')
  /** "Läuft gerade" in the header (start page and album list; not in the player itself) */
  public nowPlaying = input(true)
  public settingsHoldMs = input(0)
  public cornerClicked = output<void>()

  private readonly artwork = inject(ArtworkService)
  protected readonly picture = computed(() => {
    const media = this.coverOf()
    const url = media ? media.artistcover || media.cover : undefined
    return this.cover() || (media && url ? this.artwork.cachedCoverUrl(media, url) : undefined)
  })

  constructor() {
    registerLaguneIcons()
  }
}
