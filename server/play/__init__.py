import os
from flask import Flask
from flask_sse import sse

app = Flask(__name__)
if os.getenv("PLAY_ENV") == "docker":
    app.config["REDIS_URL"] = "redis://play_redis"
else:
    app.config["REDIS_URL"] = "redis://localhost"
app.register_blueprint(sse, url_prefix='/stream')

from play import views

from play import electron
app.register_blueprint(electron.app)
