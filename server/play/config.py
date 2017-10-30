import os

API_KEY = os.getenv("GOOGLE_API_KEY", "")
API_YOUTUBE_VIDEOS = "https://www.googleapis.com/youtube/v3/videos"

REDIS_KEY = "playlist"
DIVISION_KEY = "<fuck>"
REDIS_DOPE_KEY = "dopelist"
REDIS_RANDOM_KEY = "randomlist"

DEFAULT_VIDEO_ID = 'LfzRlnfl09Q'
DEFAULT_VIDEO_TITLE = 'Silicon Valley: The Soundtrack'
DEFAULT_VIDEO_DURATION = '165'

DEFAULT_VALUE = DEFAULT_VIDEO_ID + DIVISION_KEY + DEFAULT_VIDEO_TITLE + DIVISION_KEY + DEFAULT_VIDEO_DURATION

SLACK_URL = os.getenv("PLAY_SLACK_URL", "")
