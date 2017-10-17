import re
import urllib
import json

from play import config

def YTDurationToSeconds(duration):
  match = re.match('PT(\d+H)?(\d+M)?(\d+S)?', duration).groups()
  hours = _js_parseInt(match[0]) if match[0] else 0
  minutes = _js_parseInt(match[1]) if match[1] else 0
  seconds = _js_parseInt(match[2]) if match[2] else 0
  return hours * 3600 + minutes * 60 + seconds

# js-like parseInt
# https://gist.github.com/douglasmiranda/2174255
def _js_parseInt(string):
    return int(''.join([x for x in string if x.isdigit()]))

def GetYoutubeItems(vid):
  method = "GET"
  headers = {"Content-Type" : "application/json"}
  fields = "items(snippet(channelId,title,categoryId),contentDetails(duration))"
  part = "snippet,contentDetails"
  url = config.API_YOUTUBE_VIDEOS + "?id=" + vid + "&key=" + config.API_KEY + "&fields=" + fields + "&part=" + part
  req = urllib.request.Request(url, headers=headers, method=method)
  with urllib.request.urlopen(req) as response:
      response_body = response.read().decode("utf-8")
      result_objs = json.loads(response_body)
      # for result_obj in result_objs["items"]:
      return result_objs["items"]

def PostToSlack(text):
  url = config.SLACK_URL
  if url == "":
    return
  method = "POST"
  headers = {"Content-Type" : "application/json"}
  obj = {"text": text, "username": "Play", "icon_emoji": ":musical_score:"}
  json_data = json.dumps(obj).encode("utf-8")
  request = urllib.request.Request(url, data=json_data, method=method, headers=headers)
  with urllib.request.urlopen(request) as response:
      response_body = response.read().decode("utf-8")
      print(response_body)
