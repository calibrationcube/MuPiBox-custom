import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'

/** Many pages: only this many dots, the ones at the ends of the window are drawn smaller. */
const MAX_DOTS = 7

/**
 * A column of page dots (Figma: 15 px, #D9D9D9). The host is placed by the page around it; it lets touches through so
 * the list behind it still scrolls, only the dots themselves can be tapped.
 */
@Component({
  selector: 'mupi-lg-page-dots',
  template: `
    @if (count() > 1) {
      @for (dot of dots(); track dot.index) {
        <button
          type="button"
          class="page-dot"
          [class.active]="dot.index === active()"
          [class.small]="dot.small"
          (click)="dotClicked.emit(dot.index)"
          [attr.aria-label]="dot.index + 1"></button>
      }
    }
  `,
  styleUrls: ['./lg-page-dots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LgPageDotsComponent {
  public count = input.required<number>()
  public active = input.required<number>()
  public dotClicked = output<number>()

  protected dots = computed(() => {
    const count = this.count()
    const active = this.active()
    if (count <= MAX_DOTS) {
      return Array.from({ length: count }, (_, index) => ({ index, small: false }))
    }
    // a window of MAX_DOTS dots around the active page
    const half = Math.floor(MAX_DOTS / 2)
    const first = Math.min(Math.max(0, active - half), count - MAX_DOTS)
    return Array.from({ length: MAX_DOTS }, (_, i) => {
      const index = first + i
      const small = (i === 0 && index > 0) || (i === MAX_DOTS - 1 && index < count - 1)
      return { index, small }
    })
  })
}
