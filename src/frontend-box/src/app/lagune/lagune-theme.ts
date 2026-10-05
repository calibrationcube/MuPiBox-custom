import { addIcons } from 'ionicons'

// "Lagune": the look of the MuPiBox-custom fork (light teal background with darker arcs, all categories on one
// scrolling start page, square tiles with a frosted name band, round white player buttons). Its own markup for the
// start page, the album list, "Weiterhören" and the player with its track list; every other page stays as it is.
//
// The theme file themes/lagune.css carries the colours and the font, the markup lives in this folder. A copy of that
// file under another name that starts with "lagune-" (e.g. themes/lagune-nacht.css) gets the same layout in its own
// colours - only its id has to be in installedThemes.

export const LAGUNE_THEME_ID = 'lagune'

export function isLaguneTheme(id: string | undefined): boolean {
  return id === LAGUNE_THEME_ID || (id?.startsWith(`${LAGUNE_THEME_ID}-`) ?? false)
}

// Icons from Lucide (https://lucide.dev, ISC license, Copyright (c) Lucide Icons and Contributors), the set the
// design was drawn with. Only their outlines are kept here, so the app needs no extra package. They are registered
// for ion-icon under a "lg-" prefix: <ion-icon name="lg-play">.
type IconNode = [tag: string, attrs: Record<string, string>][]

const ICONS: Record<string, IconNode> = {
  headphones: [
    [
      'path',
      {
        d: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3',
      },
    ],
  ],
  music: [
    ['path', { d: 'M9 18V5l12-2v13' }],
    ['circle', { cx: '6', cy: '18', r: '3' }],
    ['circle', { cx: '18', cy: '16', r: '3' }],
  ],
  podcast: [
    ['path', { d: 'M12 17v4' }],
    ['path', { d: 'M18 11a6 6 0 00-3-5.197' }],
    ['path', { d: 'M2 11a10 10 0 015-8.662' }],
    ['path', { d: 'M22 11a10 10 0 00-5-8.662' }],
    ['path', { d: 'M6 11a6 6 0 013-5.197' }],
    ['path', { d: 'M9 21h6' }],
    ['rect', { x: '10', y: '9', width: '4', height: '8', rx: '2' }],
  ],
  server: [
    ['rect', { width: '20', height: '8', x: '2', y: '2', rx: '2', ry: '2' }],
    ['rect', { width: '20', height: '8', x: '2', y: '14', rx: '2', ry: '2' }],
    ['line', { x1: '6', x2: '6.01', y1: '6', y2: '6' }],
    ['line', { x1: '6', x2: '6.01', y1: '18', y2: '18' }],
  ],
  history: [
    ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
    ['path', { d: 'M3 3v5h5' }],
    ['path', { d: 'M12 7v5l4 2' }],
  ],
  play: [['path', { d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z' }]],
  pause: [
    ['rect', { x: '14', y: '3', width: '5', height: '18', rx: '1' }],
    ['rect', { x: '5', y: '3', width: '5', height: '18', rx: '1' }],
  ],
  'skip-back': [
    ['path', { d: 'M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z' }],
    ['path', { d: 'M3 20V4' }],
  ],
  'skip-forward': [
    ['path', { d: 'M21 4v16' }],
    ['path', { d: 'M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z' }],
  ],
  minus: [['path', { d: 'M5 12h14' }]],
  plus: [
    ['path', { d: 'M5 12h14' }],
    ['path', { d: 'M12 5v14' }],
  ],
  shuffle: [
    ['path', { d: 'm18 14 4 4-4 4' }],
    ['path', { d: 'm18 2 4 4-4 4' }],
    ['path', { d: 'M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22' }],
    ['path', { d: 'M2 6h1.972a4 4 0 0 1 3.6 2.2' }],
    ['path', { d: 'M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45' }],
  ],
  'arrow-left': [
    ['path', { d: 'm12 19-7-7 7-7' }],
    ['path', { d: 'M19 12H5' }],
  ],
  'list-music': [
    ['path', { d: 'M16 5H3' }],
    ['path', { d: 'M11 12H3' }],
    ['path', { d: 'M11 19H3' }],
    ['path', { d: 'M21 16V5' }],
    ['circle', { cx: '18', cy: '16', r: '3' }],
  ],
  headset: [
    [
      'path',
      {
        d: 'M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z',
      },
    ],
    ['path', { d: 'M21 16v2a4 4 0 0 1-4 4h-5' }],
  ],
}

// The same data URL form ionicons uses for its own icons (without its "ionicon" class: that fills the shapes); the
// lines take the colour of the ion-icon.
function toIonIconUrl(node: IconNode): string {
  const children = node
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) => `${key}='${value}'`)
        .join(' ')
      return `<${tag} ${attributes}/>`
    })
    .join('')
  return (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' " +
    `stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${children}</svg>`
  )
}

let registered = false

/** Registers the theme's icons once (every Lagune component calls it, the first one does the work). */
export function registerLaguneIcons(): void {
  if (registered) return
  registered = true
  addIcons(Object.fromEntries(Object.entries(ICONS).map(([name, node]) => [`lg-${name}`, toIonIconUrl(node)])))
}
