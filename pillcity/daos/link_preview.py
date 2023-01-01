import logging
import urllib.parse
import ipaddress
from typing import Optional
from mongoengine.errors import ValidationError
from pillcity.models import LinkPreview, LinkPreviewState
from pillcity.tasks.generate_link_preview import generate_link_preview
from pillcity.utils.now import now_seconds


MaxRetries = 15


def is_url_private(url: str):
    parsed_url = urllib.parse.urlparse(url)
    host = parsed_url.hostname
    if host == 'localhost':
        return True
    try:
        ip = ipaddress.ip_address(host)
        return ip.is_private
    except ValueError:
        return False


def get_link_preview(url: str) -> Optional[LinkPreview]:
    if is_url_private(url):
        return None
    try:
        link_previews = LinkPreview.objects(url=url)
        if not link_previews:
            new_link_preview = LinkPreview(
                url=url,
                state=LinkPreviewState.Fetching
            )
            new_link_preview.save()
            generate_link_preview.delay(url)
            return new_link_preview

        link_preview = link_previews[0]  # type: LinkPreview
        now = now_seconds()
        if link_preview.state == LinkPreviewState.Errored:
            if link_preview.errored_retries < MaxRetries:
                if now >= link_preview.errored_next_refetch_seconds:
                    link_preview.errored_next_refetch_seconds = now + (2 ** link_preview.errored_retries)
                    link_preview.errored_retries += 1
                    link_preview.save()
                    generate_link_preview.delay(url)
                else:
                    logging.info(f"Haven't got to the next link preview time for url {url}")
            else:
                logging.info(f"Exhausted link preview retries for url {url}")
        return link_preview
    except (ValueError, ValidationError):
        return None
