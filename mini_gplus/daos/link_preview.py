from mini_gplus.models import LinkPreview, LinkPreviewState


def get_link_preview(url: str) -> LinkPreview:
    lp = LinkPreview.objects.get(url=url)
    if not lp:
        new_lp = LinkPreview(
            url=url,
            state=LinkPreviewState.Fetching
        )
        # TODO: kick background worker to fetch
        return new_lp
    return lp
