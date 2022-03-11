import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from pillcity.models import User, Post

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)

print("Running release")

for post in Post.objects():
    if not post.deleted:
        for post_i, post_media_lazy in enumerate(post.media_list):
            post_media = post_media_lazy.fetch()
            if post_media.created_at == 0:
                print(f"Backfilling post {post.eid} media #{post_i + 1}")
                post_media.created_at = post.created_at
                post_media.used_at = post.created_at
                post_media.save()

    for comment in post.comments2:
        for nested_comment in comment.comments:
            if not nested_comment.deleted:
                for nested_comment_i, nested_comment_media_lazy in enumerate(nested_comment.media_list):
                    nested_comment_media = nested_comment_media_lazy.fetch()
                    if nested_comment_media.created_at == 0:
                        print(f"Backfilling post {post.eid} comment {nested_comment.eid} media #{nested_comment_i + 1}")
                        nested_comment_media.created_at = nested_comment.created_at
                        nested_comment_media.used_at = nested_comment.created_at
                        nested_comment_media.save()

        if not comment.deleted:
            for comment_i, comment_media_lazy in enumerate(comment.media_list):
                comment_media = comment_media_lazy.fetch()
                if comment_media.created_at == 0:
                    print(f"Backfilling post {post.eid} comment {comment.eid} media #{comment_i + 1}")
                    comment_media.created_at = comment.created_at
                    comment_media.used_at = comment.created_at
                    comment_media.save()

for user in User.objects():
    if user.avatar:
        avatar = user.avatar.fetch()
        if avatar.created_at == 0:
            print(f"Backfilling user {user.user_id} avatar media")
            avatar.created_at = user.created_at
            avatar.used_at = user.created_at
            avatar.save()
