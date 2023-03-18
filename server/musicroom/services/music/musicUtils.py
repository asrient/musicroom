import m3u8
from urllib.request import Request, urlopen


def get_duration_from_m3u8(url):
    try:
        plist = m3u8.load(url)
    except Exception as e:
        print('error: get_duration_from_m3u8', e, url)
        return None
    else:
        segments_count = len(plist.segments)
        segment_duration = plist.target_duration
        duration = (segments_count-1)*segment_duration
        last_segment = plist.segments[-1]
        duration += last_segment.duration
        duration = int(duration)
        return duration


def http_get(url):
    request_site = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        content = urlopen(request_site).read()
    except Exception as e:
        print('error: http_get', e, url)
        return None
    else:
        return content