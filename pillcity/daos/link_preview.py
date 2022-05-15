from typing import Optional
from mongoengine.errors import ValidationError
from pillcity.models import LinkPreview, LinkPreviewState
from pillcity.tasks.tasks import generate_link_preview
from pillcity.utils.now import now_seconds

LinkPreviewRefetchIntervalSeconds = 30


def get_link_preview(url: str) -> Optional[LinkPreview]:
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
        if link_preview.state == LinkPreviewState.Errored and \
            (link_preview.last_refetched_seconds == 0 or
             link_preview.last_refetched_seconds + LinkPreviewRefetchIntervalSeconds <= now):
            link_preview.state = LinkPreviewState.Fetching
            link_preview.last_refetched_seconds = now
            link_preview.save()
            generate_link_preview.delay(url)
        return link_preview
    except (ValueError, ValidationError):
        return None
