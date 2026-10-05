import { ChangeDetectionStrategy, Component, inject, input, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { StatusComponent } from '../status/status.component'

/**
 * Figma "Frame 13": WiFi and battery (the app's own status, the same as in every theme) in a dark pill hanging from
 * the top right corner. On the start page a long press opens the settings, as the status icons of the other themes do.
 */
@Component({
  selector: 'mupi-lg-status-pill',
  template: `
    <div
      class="status-pill"
      (pointerdown)="pointerDown()"
      (pointerup)="pointerUp()"
      (pointerleave)="pointerUp()"
      (pointercancel)="pointerUp()"
      (contextmenu)="$event.preventDefault()">
      <mupi-status></mupi-status>
    </div>
  `,
  styleUrls: ['./lg-status-pill.component.scss'],
  imports: [StatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LgStatusPillComponent implements OnDestroy {
  /** How long a press takes to open the settings; 0: never (every page but the start page). */
  public settingsHoldMs = input(0)

  private readonly router = inject(Router)
  private timer = 0

  protected pointerDown(): void {
    window.clearTimeout(this.timer)
    const hold = this.settingsHoldMs()
    if (hold <= 0) return
    this.timer = window.setTimeout(() => this.router.navigate(['/settings']), hold)
  }

  protected pointerUp(): void {
    window.clearTimeout(this.timer)
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.timer)
  }
}
