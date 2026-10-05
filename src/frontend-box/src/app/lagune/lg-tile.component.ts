import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

/**
 * Square cover tile: the picture with a frosted name band at the bottom and an indicator bar in the accent colour.
 * A tap on the picture emits {@link tileClicked}, a tap on the name {@link labelClicked} (the box reads it aloud).
 * Podcast episodes show the upstream markers: a dot for something new, a bar for the progress, a tick when heard.
 */
@Component({
  selector: 'mupi-lg-tile',
  templateUrl: './lg-tile.component.html',
  styleUrls: ['./lg-tile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LgTileComponent {
  public imgSrc = input.required<string | null | undefined>()
  public title = input.required<string>()
  public isNew = input(false)
  public progress = input<number | undefined>(undefined)
  public done = input(false)
  public tileClicked = output<void>()
  public labelClicked = output<void>()

  protected onLabelClick(event: Event): void {
    event.stopPropagation()
    this.labelClicked.emit()
  }
}
