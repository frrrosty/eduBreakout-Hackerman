// Hackermans Cave: kleine Werkzeuge ohne Bibliotheken und ohne fremde Server.
// Jede Funktion prüft selbst, ob ihr Element auf der Seite steht.
'use strict'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- Fackeln als Pixelbild ----------
const FACKEL = [
  '....rr..r...',
  '...rorr.rr..',
  '..rooyorrr..',
  '.rrooyyoorr.',
  '.royyyyyoor.',
  '.royywyyyor.',
  '..ryywwyyr..',
  '..rooyyoor..',
  '.bbbbbbbbbb.',
  '.dddddddddd.',
  '..cccccccc..',
  '..ccddddcc..',
  '...cccccc...',
  '...cddddc...',
  '...cccccc...',
  '...cddddc...',
  '...cccccc...',
  '...cddddc...',
  '...cccccc...',
  '....cccc....',
  '.....dd.....',
]
const FARBE = { r: '#d8401f', o: '#f2801b', y: '#ffd24a', w: '#fff4c0', b: '#8c8c8c', d: '#6b5a44', c: '#cdb48c' }
function fackeln () {
  $$('canvas.fackel').forEach((cv, i) => {
    const g = cv.getContext('2d'); cv.width = 12; cv.height = FACKEL.length
    const male = (t) => {
      g.clearRect(0, 0, 12, FACKEL.length)
      FACKEL.forEach((zeile, y) => [...zeile].forEach((z, x) => {
        if (z === '.') return
        let f = FARBE[z]
        // Flamme flackert: einzelne Pixel wechseln zufällig die Farbe
        if (y < 8 && !ruhig && Math.random() < 0.18) f = [FARBE.r, FARBE.o, FARBE.y][(x + y + t) % 3]
        g.fillStyle = f; g.fillRect(x, y, 1, 1)
      }))
    }
    male(0)
    if (!ruhig) { let t = i; setInterval(() => male(++t), 160) }
  })
}

// ---------- Tippende Zeile ----------
function tippen () {
  $$('[data-tippen]').forEach((el) => {
    const text = el.dataset.tippen
    if (ruhig) { el.textContent = text; return }
    let i = 0
    const schritt = () => { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(schritt, 35 + Math.random() * 45) }
    schritt()
  })
}

// ---------- Video erst nach Klick laden ----------
function zeigeVideo (huelle, id) {
  const knopf = document.createElement('button')
  knopf.type = 'button'
  knopf.innerHTML = '<span class="spiel">▶ Video abspielen</span><small>Beim Abspielen wird das Video von YouTube geladen. Dabei erhält Google deine IP-Adresse.</small>'
  knopf.addEventListener('click', () => {
    const f = document.createElement('iframe')
    f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`
    f.title = huelle.dataset.titel || 'Video'
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
    f.referrerPolicy = 'strict-origin-when-cross-origin'
    huelle.replaceChildren(f)
  })
  huelle.replaceChildren(knopf)
}
function videos () { $$('.video[data-video]').forEach((v) => zeigeVideo(v, v.dataset.video)) }

// ---------- Rainbow Table durchsuchen ----------
function rainbow () {
  const feld = $('#rainbow-suche'); if (!feld) return
  const zeilen = $$('#rainbow tbody tr')
  const anzahl = $('#rainbow-anzahl')
  const filtern = () => {
    const q = feld.value.trim().toLowerCase()
    let n = 0
    zeilen.forEach((tr) => {
      const passt = !q || tr.textContent.toLowerCase().includes(q)
      tr.hidden = !passt
      tr.classList.toggle('treffer', !!q && passt)
      if (passt) n++
    })
    anzahl.textContent = q ? `${n} von ${zeilen.length} Einträgen` : `${zeilen.length} Einträge`
  }
  feld.addEventListener('input', filtern)
  filtern()
}

// ---------- Cäsarscheibe ----------
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function caesar () {
  const svg = $('#scheibe'); if (!svg) return
  const NS = 'http://www.w3.org/2000/svg'
  const mk = (tag, attr) => { const e = document.createElementNS(NS, tag); for (const k in attr) e.setAttribute(k, attr[k]); return e }
  const ring = (r1, r2, farbeFeld, farbeText, gross) => {
    const g = mk('g', {})
    ABC.split('').forEach((b, i) => {
      const w = (i * 360 / 26 - 90 - 360 / 52) * Math.PI / 180, w2 = w + 2 * Math.PI / 26
      const p = (r, a) => `${200 + r * Math.cos(a)} ${200 + r * Math.sin(a)}`
      g.append(mk('path', { d: `M${p(r1, w)} A${r1} ${r1} 0 0 1 ${p(r1, w2)} L${p(r2, w2)} A${r2} ${r2} 0 0 0 ${p(r2, w)}Z`, fill: farbeFeld, stroke: '#2f7a22' }))
      const m = w + Math.PI / 26, rm = (r1 + r2) / 2
      const t = mk('text', { x: 200 + rm * Math.cos(m), y: 200 + rm * Math.sin(m), fill: farbeText, transform: `rotate(${i * 360 / 26} ${200 + rm * Math.cos(m)} ${200 + rm * Math.sin(m)})`, 'font-size': gross })
      t.textContent = b; g.append(t)
    })
    return g
  }
  svg.append(ring(196, 150, '#000', '#6cf34a', 17))
  const innen = ring(148, 104, '#0d1a0b', '#fff', 14)
  innen.append(mk('circle', { cx: 200, cy: 200, r: 102, fill: '#111', stroke: '#2f7a22' }))
  innen.append(mk('circle', { cx: 200, cy: 200, r: 8, fill: '#8c8c8c' }))
  svg.append(innen)
  svg.append(mk('path', { d: 'M200 2 L192 -10 L208 -10Z', fill: '#ffd24a' }))

  let n = 0
  const anzeige = $('#verschiebung')
  const setze = (neu) => {
    n = ((neu % 26) + 26) % 26
    innen.setAttribute('transform', `rotate(${n * 360 / 26} 200 200)`)
    // Wie in der Handreichung: Bei ROT-7 steht innen T unter dem äusseren A.
    anzeige.textContent = `ROT-${n}`
    $('#scheibe-hinweis').textContent = `Aussen A, innen ${ABC[(26 - n) % 26]}`
  }
  $('#links').addEventListener('click', () => setze(n - 1))
  $('#rechts').addEventListener('click', () => setze(n + 1))
  $('#zurueck').addEventListener('click', () => setze(0))
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setze(n - 1); e.preventDefault() }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setze(n + 1); e.preventDefault() }
  })
  // Ziehen mit Maus oder Finger
  let start = null
  const winkel = (e) => { const r = svg.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI }
  svg.addEventListener('pointerdown', (e) => { start = { w: winkel(e), n }; svg.setPointerCapture(e.pointerId) })
  svg.addEventListener('pointermove', (e) => { if (start) setze(start.n + Math.round((winkel(e) - start.w) / (360 / 26))) })
  svg.addEventListener('pointerup', () => { start = null })
  setze(0)
}

// ---------- Binärkarten ----------
function binaer () {
  const feld = $('#binaer'); if (!feld) return
  const werte = [64, 32, 16, 8, 4, 2, 1]
  const summe = $('#binaer-summe')
  const karten = werte.map((w) => {
    const b = document.createElement('button')
    b.type = 'button'; b.className = 'bitkarte'; b.setAttribute('aria-pressed', 'false')
    b.setAttribute('aria-label', `Karte ${w}`)
    b.innerHTML = `<span class="wert">${w}</span><span class="punkte">${'<i></i>'.repeat(Math.min(w, 64))}</span><span class="bit">0</span>`
    b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); rechne() })
    feld.append(b); return b
  })
  const rechne = () => {
    const bits = karten.map((k) => k.getAttribute('aria-pressed') === 'true' ? 1 : 0)
    karten.forEach((k, i) => { $('.bit', k).textContent = bits[i] })
    const z = bits.reduce((s, bit, i) => s + bit * werte[i], 0)
    summe.textContent = `${bits.join('')}  =  ${z}`
  }
  $('#binaer-leeren').addEventListener('click', () => { karten.forEach((k) => k.setAttribute('aria-pressed', 'false')); rechne() })
  rechne()
}

// ---------- Pixelraster ----------
function raster () {
  const feld = $('#raster'); if (!feld) return
  const FARBEN = { s: '#000000', w: '#ffffff', g: '#2bb24c', r: '#e2362b' }
  let aktiv = 's'
  $$('.farbe').forEach((b) => b.addEventListener('click', () => {
    aktiv = b.dataset.farbe
    $$('.farbe').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  }))
  const n = 8
  feld.style.setProperty('--n', n)
  let malen = false
  for (let i = 0; i < n * n; i++) {
    const z = document.createElement('button')
    z.type = 'button'; z.dataset.farbe = 'w'
    z.setAttribute('aria-label', `Zeile ${Math.floor(i / n) + 1}, Feld ${i % n + 1}`)
    const setze = () => { z.dataset.farbe = aktiv; z.style.background = FARBEN[aktiv] }
    z.addEventListener('pointerdown', (e) => { malen = true; setze(); e.preventDefault() })
    z.addEventListener('pointerenter', () => { if (malen) setze() })
    z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { setze(); e.preventDefault() } })
    feld.append(z)
  }
  window.addEventListener('pointerup', () => { malen = false })
  $('#raster-leeren').addEventListener('click', () => $$('button', feld).forEach((z) => { z.dataset.farbe = 'w'; z.style.background = '' }))
}

// ---------- Des Rätsels Lösung: im Browser entschlüsseln ----------
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
async function loesung () {
  const form = $('#schloss'); if (!form) return
  const meldung = $('#meldung')
  let geheim
  try { geheim = await (await fetch('geheim.json', { cache: 'no-store' })).json() } catch { meldung.textContent = 'Die Verbindung zur Höhle ist gestört. Lade die Seite neu.'; return }
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const wort = $('#passwort').value.trim()
    if (!wort) return
    meldung.className = 'meldung'; meldung.textContent = '> Prüfe …'
    try {
      const roh = await crypto.subtle.importKey('raw', new TextEncoder().encode(wort), 'PBKDF2', false, ['deriveKey'])
      const schluessel = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: b64(geheim.salz), iterations: geheim.runden, hash: 'SHA-256' },
        roh, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
      const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(geheim.iv) }, schluessel, b64(geheim.daten))
      const inhalt = JSON.parse(new TextDecoder().decode(klar))
      meldung.className = 'meldung gut'; meldung.textContent = '> ZUGRIFF GEWÄHRT. GG.'
      const v = $('#siegesvideo'); v.hidden = false; v.dataset.titel = inhalt.titel || 'Siegesbotschaft'
      zeigeVideo(v, inhalt.video)
      form.hidden = true
    } catch {
      meldung.className = 'meldung fehler'; meldung.textContent = '> ZUGRIFF VERWEIGERT. Falsches Passwort.'
    }
  })
}

// ---------- Hilfen für die neuen Werkzeuge ----------
const neu = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e }
let tonKontext = null
function ton (dauer, start = 0) {
  try {
    tonKontext = tonKontext || new (window.AudioContext || window.webkitAudioContext)()
    const t = tonKontext.currentTime + start
    const o = tonKontext.createOscillator(), g = tonKontext.createGain()
    o.frequency.value = 640; o.type = 'sine'
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.01)
    g.gain.setValueAtTime(0.25, t + dauer - 0.01); g.gain.linearRampToValueAtTime(0, t + dauer)
    o.connect(g).connect(tonKontext.destination); o.start(t); o.stop(t + dauer)
  } catch { /* ohne Ton geht es auch */ }
}

// ---------- Morsecode: Tafel und Taste, bewusst ohne Übersetzer ----------
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----' }
const zeigeMorse = (code) => code.replace(/\./g, '·').replace(/-/g, '−')
function morse () {
  const tafel = $('#morse-tafel'); if (!tafel) return
  const E = 0.09
  Object.entries(MORSE).forEach(([b, code]) => {
    const k = neu('button', 'morse-zeichen'); k.type = 'button'
    k.append(neu('b', '', b), neu('span', '', zeigeMorse(code)))
    k.setAttribute('aria-label', `${b} anhören`)
    k.addEventListener('click', () => { let t = 0; [...code].forEach((z) => { const d = z === '.' ? E : 3 * E; ton(d, t); t += d + E }) })
    tafel.append(k)
  })
  const taste = $('#morse-taste'), signal = $('#morse-signal')
  let zeichen = '', start = 0, oszi = null
  const zeige = () => { signal.textContent = zeigeMorse(zeichen) || ' ' }
  const runter = () => {
    if (start) return
    start = performance.now(); taste.classList.add('gedrueckt')
    try {
      tonKontext = tonKontext || new (window.AudioContext || window.webkitAudioContext)()
      oszi = tonKontext.createOscillator(); const g = tonKontext.createGain(); g.gain.value = 0.25
      oszi.frequency.value = 640; oszi.connect(g).connect(tonKontext.destination); oszi.start()
    } catch { oszi = null }
  }
  const hoch = () => {
    if (!start) return
    const dauer = performance.now() - start; start = 0; taste.classList.remove('gedrueckt')
    if (oszi) { oszi.stop(); oszi = null }
    zeichen += dauer < 250 ? '.' : '-'; zeige()
  }
  taste.addEventListener('pointerdown', (e) => { e.preventDefault(); runter() })
  window.addEventListener('pointerup', hoch)
  taste.addEventListener('pointerleave', hoch)
  document.addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.repeat && !/INPUT|TEXTAREA|BUTTON/.test(e.target.tagName)) { e.preventDefault(); runter() } })
  document.addEventListener('keyup', (e) => { if (e.code === 'Space' && !/INPUT|TEXTAREA|BUTTON/.test(e.target.tagName)) hoch() })
  $('#morse-luecke').addEventListener('click', () => { if (zeichen && !zeichen.endsWith(' / ')) zeichen += ' / '; zeige() })
  $('#morse-leeren').addEventListener('click', () => { zeichen = ''; zeige() })
  zeige()
}

// ---------- Freimaurer-Code: Schlüssel und Schreibtafel ----------
// A bis I im ersten Gitter, J bis R im Gitter mit Punkt, S bis V im Kreuz, W bis Z im Kreuz mit Punkt.
function pigpenSvg (b) {
  const i = ABC.indexOf(b); if (i < 0) return ''
  const linie = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`
  let striche = '', punkt = null
  if (i < 18) {
    const p = i % 9, r = Math.floor(p / 3), c = p % 3
    if (r > 0) striche += linie(6, 6, 34, 6)
    if (r < 2) striche += linie(6, 34, 34, 34)
    if (c > 0) striche += linie(6, 6, 6, 34)
    if (c < 2) striche += linie(34, 6, 34, 34)
    if (i >= 9) punkt = [20, 20]
  } else {
    const p = (i - 18) % 4 // 0 oben, 1 links, 2 rechts, 3 unten
    const formen = [
      [linie(6, 8, 20, 32), linie(20, 32, 34, 8), [20, 16]],
      [linie(8, 6, 32, 20), linie(32, 20, 8, 34), [16, 20]],
      [linie(32, 6, 8, 20), linie(8, 20, 32, 34), [24, 20]],
      [linie(6, 32, 20, 8), linie(20, 8, 34, 32), [20, 24]],
    ]
    striche = formen[p][0] + formen[p][1]
    if (i >= 22) punkt = formen[p][2]
  }
  const kreis = punkt ? `<circle cx="${punkt[0]}" cy="${punkt[1]}" r="3.2"/>` : ''
  return `<svg viewBox="0 0 40 40" class="pigpen" aria-hidden="true"><g>${striche}</g>${kreis}</svg>`
}
function freimaurer () {
  const schluessel = $('#pigpen-schluessel'); if (!schluessel) return
  ABC.split('').forEach((b) => {
    const k = neu('div', 'pigpen-paar'); k.innerHTML = pigpenSvg(b); k.append(neu('b', '', b)); schluessel.append(k)
  })
  const text = $('#pigpen-text'), tasten = $('#pigpen-tasten')
  const botschaft = []
  const zeige = () => {
    text.replaceChildren(...botschaft.map((b) => { const z = neu('span', b === ' ' ? 'pigpen-luecke' : 'pigpen-zeichen'); if (b !== ' ') z.innerHTML = pigpenSvg(b); return z }))
    text.setAttribute('aria-label', `${botschaft.filter((b) => b !== ' ').length} Zeichen geschrieben`)
  }
  ABC.split('').forEach((b) => {
    const k = neu('button', 'knopf', b); k.type = 'button'
    k.addEventListener('click', () => { if (botschaft.length < 60) botschaft.push(b); zeige() })
    tasten.append(k)
  })
  $('#pigpen-luecke').addEventListener('click', () => { if (botschaft.length && botschaft.at(-1) !== ' ') botschaft.push(' '); zeige() })
  $('#pigpen-zurueck').addEventListener('click', () => { botschaft.pop(); zeige() })
  $('#pigpen-leeren').addEventListener('click', () => { botschaft.length = 0; zeige() })
  zeige()
}

// ---------- Skytale: Botschaft auf den Stab schreiben ----------
function skytale () {
  const feld = $('#skytale-text'); if (!feld) return
  const regler = $('#skytale-dicke'), stab = $('#skytale-stab'), streifen = $('#skytale-streifen')
  const zeichne = () => {
    const n = Number(regler.value)
    $('#skytale-zahl').textContent = n
    const text = feld.value.toUpperCase().replace(/[^A-ZÄÖÜ0-9]/g, '')
    const breite = Math.max(1, Math.ceil(text.length / n))
    const voll = text.padEnd(breite * n, '·')
    // Geschrieben wird der Länge nach (Zeile für Zeile), gelesen wird der Streifen Spalte für Spalte.
    stab.replaceChildren(...Array.from({ length: n }, (_, z) => {
      const tr = neu('tr')
      for (let s = 0; s < breite; s++) tr.append(neu('td', `windung-${z % 4}`, voll[z * breite + s]))
      return tr
    }))
    streifen.replaceChildren()
    for (let s = 0; s < breite; s++) for (let z = 0; z < n; z++) streifen.append(neu('span', `windung-${z % 4}`, voll[z * breite + s]))
  }
  feld.addEventListener('input', zeichne); regler.addEventListener('input', zeichne)
  zeichne()
}

// ---------- Farbmischer ----------
function farbmischer () {
  const feld = $('#farbfeld'); if (!feld) return
  const regler = $$('[data-kanal]'), tabelle = $('#farb-zahlen')
  const zeichne = () => {
    const w = regler.map((r) => Number(r.value))
    const hex = '#' + w.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()
    feld.style.background = hex
    const zeile = (titel, werte) => { const tr = neu('tr'); tr.append(neu('th', '', titel), ...werte.map((x) => neu('td', '', x))); return tr }
    tabelle.replaceChildren(
      zeile('', ['Rot', 'Grün', 'Blau']),
      zeile('Zahl', w.map(String)),
      zeile('Binär', w.map((x) => x.toString(2).padStart(8, '0'))),
      zeile('Hex', w.map((x) => x.toString(16).padStart(2, '0').toUpperCase())),
    )
    feld.textContent = hex
    feld.style.color = (w[0] * 0.3 + w[1] * 0.59 + w[2] * 0.11) > 140 ? '#000' : '#fff'
  }
  regler.forEach((r) => r.addEventListener('input', zeichne))
  zeichne()
}

// ---------- Sortiernetz für sechs Zahlen ----------
const NETZ = [[[0, 5], [1, 3], [2, 4]], [[1, 2], [3, 4]], [[0, 3], [2, 5]], [[0, 1], [2, 3], [4, 5]], [[1, 2], [3, 4]]]
function sortiere (start) {
  const stufen = [start.slice()]
  NETZ.forEach((schicht) => {
    const a = stufen.at(-1).slice()
    schicht.forEach(([o, u]) => { if (a[o] > a[u]) [a[o], a[u]] = [a[u], a[o]] })
    stufen.push(a)
  })
  return stufen
}
function sortiernetz () {
  const svg = $('#sortiernetz'); if (!svg) return
  const y = (i) => 30 + i * 54, xs = (k) => 40 + k * 112, xb = (k, j, n) => xs(k) + 56 + (j - (n - 1) / 2) * 16
  let stufen, schritt
  const zufall = () => { const z = new Set(); while (z.size < 6) z.add(1 + Math.floor(Math.random() * 99)); return [...z] }
  const zeichne = () => {
    let h = ''
    for (let i = 0; i < 6; i++) h += `<line class="draht" x1="20" y1="${y(i)}" x2="620" y2="${y(i)}"/>`
    NETZ.forEach((schicht, k) => schicht.forEach(([o, u], j) => {
      const x = xb(k, j, schicht.length), aktiv = k === schritt - 1 ? ' aktiv' : ''
      h += `<line class="bruecke${aktiv}" x1="${x}" y1="${y(o)}" x2="${x}" y2="${y(u)}"/><circle class="knoten${aktiv}" cx="${x}" cy="${y(o)}" r="5"/><circle class="knoten${aktiv}" cx="${x}" cy="${y(u)}" r="5"/>`
    }))
    stufen[schritt].forEach((w, i) => { h += `<rect class="marke" x="${xs(schritt) - 22}" y="${y(i) - 16}" width="44" height="32"/><text class="zahl" x="${xs(schritt)}" y="${y(i)}">${w}</text>` })
    svg.innerHTML = h
    $('#netz-stand').textContent = schritt === 0 ? 'Start: ' + stufen[0].join(' · ') : schritt === NETZ.length ? 'Sortiert: ' + stufen[schritt].join(' · ') : `Nach Brücke ${schritt} von ${NETZ.length}`
    $('#netz-schritt').disabled = schritt === NETZ.length
  }
  const neustart = () => { stufen = sortiere(zufall()); schritt = 0; zeichne() }
  $('#netz-schritt').addEventListener('click', () => { if (schritt < NETZ.length) { schritt++; zeichne() } })
  $('#netz-anfang').addEventListener('click', () => { schritt = 0; zeichne() })
  $('#netz-neu').addEventListener('click', neustart)
  neustart()
}

// ---------- Richtungscode im Labyrinth ----------
const LABYRINTHE = [
  ['#######', '#S#...#', '#.#.#.#', '#...#.#', '###.#.#', '#Z..#.#', '#######'],
  ['#######', '#S....#', '#####.#', '#.....#', '#.#####', '#....Z#', '#######'],
  ['#########', '#S..#...#', '##.##.#.#', '#..#..#.#', '#.##.##.#', '#....#..#', '####.#.##', '#Z...#..#', '#########'],
]
const SCHRITT = { O: [-1, 0], U: [1, 0], L: [0, -1], R: [0, 1] }
const PFEIL = { O: '▲', U: '▼', L: '◀', R: '▶' }
function richtungscode () {
  const feld = $('#labyrinth'); if (!feld) return
  const anzeige = $('#programm'), meldung = $('#programm-meldung')
  let karte, start, figur, programm = [], laeuft = false
  const finde = (z) => { for (let r = 0; r < karte.length; r++) { const c = karte[r].indexOf(z); if (c >= 0) return [r, c] } }
  const zeichne = () => {
    feld.style.setProperty('--n', karte[0].length)
    feld.replaceChildren(...karte.flatMap((zeile, r) => [...zeile].map((z, c) => {
      const d = neu('div', z === '#' ? 'wand' : 'weg')
      if (z === 'Z') d.textContent = '◆'
      if (figur[0] === r && figur[1] === c) { d.textContent = '☺'; d.classList.add('figur') }
      return d
    })))
    anzeige.textContent = programm.length ? programm.map((b) => PFEIL[b]).join(' ') : 'Noch kein Programm.'
  }
  const laden = (i) => { karte = LABYRINTHE[i]; start = finde('S'); figur = start.slice(); programm = []; meldung.textContent = ''; meldung.className = 'meldung'; zeichne() }
  $$('[data-befehl]').forEach((b) => b.addEventListener('click', () => { if (!laeuft && programm.length < 40) { programm.push(b.dataset.befehl); zeichne() } }))
  $('#programm-zurueck').addEventListener('click', () => { if (!laeuft) { programm.pop(); zeichne() } })
  $('#programm-leeren').addEventListener('click', () => { if (!laeuft) { programm = []; figur = start.slice(); meldung.textContent = ''; zeichne() } })
  $('#level').addEventListener('change', (e) => { if (!laeuft) laden(Number(e.target.value)) })
  $('#programm-los').addEventListener('click', async () => {
    if (laeuft || !programm.length) return
    laeuft = true; figur = start.slice(); meldung.className = 'meldung'; meldung.textContent = '> Programm läuft …'; zeichne()
    const warte = () => new Promise((ok) => setTimeout(ok, ruhig ? 60 : 380))
    let ergebnis = 'ende'
    for (const b of programm) {
      await warte()
      const [dr, dc] = SCHRITT[b], r = figur[0] + dr, c = figur[1] + dc
      if (karte[r][c] === '#') { ergebnis = 'wand'; break }
      figur = [r, c]; zeichne()
    }
    if (ergebnis === 'wand') { meldung.className = 'meldung fehler'; meldung.textContent = '> Autsch, eine Wand. Wo ist der Fehler im Programm?' } else if (karte[figur[0]][figur[1]] === 'Z') { meldung.className = 'meldung gut'; meldung.textContent = `> Schatz gefunden mit ${programm.length} Befehlen. Geht es kürzer?` } else { meldung.className = 'meldung fehler'; meldung.textContent = '> Das Programm ist fertig, aber der Schatz ist noch nicht erreicht.' }
    laeuft = false
  })
  laden(0)
}

// ---------- Paritätstrick ----------
function paritaet () {
  const feld = $('#paritaet'); if (!feld) return
  const N = 6, meldung = $('#paritaet-meldung')
  let karten, ergaenzt
  feld.style.setProperty('--n', N)
  const knoepfe = Array.from({ length: N * N }, (_, i) => {
    const b = neu('button'); b.type = 'button'
    const r = Math.floor(i / N), c = i % N
    b.setAttribute('aria-label', `Reihe ${r + 1}, Spalte ${c + 1}`)
    b.addEventListener('click', () => { if (!ergaenzt && (r === N - 1 || c === N - 1)) return; karten[r][c] ^= 1; zeichne(); meldung.textContent = '' ; meldung.className = 'meldung' })
    feld.append(b); return b
  })
  const zeichne = (markiert = []) => knoepfe.forEach((b, i) => {
    const r = Math.floor(i / N), c = i % N, rand = r === N - 1 || c === N - 1
    b.className = karten[r][c] ? 'schwarz' : 'weiss'
    b.hidden = false
    b.classList.toggle('leer', rand && !ergaenzt)
    b.setAttribute('aria-pressed', String(!!karten[r][c]))
    if (markiert.includes(i)) b.classList.add('gefunden')
  })
  const neu5 = () => {
    karten = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r < N - 1 && c < N - 1 && Math.random() < 0.5) ? 1 : 0))
    ergaenzt = false; meldung.className = 'meldung'
    meldung.textContent = '> 25 Karten liegen. Jetzt Reihe und Spalte ergänzen.'
    zeichne()
  }
  $('#paritaet-neu').addEventListener('click', neu5)
  $('#paritaet-ergaenzen').addEventListener('click', () => {
    for (let r = 0; r < N - 1; r++) karten[r][N - 1] = karten[r].slice(0, N - 1).reduce((a, b) => a ^ b, 0)
    for (let c = 0; c < N; c++) karten[N - 1][c] = karten.slice(0, N - 1).reduce((a, z) => a ^ z[c], 0)
    ergaenzt = true; meldung.className = 'meldung'
    meldung.textContent = '> Fertig. Schau weg, und lass jemanden eine einzige Karte umdrehen.'
    zeichne()
  })
  $('#paritaet-finden').addEventListener('click', () => {
    if (!ergaenzt) { meldung.className = 'meldung fehler'; meldung.textContent = '> Zuerst Reihe und Spalte ergänzen.'; return }
    const reihen = karten.map((z, r) => r).filter((r) => karten[r].reduce((a, b) => a ^ b, 0))
    const spalten = karten[0].map((_, c) => c).filter((c) => karten.reduce((a, z) => a ^ z[c], 0))
    if (!reihen.length && !spalten.length) { meldung.className = 'meldung gut'; meldung.textContent = '> Alle Reihen und Spalten haben eine gerade Anzahl Schwarze. Es wurde nichts umgedreht.'; zeichne(); return }
    if (reihen.length === 1 && spalten.length === 1) { meldung.className = 'meldung gut'; meldung.textContent = `> Gefunden: Reihe ${reihen[0] + 1}, Spalte ${spalten[0] + 1}.`; zeichne([reihen[0] * N + spalten[0]]); return }
    meldung.className = 'meldung fehler'; meldung.textContent = '> Hier wurde mehr als eine Karte umgedreht. Das kann der Trick nicht sicher erkennen.'; zeichne()
  })
  neu5()
}

// ---------- Prüfziffer wie beim Strichcode (EAN-13) ----------
function pruefziffer () {
  const feld = $('#ean'); if (!feld) return
  const tabelle = $('#ean-rechnung'), meldung = $('#ean-meldung')
  const rechne = () => {
    const z = feld.value.replace(/\D/g, '').slice(0, 13)
    if (feld.value !== z) feld.value = z
    const ziffern = [...z].map(Number)
    const zeile = (titel, werte, klasse) => { const tr = neu('tr', klasse); tr.append(neu('th', '', titel), ...werte.map((x) => neu('td', '', x))); return tr }
    const erste = ziffern.slice(0, 12), gewicht = erste.map((_, i) => i % 2 ? 3 : 1)
    const produkte = erste.map((x, i) => x * gewicht[i])
    const summe = produkte.reduce((a, b) => a + b, 0)
    const soll = (10 - summe % 10) % 10
    tabelle.replaceChildren(zeile('Ziffer', erste.map(String)), zeile('mal', gewicht.map((g) => `× ${g}`)), zeile('ergibt', produkte.map(String)))
    if (ziffern.length < 13) { meldung.className = 'meldung'; meldung.textContent = `> Noch ${13 - ziffern.length} Ziffern eingeben.`; return }
    const ok = ziffern[12] === soll
    meldung.className = ok ? 'meldung gut' : 'meldung fehler'
    meldung.textContent = `> Summe ${summe}. Bis zum nächsten Zehner fehlen ${soll}. ` + (ok ? `Die Prüfziffer ist ${ziffern[12]}: Die Nummer stimmt.` : `Auf der Nummer steht aber ${ziffern[12]}: Hier stimmt etwas nicht!`)
  }
  feld.addEventListener('input', rechne)
  $('#ean-fehler').addEventListener('click', () => {
    const z = [...feld.value.padEnd(13, '0')], i = Math.floor(Math.random() * 12)
    z[i] = String((Number(z[i]) + 1 + Math.floor(Math.random() * 8)) % 10); feld.value = z.join(''); rechne()
  })
  rechne()
}

$$('[data-drucken]').forEach((b) => b.addEventListener('click', () => window.print()))
fackeln(); tippen(); videos(); rainbow(); caesar(); binaer(); raster(); loesung()
morse(); freimaurer(); skytale(); farbmischer(); sortiernetz(); richtungscode(); paritaet(); pruefziffer()
