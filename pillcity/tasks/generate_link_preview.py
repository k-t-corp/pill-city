import os
import random
import urllib.parse
import requests
import linkpreview
from mongoengine import connect, disconnect
from pillcity.models import LinkPreview, LinkPreviewState
from .celery import app, logger

twitter_domains = [
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com"
]


def _is_twitter(url: str) -> bool:
    parsed_url = urllib.parse.urlparse(url)
    if parsed_url.netloc in twitter_domains:
        return True
    return False


def _get_nitter_url(url: str) -> str:
    parsed_url = urllib.parse.urlparse(url)
    parsed_url = parsed_url._replace(netloc=os.environ['NITTER_HOST'])
    return parsed_url.geturl()


use_cloudproxy = os.environ.get('CLOUDPROXY_ENABLED', 'false') == 'true'


def _random_proxy():
    if not use_cloudproxy:
        logger.info("Cloudproxy disabled")
        return {}
    cloudproxy_host = os.environ['CLOUDPROXY_HOST']
    res = requests.get(f"http://{cloudproxy_host}:8000").json()
    if 'ips' not in res or not res['ips']:
        logger.info("No cloudproxy proxy available")
        return {}
    return random.choice(res['ips'])


@app.task()
def generate_link_preview(url: str):
    connect(host=os.environ['MONGODB_URI'])
    logger.info(f'Generating link preview for url {url}')
    link_preview = LinkPreview.objects.get(url=url)  # type: LinkPreview
    try:
        processed_url = url
        if _is_twitter(url):
            processed_url = _get_nitter_url(url)

        proxies = {}
        if link_preview.errored_retries > 0:
            proxies = {"http": _random_proxy(), "https": _random_proxy()}
        preview = linkpreview.link_preview(processed_url, proxies=proxies)

        link_preview.title = preview.title
        link_preview.subtitle = preview.description
        if preview.absolute_image:
            link_preview.image_urls = [preview.absolute_image]
        link_preview.state = LinkPreviewState.Fetched
    except Exception as e:
        logger.warn(str(e))
        link_preview.state = LinkPreviewState.Errored
    link_preview.save()
    disconnect()
