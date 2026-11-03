"""Die Lösung lässt sich mit dem richtigen Passwort öffnen und mit einem falschen nicht."""
import json
import sys
from pathlib import Path

import pytest
from cryptography.exceptions import InvalidTag

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'werkzeug'))
from loesung_verschluesseln import entschluesseln, verschluesseln  # noqa: E402


def test_hin_und_zurueck():
    g = verschluesseln('Test_123', {'video': 'abc'}, runden=1000)
    assert entschluesseln('Test_123', g) == {'video': 'abc'}


def test_falsches_passwort_scheitert():
    g = verschluesseln('Test_123', {'video': 'abc'}, runden=1000)
    with pytest.raises(InvalidTag):
        entschluesseln('test_123', g)


def test_im_repo_kein_klartext():
    datei = Path(__file__).resolve().parent.parent / 'site' / 'des-raetsels-loesung' / 'geheim.json'
    g = json.loads(datei.read_text(encoding='utf-8'))
    assert set(g) == {'verfahren', 'runden', 'salz', 'iv', 'daten'}
    assert g['runden'] >= 100_000
