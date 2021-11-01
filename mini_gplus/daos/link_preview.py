from typing import Optional
from mongoengine.errors import ValidationError
from mini_gplus.models import LinkPreview, LinkPreviewState
from mini_gplus.tasks.tasks import generate_link_preview


def get_link_preview(url: str) -> Optional[LinkPreview]:
    try:
        link_preview = LinkPreview.objects(url=url)
        if not link_preview:
            new_link_preview = LinkPreview(
                url=url,
                state=LinkPreviewState.Fetching
            )
            new_link_preview.save()
            generate_link_preview.delay(url)
            return new_link_preview
        return link_preview[0]
    except (ValueError, ValidationError):
        return None
