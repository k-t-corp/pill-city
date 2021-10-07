import re
import urllib.parse
from urllib.parse import ParseResult
from typing import Optional
from mini_gplus.models import LinkPreview, LinkPreviewState
from mini_gplus.tasks import generate_link_preview

twitter_domains = [
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com"
]
youtube_domains = [
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com"
]
twitter_status_regex = re.compile('^/([a-zA-Z0-9_]{1,15})/status/(\d+)$')
twitter_profile_regex = re.compile('^/([a-zA-Z0-9_]{1,15})$')


def _is_instant_preview(parsed_url: ParseResult) -> bool:
    """
    There are certain sites that provide official preview without backend crawling, e.g. Twitter and YouTube

    :param parsed_url: The parsed url
    :return: Whether the url can be instantly previewed without backend crawling
    """
    # todo: this logic is duplicated with web
    if parsed_url.netloc in twitter_domains:
        if re.match(twitter_status_regex, parsed_url.path):
            return True
        if re.match(twitter_profile_regex, parsed_url.path):
            return True
    if parsed_url.netloc in youtube_domains:
        if parsed_url.path == '/watch' and parsed_url.query.startswith('v='):
            return True
    return False


def get_link_preview(url: str) -> Optional[LinkPreview]:
    try:
        parsed_url = urllib.parse.urlparse(url)
        if _is_instant_preview(parsed_url):
            return None
        link_preview = LinkPreview.objects(url=url)
        if not link_preview:
            new_link_preview = LinkPreview(
                url=url,
                state=LinkPreviewState.Fetching
            )
            generate_link_preview(url)
            return new_link_preview
        return link_preview[0]
    except ValueError:
        return None
