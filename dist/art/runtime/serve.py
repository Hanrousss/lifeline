from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import webbrowser

root=Path(__file__).resolve().parent.parent
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
url=f'http://127.0.0.1:{server.server_port}/'
print('Lifeline: локальный тест открыт в браузере. Для остановки закройте это окно.')
print(url)
webbrowser.open(url)
try:server.serve_forever()
except KeyboardInterrupt:server.server_close()
