import os
from pymongo.uri_parser import parse_uri
from mongoengine import connect
from pillcity.models import User, Post, Media

uri = os.environ['MONGODB_URI']
connect(
    host=uri,
    db=parse_uri(uri)['database']
)

print("Backfilling all media from user avatars, posts and comments")

for user in User.objects():
    if user.avatar:
        avatar = user.avatar.fetch()
        if avatar.refs == -1:
            print(f"Backfilling user {user.user_id} avatar media")
            avatar.owner = user
            avatar.refs = 1
            avatar.save()

for post in Post.objects():
    for post_i, post_media_lazy in enumerate(post.media_list):
        post_media = post_media_lazy.fetch()
        if post_media.refs == -1:
            print(f"Backfilling post {post.eid} media #{post_i + 1}")
            post_media.owner = post.author
            post_media.refs = 1
            post_media.save()

    for comment in post.comments2:
        for comment_i, comment_media_lazy in enumerate(comment.media_list):
            comment_media = comment_media_lazy.fetch()
            if comment_media.refs == -1:
                print(f"Backfilling post {post.eid} comment {comment.eid} media #{comment_i + 1}")
                comment_media.owner = comment.author
                comment_media.refs = 1
                comment_media.save()

print("Backfilled all media from user avatars, posts and comments")

print("Backfilling all orphaned media")

for media in Media.objects():
    if media.refs == -1:
        print(f"Backfilling orphaned media {media.id}")
        media.refs = 0
        media.owner = None
        media.save()

print("Backfilled all orphaned media")
