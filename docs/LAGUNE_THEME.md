# Theme „Lagune“: unser Design als wählbares Theme

„Lagune“ ist das Design von MuPiBox-custom (Figma „Mupibox_Gui“) als eigenes Theme auf dem aktuellen
MuPiBox-DEV-Stand. Es wird wie jedes andere Theme in der Webapp gewählt und lässt alle anderen Themes
unverändert.

Das Theme umfasst diese Seiten:

- **Startseite:** alle Kategorien untereinander, jede als waagerechte Kachelreihe. „Weiterhören“ sitzt
  oben links, die Status-Pille oben rechts. Ein langer Druck auf die Status-Pille öffnet die Einstellungen.
- **Albenliste:** Kacheln im 3×2-Raster mit Seitenpunkten. Das Künstlerbild in der Ecke führt zurück.
- **Weiterhören:** dasselbe Raster.
- **Player:** Cover links mit Lautstärke darunter, rechts Titel, Position, Fortschritt und runde Knöpfe.
- **Titelliste:** dunkles Feld mit sechs Titeln pro Seite. Sie öffnet sich mit einem langen Druck aufs
  Cover oder einem Tipp auf „Titel 3 von 14“, die Ecke schließt sie.

Einstellungsseiten, WLAN, Bluetooth usw. bleiben die von Upstream.

Was vom DEV-Stand mitkommt: „Läuft gerade“ (Player verlassen, Musik läuft weiter), „Hören mit“
(Kopfhörer per Bluetooth), Hörzeit-Chip, Podcast-Markierungen (neu, Fortschritt, gehört), die
Display-Sprache und die gesamte Wiedergabelogik inklusive der Spotify-Fixes.

## Installation

Die Box installiert diesen Fork mit dem Update-Skript in einem Schritt. Danach steht „Lagune“ in der
Themeliste. Das Skript wird frisch aus diesem Repository geholt, denn eine ältere Kopie auf der Box
kennt neue Schritte wie die Installation von mpv noch nicht.

```bash
curl -fsSL https://raw.githubusercontent.com/calibrationcube/MuPiBox-custom/main/update/start_mupibox_update.sh \
  | sudo bash -s -- branch main calibrationcube/MuPiBox-custom
```

Zum Testen eines anderen Zweigs dessen Namen an beiden Stellen statt `main` angeben.

Danach in der Webapp: **Einstellungen › Aussehen des Displays › Theme › Lagune**, dann „Jetzt anzeigen“. Alternativ
geht es in MuPi-Conf unter „MuPiBox settings“.

Das Update erledigt dabei alles Nötige:

- `conf_update.sh` trägt `lagune` in `mupibox.installedThemes` ein.
- `themes/lagune.css` landet bei den anderen Themes.
- Die Schrift Nunito kommt über `themes/_fonts` mit.
- Das Vorschaubild steckt in `AdminInterface/release/www.zip`.

## Eigene Farbvariante

`themes/lagune.css` enthält nur Farben, Hintergrund und Schrift. Die Datei als
`themes/lagune-<name>.css` kopieren und die Werte unter `:root` ändern. Danach den Namen in
`mupibox.installedThemes` eintragen. Jede Datei, deren Name mit `lagune-` beginnt, bekommt automatisch
den Lagune-Aufbau.

## Aufbau im Code

Der Aufbau liegt vollständig in `src/frontend-box/src/app/lagune/`. Die Upstream-Dateien haben nur kleine
Weichen, damit ein Abgleich mit neuen DEV-Ständen kaum Konflikte erzeugt.

| Datei | Änderung |
| --- | --- |
| `theme/km-theme.service.ts` | `isLagune`, `minimizable`, Body-Klasse `lg` |
| `home/home.page.*` | `@if (lg())` vor dem alten Markup; `artistCoverClicked` nimmt die Kategorie mit |
| `medialist/medialist.page.*` | `@if (lg())` mit Kopf und Kachelraster |
| `resume/resume.page.*` | `@if (lg())` mit Kopf und Kachelraster; `goBack()` |
| `player/player.page.*` | `@if (lg())` mit `<mupi-lg-player>`; `seek(value?)`; „Läuft gerade“ über `minimizable` |
| `now-playing-pill/now-playing-pill.component.ts` | sichtbar über `minimizable` |
| `swiper/swiper-ionic-events-helper.ts` | `?.`, weil Lagune-Seiten keinen Swiper haben |
| `backend-api/src/mupi-app/app.js` | Wechsel zu oder von Lagune lädt die Display-Seite neu |
| `update/conf_update.sh`, `config/templates/mupiboxconfig.json` | `lagune` registriert |
| `tools/theme-preview/render.mjs` | zählt auch Lagune-Kacheln |

Der Player des Themes zeigt nur an. Alle Aktionen gehen an die Upstream-Playerseite. Dadurch übernimmt
das Theme jede Änderung an Wiedergabe, Spotify oder Weiterhören ohne eigene Kopie der Logik.

## Mit Upstream abgleichen

Basis ist der Pre-DEV-Zweig `wowa1990/MuPiBox:upstream-v5-pr`. Er enthält `splitti/MuPiBox:main`
(DEV 5.0.7) und die Spotify-Fixes für 5.0.8. Sobald diese in `splitti/MuPiBox` gemergt sind, ist
`upstream/main` die Basis.

```bash
git remote add upstream https://github.com/splitti/MuPiBox.git
git remote add wowa https://github.com/wowa1990/MuPiBox.git
git fetch upstream && git fetch wowa
git merge wowa/upstream-v5-pr        # später: git merge upstream/main
```

Bei Konflikten gilt: Upstream-Code übernehmen und nur die Weichen aus der Tabelle oben wieder einsetzen.
Danach bauen, die Vorschau rendern und die Archive neu packen:

```bash
npm ci
cd src/frontend-box && npx ng build && cd ../..
node tools/theme-preview/render.mjs --only lagune      # AdminInterface/www/images/lagune.png
cd AdminInterface/www && zip -X ../release/www.zip images/lagune.png && cd ../..
```

`bin/nodejs/deploy.zip` wird wie bei Upstream neu gepackt: `npm run build` in `src`, dann den Inhalt von
`src/deploy/www/browser` nach `src/deploy/www` verschieben. Danach `prerendered-routes.json` und
`3rdpartylicenses.txt` löschen, `backend-player/README.md` nach `src/deploy` kopieren und mit
`zip -r -X -D` packen. Das Ergebnis hat dieselbe Dateiliste wie das Upstream-Archiv.
