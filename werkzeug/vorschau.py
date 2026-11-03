#!/usr/bin/env python3
"""Lokale Vorschau: python werkzeug/vorschau.py, dann http://localhost:8720

Liefert den Ordner site/ mit derselben Content-Security-Policy wie Hostpoint
aus. So fällt sofort auf, wenn etwas gegen die Regeln verstösst.
"""
import functools
import http.server
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / 'site'
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
       "font-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com; base-uri 'none'; form-action 'self'")


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Content-Security-Policy', CSP)
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (SITE / '404.html').exists():
            body = (SITE / '404.html').read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


if __name__ == '__main__':
    handler = functools.partial(Handler, directory=str(SITE))
    print('Hackermans Cave: http://localhost:8720')
    http.server.ThreadingHTTPServer(('127.0.0.1', 8720), handler).serve_forever()
