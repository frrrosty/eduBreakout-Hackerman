#!/usr/bin/env python3
"""Verschlüsselt die Siegesbotschaft für «Des Rätsels Lösung».

  python werkzeug/loesung_verschluesseln.py

Fragt nach dem Passwort aus der Escape-Kiste und nach der YouTube-ID des
Lösungsvideos und schreibt site/des-raetsels-loesung/geheim.json. Im Repo
liegt danach nur der verschlüsselte Inhalt, nie das Passwort.

Verfahren: Aus dem Passwort wird mit PBKDF2-SHA256 und einem zufälligen Salz
ein Schlüssel abgeleitet, damit wird mit AES-GCM verschlüsselt. Der Browser
macht dasselbe rückwärts (assets/cave.js). Ein falsches Passwort ergibt
einen anderen Schlüssel, und AES-GCM erkennt das an der Prüfsumme.

Grenze: Ohne Server bremst niemand das Durchprobieren von Passwörtern. Die
vielen Runden machen jeden Versuch teuer. Für ein Schulspiel genügt das.
"""
import base64
import getpass
import json
import os
import sys
from pathlib import Path

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

RUNDEN = 300_000
ZIEL = Path(__file__).resolve().parent.parent / 'site' / 'des-raetsels-loesung' / 'geheim.json'


def verschluesseln(passwort: str, inhalt: dict, runden: int = RUNDEN) -> dict:
    salz, iv = os.urandom(16), os.urandom(12)
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salz, iterations=runden)
    schluessel = kdf.derive(passwort.encode('utf-8'))
    daten = AESGCM(schluessel).encrypt(iv, json.dumps(inhalt, ensure_ascii=False).encode('utf-8'), None)
    b = lambda x: base64.b64encode(x).decode('ascii')
    return {'verfahren': 'PBKDF2-SHA256 + AES-256-GCM', 'runden': runden, 'salz': b(salz), 'iv': b(iv), 'daten': b(daten)}


def entschluesseln(passwort: str, geheim: dict) -> dict:
    d = lambda x: base64.b64decode(x)
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=d(geheim['salz']), iterations=geheim['runden'])
    klar = AESGCM(kdf.derive(passwort.encode('utf-8'))).decrypt(d(geheim['iv']), d(geheim['daten']), None)
    return json.loads(klar)


def main() -> int:
    passwort = os.environ.get('LOESUNG_PASSWORT')
    if not passwort:
        passwort = getpass.getpass('Passwort aus der Kiste: ')
        if getpass.getpass('Nochmals: ') != passwort:
            print('Die beiden Eingaben stimmen nicht überein.')
            return 1
    video = os.environ.get('LOESUNG_VIDEO') or input('YouTube-ID des Lösungsvideos: ').strip()
    geheim = verschluesseln(passwort.strip(), {'video': video, 'titel': 'Siegesbotschaft'})
    assert entschluesseln(passwort.strip(), geheim)['video'] == video
    ZIEL.write_text(json.dumps(geheim, indent=2) + '\n', encoding='utf-8')
    print(f'Gespeichert: {ZIEL}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
