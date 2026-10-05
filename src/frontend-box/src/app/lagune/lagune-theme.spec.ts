import { TestBed } from '@angular/core/testing'
import { isLaguneTheme } from './lagune-theme'
import { LgPageDotsComponent } from './lg-page-dots.component'

describe('Lagune theme', () => {
  it('is recognised by its id and by copies named "lagune-…"', () => {
    expect(isLaguneTheme('lagune')).toBeTrue()
    expect(isLaguneTheme('lagune-nacht')).toBeTrue()
    expect(isLaguneTheme('lagunen')).toBeFalse()
    expect(isLaguneTheme('blue')).toBeFalse()
    expect(isLaguneTheme(undefined)).toBeFalse()
  })
})

describe('LgPageDotsComponent', () => {
  const dotsFor = (count: number, active: number): HTMLElement[] => {
    const fixture = TestBed.createComponent(LgPageDotsComponent)
    fixture.componentRef.setInput('count', count)
    fixture.componentRef.setInput('active', active)
    fixture.detectChanges()
    return Array.from(fixture.nativeElement.querySelectorAll('.page-dot'))
  }

  it('shows no dot for a single page', () => {
    expect(dotsFor(1, 0).length).toBe(0)
  })

  it('shows one dot per page and marks the active one', () => {
    const dots = dotsFor(3, 1)
    expect(dots.length).toBe(3)
    expect(dots.map((dot) => dot.classList.contains('active'))).toEqual([false, true, false])
  })

  it('shows a window of seven dots for many pages, smaller at the open ends', () => {
    const dots = dotsFor(20, 10)
    expect(dots.length).toBe(7)
    expect(dots[3].classList.contains('active')).toBeTrue()
    expect(dots[0].classList.contains('small')).toBeTrue()
    expect(dots[6].classList.contains('small')).toBeTrue()
  })
})
