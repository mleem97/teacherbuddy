# Teacherbuddy

**Teacherbuddy** ist ein modernes, webbasiertes Klassenbuch und Zufallsauswahl-Tool für Lehrkräfte. Es unterstützt die Verwaltung von Klassen, Schüler:innen, Anwesenheit, Beteiligung, Hausaufgaben und Gruppenbildung – alles in einer intuitiven Oberfläche. Das Projekt ist ein Fork von [teacherbuddy von mrbubbles-src](https://github.com/mrbubbles-src/teacherbuddy), ist aber stark modifiziert und umstrukturiert.
## Features

- **Zufällige Namensauswahl**: Fairer, zufälliger Aufruf von Schüler:innen mit Ausschluss bereits ausgewählter Namen.
- **Klassenbuch**: Verwaltung mehrerer Klassen, Schüler:innen, Stunden und Notizen.
- **Anwesenheitstracker**: Markiere Schüler:innen als anwesend, abwesend oder zu spät, inkl. Notizfunktion.
- **Beteiligungstracker**: Bewertung der mündlichen Beteiligung (1–5 Sterne) pro Stunde.
- **Hausaufgabenmanager**: Aufgaben erstellen, Abgaben und Status pro Schüler:in verwalten.
- **Gruppen-Generator**: Zufällige Gruppenbildung mit Constraints (z.B. „diese Namen zusammen/auseinander“), Export und Kopierfunktion.
- **Statistiken**: Übersichtliche Auswertungen zu Anwesenheit, Beteiligung und Hausaufgaben.
- **Import/Export**: Namen als CSV importieren/exportieren.
- **Dark Mode**: Umschaltbar, Einstellung wird gespeichert.
- **PWA**: Installierbar als App auf Mobilgeräten (inkl. Service Worker).

## Technologien

- **Next.js** (React, App Router)
- **TypeScript**
- **TailwindCSS**
- **Radix UI** Komponenten
- **Vite** (für Tests)
- **Vitest** (Testing)
- **sonner** (Toasts)
- **lucide-react** (Icons)

## Installation & Setup

1. **Repository klonen**
   ```sh
   git clone https://github.com/mleem97/teacherbuddy.git
   cd teacherbuddy
   ```

2. **Abhängigkeiten installieren**
   ```sh
   npm install
   ```

3. **Entwicklungsserver starten**
   ```sh
   npm run dev
   ```
   Die App ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

4. **Tests ausführen**
   ```sh
   npm run test
   ```

## Nutzung

- **Klasse anlegen**: Über das Klassenmenü neue Klasse erstellen.
- **Schüler:innen hinzufügen**: Namen einzeln oder per CSV importieren.
- **Anwesenheit, Beteiligung, Hausaufgaben**: Pro Stunde dokumentieren.
- **Gruppen bilden**: Im Gruppen-Tool mit/ohne Constraints Gruppen generieren.
- **Statistiken**: Im Statistikbereich Auswertungen einsehen.

## Autor

- **mleem97** ([GitHub](https://github.com/mleem97))

## Lizenz

MIT
