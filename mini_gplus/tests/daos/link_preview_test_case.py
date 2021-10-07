import urllib.parse

from .base_test_case import BaseTestCase
from mini_gplus.daos.link_preview import _is_instant_preview


class PaginationTest(BaseTestCase):
    def test_is_instant_preview(self):
        for url in [
            'https://twitter.com/U_S_O/status/1358737558155399169',
            'https://mobile.twitter.com/U_S_O/status/1358737558155399169',
            'https://twitter.com/daily_keke',
            'https://mobile.twitter.com/daily_keke',
            'https://www.youtube.com/watch?v=y8OnoxKotPQ',
            'https://m.youtube.com/watch?v=y8OnoxKotPQ'
        ]:
            self.assertTrue(_is_instant_preview(urllib.parse.urlparse(url)))

        for url in [
            'https://china.kyodonews.net/news/2021/10/625d1318d9e5-6.html'
        ]:
            self.assertFalse(_is_instant_preview(urllib.parse.urlparse(url)))
