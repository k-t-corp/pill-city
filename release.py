import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from pillcity.models import User, Post, Media

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
            if post_media.refs == -1:
                print(f"Backfilling post {post.eid} media #{post_i + 1}")
                post_media.owner = post.author
                if post.is_update_avatar and post.author.fetch().avatar.id == post_media.id:
                    # is an update avatar post containing the current avatar
                    post_media.refs = 2
                else:
                    # either an update avatar post containing a past avatar or a regular post image
                    post_media.refs = 1
                post_media.save()

    for comment in post.comments2:
        for nested_comment in comment.comments:
            if not nested_comment.deleted:
                for nested_comment_i, nested_comment_media_lazy in enumerate(nested_comment.media_list):
                    nested_comment_media = nested_comment_media_lazy.fetch()
                    if nested_comment_media.refs == -1:
                        print(f"Backfilling post {post.eid} comment {nested_comment.eid} media #{nested_comment_i + 1}")
                        nested_comment_media.owner = nested_comment.author
                        nested_comment_media.refs = 1
                        nested_comment_media.save()

        if not comment.deleted:
            for comment_i, comment_media_lazy in enumerate(comment.media_list):
                comment_media = comment_media_lazy.fetch()
                if comment_media.refs == -1:
                    print(f"Backfilling post {post.eid} comment {comment.eid} media #{comment_i + 1}")
                    comment_media.owner = comment.author
                    comment_media.refs = 1
                    comment_media.save()

for user in User.objects():
    if user.avatar:
        avatar = user.avatar.fetch()
        if avatar.refs == -1:
            print(f"Backfilling user {user.user_id} avatar media")
            avatar.owner = user
            avatar.refs = 1
            avatar.save()
