from .base_test_case import BaseTestCase
from pillcity.daos.content import format_content, FormattedContentType, FormattedContentSegment, FormattedContent
from pillcity.daos.user import sign_up

class ContentTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.user = sign_up('kt233', '123456')

    def test_string_without_any_format(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='Hello, World!',
                        types=set(),
                        reference=-1,
                    )
                ],
                references=[],
            ),
            format_content('Hello, World!'),
        )

    def test_format_in_middle(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='Hello, ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='W',
                        types={FormattedContentType.BOLD},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content=' orld!',
                        types=set(),
                        reference=-1,
                    )
                ],
                references=[],
            ),
            format_content('Hello, *W* orld!'),
        )

    def test_format_at_start(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='W',
                        types={FormattedContentType.BOLD},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content=' orld!',
                        types=set(),
                        reference=-1,
                    )
                ],
                references=[],
            ),
            format_content('*W* orld!'),
        )

    def test_format_at_end(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='Hello, ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='W',
                        types={FormattedContentType.BOLD},
                        reference=-1,
                    ),
                ],
                references=[],
            ),
            format_content('Hello, *W*'),
        )

    def test_multiple_formats(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='Hello',
                        types={FormattedContentType.STRIKETHROUGH},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content=' ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='W',
                        types={FormattedContentType.BOLD},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content=' orld ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='!',
                        types={FormattedContentType.ITALIC},
                        reference=-1,
                    )
                ],
                references=[],
            ),
            format_content('-Hello- *W* orld _!_'),
        )

    def test_overlapping_formats(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='He ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='l ',
                        types={FormattedContentType.BOLD},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='lo, W',
                        types={FormattedContentType.BOLD, FormattedContentType.STRIKETHROUGH},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content=' o',
                        types={FormattedContentType.STRIKETHROUGH},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content=' rld!',
                        types=set(),
                        reference=-1,
                    ),
                ],
                references=[],
            ),
            format_content('He *l -lo, W* o- rld!'),
        )

    def test_url_with_format(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='Hello, ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='https://www.google.com',
                        types={FormattedContentType.URL, FormattedContentType.STRIKETHROUGH},
                        reference=0,
                    ),
                    FormattedContentSegment(
                        content=' !',
                        types=set(),
                        reference=-1,
                    )
                ],
                references=['https://www.google.com'],
            ),
            format_content('Hello, -https://www.google.com- !'),
        )

    def test_mention_at_start(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='@kt233',
                        types={FormattedContentType.MENTION},
                        reference=0,
                    ),
                    FormattedContentSegment(
                        content=' !',
                        types=set(),
                        reference=-1,
                    )
                ],
                references=['kt233'],
            ),
            format_content('@kt233 !'),
        )

    def test_mention_with_url_and_format(self):
        self.assertEqual(
            FormattedContent(
                segments=[
                    FormattedContentSegment(
                        content='Hello, ',
                        types=set(),
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='https://www.google.com',
                        types={FormattedContentType.URL, FormattedContentType.STRIKETHROUGH},
                        reference=0,
                    ),
                    FormattedContentSegment(
                        content=' ',
                        types={FormattedContentType.STRIKETHROUGH},
                        reference=-1,
                    ),
                    FormattedContentSegment(
                        content='@kt233',
                        types={FormattedContentType.MENTION, FormattedContentType.STRIKETHROUGH},
                        reference=1,
                    ),
                    FormattedContentSegment(
                        content=' !',
                        types=set(),
                        reference=-1,
                    )
                ],
                references=['https://www.google.com', 'kt233'],
            ),
            format_content('Hello, -https://www.google.com @kt233- !'),
        )
