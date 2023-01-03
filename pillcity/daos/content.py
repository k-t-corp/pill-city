import dataclasses
import re
from typing import List, Set
from urlextract import URLExtract
from .user_cache import get_in_user_cache_by_user_id


url_extractor = URLExtract()
url_extractor.update_when_older(30)

regex_strikethrough = re.compile(r'(^|\s)-(.+?)-($|\s)')
regex_bold = re.compile(r'(^|\s)\*(.+?)\*($|\s)')
regex_italic = re.compile(r'(^|\s)_(.+?)_($|\s)')
regex_mention = re.compile(r'(^|\s)@([A-Za-z0-9_-]+)')


class FormattedContentType:
    STRIKETHROUGH = 'strikethrough'
    BOLD = 'bold'
    ITALIC = 'italic'
    URL = 'url'
    MENTION = 'mention'


@dataclasses.dataclass
class FormattedChar:
    char: str
    types: Set[FormattedContentType]
    # same as FormattedContentSegment.reference
    reference: int
    retained: bool = False

formats = [
    (regex_strikethrough, FormattedContentType.STRIKETHROUGH),
    (regex_bold, FormattedContentType.BOLD),
    (regex_italic, FormattedContentType.ITALIC),
]

@dataclasses.dataclass
class FormattedContentSegment:
    content: str
    types: Set[FormattedContentType]
    # this is index to the parent FormattedContent's references list
    # the parent FormattedContent's references list contains what this segment refers to
    # such as a url or a mentioned user id
    reference: int

@dataclasses.dataclass
class FormattedContent:
    segments: List[FormattedContentSegment]
    # this list contains what segments refer to, such as a url or a mentioned user id
    references: List[str]

def format_content(content: str) -> FormattedContent:
    if not content:
        return FormattedContent([], [])
    # split the content into individual chars
    # and mark each of them with format according to the regexes
    chars = [FormattedChar(c, set(), -1, True) for c in content] # type: List[FormattedChar]

    # extract strikethrough, bold and italic
    # remove format marker chars such as -, * and _ by setting the char at position to deleted
    for regex, format_type in formats:
        for match in regex.finditer(content):
            match_start, match_end = match.start(), match.end()
            if match_start == 0:
                chars[0].retained = False
                actual_start = 1
            else:
                chars[match_start + 1].retained = False
                actual_start = match_start + 2
            if match_end == len(content):
                chars[len(content) - 1].retained = False
                actual_end = len(content) - 2
            else:
                chars[match_end - 2].retained = False
                actual_end = match_end - 3
            for i in range(actual_start, actual_end + 1):
                chars[i].types.add(format_type)

    # remove format marker char deleted placeholders
    chars = list(filter(lambda c: c.retained, chars))

    # extract urls
    actual_content = ''.join([c.char for c in chars])
    references = []
    for url, (idx_start, idx_end) in url_extractor.find_urls(actual_content,get_indices=True):
        for i in range(idx_start, idx_end):
            chars[i].types.add(FormattedContentType.URL)
            chars[i].reference = len(references)
        references.append(url)

    # extract mentions
    for match in regex_mention.finditer(actual_content):
        match_start, match_end = match.start(), match.end()
        actual_start = 0 if match_start == 0 else match_start + 1
        user_id = actual_content[actual_start + 1: match_end]
        if get_in_user_cache_by_user_id(user_id):
            for i in range(actual_start, match_end):
                chars[i].types.add(FormattedContentType.MENTION)
                chars[i].reference = len(references)
            references.append(user_id)

    # merge chars so that nearby chars with the same format types and reference are merged
    segments = []  # type: List[FormattedContentSegment]
    for c in chars:
        if len(segments) == 0 or segments[-1].types != c.types or segments[-1].reference != c.reference:
            segments.append(FormattedContentSegment(c.char, c.types, c.reference))
        else:
            segments[-1].content += c.char

    return FormattedContent(segments, references)
