from flask_restful import fields
from pillcity.daos.content import format_content

class FormattedContent(fields.Raw):
    def format(self, value):
        fc = format_content(value)
        return {
            'references': fc.references,
            'segments': list(map(lambda s: {
                'content': s.content,
                'types': list(sorted(s.types)),
                'reference': s.reference if s.reference != -1 else None,
            }, fc.segments))
        }
