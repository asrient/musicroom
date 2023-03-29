import asyncio

class Songs():
    async def search_songs(self, search_query: str, limit: int, fast: bool = False) -> list:
        aiohttp = self.aiohttp
        endpoints = self.api_endpoints
        errors = self.errors
        headers = {
           'deviceid': 'webiste',
            'devicetype': 'GaanaWapApp',
            'gaanaappversion': 'gaanaAndroid-8.37.0',
            'origin': 'https://gaana.com',
            'pragma': 'no-cache',
            'referer': 'https://gaana.com/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'sec-gpc': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
        }
        response = await aiohttp.get(endpoints.search_songs_url + search_query+"&content_filter=2&include=allItems&isRegSrch=0&webVersion=mix&rType=web&usrLang=Hindi,English,Bengali&isChrome=1", headers=headers)
        result = await response.json()
        tracks_raw = []
        track_ids = set()
        for grp in result['gr']:
           for item in grp['gd']:
              try:
                if item['ty'] == 'Track' and item['seo'] not in track_ids:
                  tracks_raw.append(item)
                  track_ids.add(item['seo'])
                  limit-=1
                  if limit <= 0:
                    break
              except (IndexError, TypeError, KeyError):
                pass
        if len(tracks_raw) == 0:
          return await errors.no_results()
        if fast:
          return [self.format_search_result(i) for i in tracks_raw]
        track_info = await self.get_track_info([i['seo'] for i in tracks_raw])
        return track_info

    async def get_track_info(self, track_id: list) -> list:
        aiohttp = self.aiohttp
        endpoints = self.api_endpoints
        track_info = []
        for i in track_id:
          response = await aiohttp.post(endpoints.song_details_url + i)
          result = await response.json()
          try:
            track_info.extend(await asyncio.gather(*[self.format_json_songs(i) for i in result['tracks']]))
          except Exception as e:
            print('error getting track info', i, e)
            pass
        return track_info

    def format_search_result(self, result: dict) -> dict:
        data = {}
        data['seokey'] = result['seo']
        data['title'] = result['ti']
        data['artists'] = ', '.join(result['sti'].split(','))
        data['language'] = result['language']
        data['song_url'] = f"https://gaana.com/song/{data['seokey']}"
        data['images'] = {'urls': {}}
        data['images']['urls']['medium_artwork'] = result['aw']
        return data

    async def format_json_songs(self, results: dict) -> dict:
        functions = self.functions
        errors = self.errors
        data = {}
        try:
          data['seokey'] = results['seokey']
        except KeyError:
          return await errors.invalid_seokey()
        data['album_seokey'] = results['albumseokey']
        data['track_id'] = results['track_id']
        data['title'] = results['track_title']
        data['artists'] = await functions.findArtistNames(results['artist'])
        data['artist_seokeys'] = await functions.findArtistSeoKeys(results['artist'])
        data['artist_ids'] = await functions.findArtistIds(results['artist'])
        data['artist_image'] = (results['artist_detail'][0]['atw'])
        data['album'] = results['album_title']
        data['album_id'] = results['album_id']
        data['duration'] = results['duration']
        data['popularity'] = results['popularity']
        data['genres'] = await functions.findGenres(results['gener'])
        data['is_explicit'] = results['parental_warning']
        data['language'] = results['language']
        data['label'] = results['vendor_name']
        data['release_date'] = results['release_date']
        data['play_count'] = results['play_ct']
        data['favorite_count'] = results['total_favourite_count']
        data['song_url'] = f"https://gaana.com/song/{data['seokey']}"
        data['album_url'] = f"https://gaana.com/album/{data['album_seokey']}"
        data['images'] = {'urls': {}}
        data['images']['urls']['large_artwork'] = (results['artwork_large'])
        data['images']['urls']['medium_artwork'] = (results['artwork_web'])
        data['images']['urls']['small_artwork'] = (results['artwork'])
        data['stream_urls'] = {'urls': {}}
        try:
          data['stream_urls']['urls']['high_quality'] = (await functions.decryptLink(results['urls']['high']['message']))
        except KeyError:
          data['stream_urls']['urls']['high_quality'] = ""
        data['stream_urls']['urls']['medium_quality'] = (await functions.decryptLink(results['urls']['medium']['message']))
        data['stream_urls']['urls']['low_quality'] = (await functions.decryptLink(results['urls']['medium']['message'])).replace("64.mp4", "16.mp4")
        return data