import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core'
import { IonIcon, IonRange, IonSpinner } from '@ionic/angular/standalone'
import { ArtworkService } from '../artwork.service'
import type { CurrentMPlayer } from '../current.mplayer'
import type { CurrentSpotify } from '../current.spotify'
import { DisplayTextsService } from '../display-texts.service'
import type { Media } from '../media'
import type { TrackListEntry } from '../player/player.page'
import { registerLaguneIcons } from './lagune-theme'
import { LgHeaderComponent } from './lg-header.component'
import { LgPageDotsComponent } from './lg-page-dots.component'

/** Six rows of the track list fit on one page of the panel. */
const TRACKS_PER_PAGE = 6

/**
 * The player of the Lagune theme (Figma player board): the header of the album list with the artist's cover in the
 * corner (a tap leads back - minimises or stops, as set in the app), the album cover on the left with the volume
 * below it, title, position, progress bar with the times and one row of round buttons on the right. A long press on
 * the cover or a tap on the position opens the track list: a dark panel with six rows a page and dots at the side.
 *
 * Only the look lives here: the player page does everything else (playback, resume, Spotify, the end of an album,
 * "Hören mit") and hands its state in. So the theme follows every change of the player without a copy of its logic.
 */
@Component({
  selector: 'mupi-lg-player',
  templateUrl: './lg-player.component.html',
  styleUrls: ['./lg-player.component.scss'],
  imports: [IonIcon, IonRange, IonSpinner, LgHeaderComponent, LgPageDotsComponent],
})
export class LgPlayerComponent {
  public media = input.required<Media>()
  public spotify = input<CurrentSpotify | null | undefined>(undefined)
  public local = input<CurrentMPlayer | null | undefined>(undefined)
  public cover = input('')
  public playing = input(false)
  public progress = input(0)
  public pressingCover = input(false)
  public listViewTimerMs = input(2500)
  public backAction = input<'minimize' | 'stop'>('minimize')
  public outputChoosable = input(false)
  public outputOnBluetooth = input(false)
  public showTrackList = input(false)
  public loadingTrackList = input(false)
  public trackListFailed = input(false)
  public trackList = input<TrackListEntry[]>([])
  public isCurrentTrack = input<(entry: TrackListEntry) => boolean>(() => false)

  public back = output<void>()
  public playPause = output<void>()
  public skipPrev = output<void>()
  public skipNext = output<void>()
  public volDown = output<void>()
  public volUp = output<void>()
  public toggleShuffle = output<void>()
  public seekTo = output<number>()
  public coverDown = output<void>()
  public coverUp = output<void>()
  public openTrackList = output<void>()
  public closeTrackList = output<void>()
  public playTrack = output<TrackListEntry>()
  public openOutput = output<void>()

  protected readonly texts = inject(DisplayTextsService)
  private readonly artwork = inject(ArtworkService)
  protected activeTrackPage = 0
  private trackScroller = viewChild<ElementRef<HTMLElement>>('trackScroller')
  // the list the pages were made of (made again only when the page hands in a new one)
  private pagedList: TrackListEntry[] | undefined
  private pages: TrackListEntry[][] = []

  constructor() {
    registerLaguneIcons()
  }

  protected isRadio(): boolean {
    return this.media().type === 'radio'
  }

  /** Corner: the artist's picture (as on the album list), else the album's. */
  protected artistCover(): string {
    const media = this.media()
    const picture = media.artistcover || media.cover
    return picture ? this.artwork.cachedCoverUrl(media, picture) : this.cover()
  }

  /** First line of the header: the artist, else the album or station. */
  protected headerTitle(): string {
    const media = this.media()
    return media.artist || this.albumName() || media.title || ''
  }

  /** Second line: the album (show, audiobook), when it is not already the first line. */
  protected headerSubtitle(): string {
    const album = this.albumName()
    return album === this.headerTitle() ? '' : album
  }

  private albumName(): string {
    const media = this.media()
    const spotify = this.spotify()
    if (media.showid && spotify?.show_details) return spotify.show_details.name || ''
    if (media.audiobookid && spotify?.audiobook) return spotify.audiobook.name || ''
    if (media.type === 'spotify' && spotify?.currently_playing_type !== 'episode') {
      return spotify?.item?.album?.name || media.title_override || media.title || ''
    }
    if (media.type === 'library' || media.type === 'nas') return this.local()?.album || media.title || ''
    if (media.type === 'rss') return media.artist || ''
    return media.title_override || media.title || ''
  }

  /** The track (chapter, episode) that plays. */
  protected trackName(): string {
    const media = this.media()
    if (media.type === 'spotify') return this.spotify()?.item?.name || ''
    if (media.type === 'library' || media.type === 'nas') return this.local()?.currentTrackname || ''
    if (media.type === 'rss') return media.title || ''
    return media.title_override || media.title || ''
  }

  /** "Titel 3 von 19" (in the display's language); '' when the numbers are not known. */
  protected positionText(): string {
    const pos = this.position()
    return pos ? this.texts.text('trackOf', { n: pos.n, t: pos.t }) : ''
  }

  // The same numbers as the track button of the other themes (PlayerPage.trackCounter).
  private position(): { n: number; t: number } | undefined {
    const media = this.media()
    const spotify = this.spotify()
    const local = this.local()
    const pair = (n?: number | string, t?: number | string) =>
      n !== undefined && n !== '' && t !== undefined && Number(t) > 0 ? { n: Number(n), t: Number(t) } : undefined
    if (media.type === 'library' || media.type === 'nas') return pair(local?.currentTracknr, local?.totalTracks)
    if (media.type !== 'spotify') return undefined
    if (media.playlistid && (spotify?.playlist?.total_tracks ?? 0) > 0) {
      return pair(spotify?.playlist?.current_track_position, spotify?.playlist?.total_tracks)
    }
    if (media.showid && spotify?.show_details) {
      return pair(spotify.show_details.current_episode_position, spotify.show_details.total_episodes)
    }
    if (media.audiobookid && spotify?.audiobook) {
      return pair(spotify.audiobook.current_chapter_position, spotify.audiobook.total_chapters)
    }
    if (spotify?.currently_playing_type !== 'episode')
      return pair(spotify?.item?.track_number, spotify?.item?.album?.total_tracks)
    return undefined
  }

  /** Whether the track list can be opened (a podcast episode or a station has none). */
  protected hasTrackList(): boolean {
    const type = this.media().type
    return type === 'spotify' || type === 'library' || type === 'nas'
  }

  /** Playing time and length under the bar (Spotify in ms, mpv in seconds); undefined when the length is unknown. */
  protected times(): { position: string; duration: string } | undefined {
    if (this.media().type === 'spotify') {
      const spotify = this.spotify()
      const duration = spotify?.item?.duration_ms
      return duration
        ? { position: this.format(spotify?.progress_ms ?? 0), duration: this.format(duration) }
        : undefined
    }
    const local = this.local()
    const seconds = local?.durationSeconds
    if (!seconds) return undefined
    return { position: this.format((local?.positionSeconds ?? 0) * 1000), duration: this.format(seconds * 1000) }
  }

  protected format(ms: number | undefined): string {
    if (!ms) return '0:00'
    const total = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = String(total % 60).padStart(2, '0')
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
  }

  protected volumePercent(): number {
    const volume = this.local()?.volume
    return typeof volume === 'number' ? Math.max(0, Math.min(100, volume)) : 0
  }

  /** A stream that is buffering: the ring in the middle of the cover shrinks from 20 to 3 as the buffer fills. */
  protected loadRingRadius(): number {
    const progress = Math.min(100, Math.max(0, this.local()?.loadProgress ?? 0))
    return 20 - 17 * (progress / 100)
  }

  protected loadWaiting(): boolean {
    return (this.local()?.loadProgress ?? 0) === 0
  }

  protected shuffleShown(): boolean {
    const media = this.media()
    return media.type === 'spotify' && (media.category === 'music' || media.category === 'other')
  }

  protected onSeek(event: Event): void {
    const value = Number((event as CustomEvent<{ value: unknown }>).detail?.value)
    if (Number.isFinite(value)) this.seekTo.emit(value)
  }

  /** The corner closes an open track list first, else it leads back. */
  protected cornerClicked(): void {
    if (this.showTrackList()) this.closeTrackList.emit()
    else this.back.emit()
  }

  // ----- the track list: six rows a page, the page with the current track first -----

  protected trackPages(): TrackListEntry[][] {
    const list = this.trackList()
    if (list !== this.pagedList) {
      this.pagedList = list
      this.pages = []
      for (let i = 0; i < list.length; i += TRACKS_PER_PAGE) this.pages.push(list.slice(i, i + TRACKS_PER_PAGE))
      this.activeTrackPage = 0
      const current = list.findIndex((entry) => this.isCurrentTrack()(entry))
      if (current >= TRACKS_PER_PAGE)
        setTimeout(() => this.scrollToTrackPage(Math.floor(current / TRACKS_PER_PAGE), false))
    }
    return this.pages
  }

  protected onTrackListScroll(): void {
    const element = this.trackScroller()?.nativeElement
    if (!element || element.clientHeight === 0) return
    this.activeTrackPage = Math.round(element.scrollTop / element.clientHeight)
  }

  protected scrollToTrackPage(index: number, smooth = true): void {
    const element = this.trackScroller()?.nativeElement
    element?.scrollTo({ top: index * element.clientHeight, behavior: smooth ? 'smooth' : 'auto' })
  }
}
