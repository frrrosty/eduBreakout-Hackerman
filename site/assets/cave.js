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

$$('[data-drucken]').forEach((b) => b.addEventListener('click', () => window.print()))
fackeln(); tippen(); videos(); rainbow(); caesar(); binaer(); raster(); loesung()
