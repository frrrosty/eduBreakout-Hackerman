# EDU Breakout «Hackerman»: Hackermans Cave

Begleitseite zum EDU Breakout «Hackerman», einem Escape-Spiel zur Informatik im Zyklus 2. Die Seite ersetzt das frühere WordPress auf `hackerman.mius.ch`: statisch, ohne PHP und ohne Datenbank.

## Aufbau

```
site/                         was auf den Server kommt
  index.html                  Videobotschaft, mit dem versteckten Link (Rätsel 2.1)
  ressourcen/                 Werkzeugkiste als Karten, je Werkzeug eine Seite
    rainbow-table/            Rätsel 2.3, durchsuchbar
    caesarscheibe/            Rätsel 2.7, drehbar
    binaerzahlen/             Rätsel 2.4, Binärkarten
    pixelraster/              Rätsel 2.5, 8 × 8 zum Ausmalen
  des-raetsels-loesung/       Rätsel 2.10, Lösung verschlüsselt in geheim.json
  404.html, .htaccess, robots.txt
  assets/                     cave.css, cave.js, Schriften (OFL), Favicon
werkzeug/
  loesung_verschluesseln.py   schreibt geheim.json
  vorschau.py                 lokale Vorschau mit derselben CSP wie Hostpoint
tests/                        pytest
```

## Grundsätze

- **Die alten Adressen bleiben**: `/`, `/ressourcen/`, `/des-raetsels-loesung/`. Die Handreichung verweist darauf.
- **Werkzeuge helfen beim Denken, sie nehmen das Rätsel nicht ab.** Kein Base64-Decoder, kein ROT-Übersetzer, kein Binärrechner, sonst löst die Seite die Rätsel statt die Kinder.
- **Kein fremder Server ohne Klick.** YouTube lädt erst nach einem Klick, über `youtube-nocookie.com`. Schriften liegen auf dem eigenen Server.
- **Die Lösung steht nie im Klartext im Repo.** `geheim.json` enthält nur Salz, IV und den mit AES-GCM verschlüsselten Inhalt. Der Schlüssel entsteht im Browser aus dem eingegebenen Passwort (PBKDF2-SHA256, 300 000 Runden).

## Lokal

```bash
pip install -r requirements.txt
python werkzeug/vorschau.py          # http://localhost:8720
python -m pytest -q tests
```

Lösung neu verschlüsseln, zum Beispiel bei einem neuen Passwort:

```bash
python werkzeug/loesung_verschluesseln.py
```

Das Skript fragt nach Passwort und YouTube-ID und prüft das Ergebnis selbst.

## Rainbow Table

Die Einträge sind aus dem früheren PDF übernommen und nachgerechnet (SHA-1, MD4, Base64). Korrigiert wurde eine Zeile: Für «PASSWORD» stand die Base64-Kodierung von «password». Richtig ist `UEFTU1dPUkQ=`.

## Ausliefern

`.github/workflows/deploy.yml` lädt `site/` bei jedem Push auf `main` per rsync nach Hostpoint. Solange die Secrets fehlen, wird nur geprüft. Einrichtung wie bei den anderen Projekten auf dem Konto: eigener Deploy-Schlüssel, auf dem Server mit `rrsync` auf den Webordner beschränkt, fester Fingerabdruck im Secret `SSH_KNOWN_HOSTS`, absoluter Pfad in `SSH_TARGET_DIR`.
