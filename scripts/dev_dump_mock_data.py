import os
import pymongo
import boto3
from typing import List, Optional
from requests_toolbelt.sessions import BaseUrlSession


class User(object):
    def __init__(self, user_id):
        self.user_id = user_id
        self.sess = BaseUrlSession(base_url='http://localhost:5000')

        def res_hook(r, *args, **kwargs):
            sc = r.status_code
            if str(sc).startswith('4') or str(sc).startswith('5'):
                print(r.text)
            r.raise_for_status()
        self.sess.hooks = {
            'response': res_hook
        }
        self.access_token = None

    def sign_up(self):
        self.sess.post('/api/signUp', json={
            'id': self.user_id,
            'password': '1234'
        })

    def sign_in(self):
        self.access_token = self.sess.post('/api/signIn', json={
            'id': self.user_id,
            'password': '1234'
        }).json()['access_token']
        self.sess.headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

    def _raise_on_unauthenticated(self):
        if not self.access_token:
            raise RuntimeError(f'{self.user_id} is unauthenticated')

    def update_avatar(self, fn):
        self._raise_on_unauthenticated()
        fp = os.path.join('scripts', "dev_mock_data_avatars", fn)
        with open(fp, 'rb') as f:
            self.sess.post(f'/api/me/avatar', files={
                'file': f
            })

    def create_circle(self, name: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f'/api/circles', data={
            'name': name
        }).json()['id']

    def add_user_to_circle(self, circle_id: str, member_user_id: str):
        self._raise_on_unauthenticated()
        self.sess.post(f'/api/circle/{circle_id}/membership/{member_user_id}')

    def create_post(self, content: str, is_public: bool, circle_ids=None, reshareable: bool = False,
                    reshared_from: Optional[str] = None, media_filenames: List[str] = None,
                    mentioned_user_ids: List[str] = None):
        self._raise_on_unauthenticated()

        # upload media first
        if media_filenames is None:
            media_filenames = []
        media_object_names = []
        if media_filenames:
            media_filepaths = list(map(lambda fn: os.path.join('scripts', 'dev_mock_data_media', fn), media_filenames))
            files = {}
            for i, fp in enumerate(media_filepaths):
                if i < 9:
                    files['media' + str(i)] = open(fp, 'rb')
            media_object_names = self.sess.post(f'/api/posts/media', files=files).json()
            for _, f in files.items():
                f.close()

        # post
        if circle_ids is None:
            circle_ids = []
        if mentioned_user_ids is None:
            mentioned_user_ids = []
        post_id = self.sess.post(f'/api/posts', data={
            'content': content,
            'is_public': is_public,
            'circle_ids': circle_ids,
            'reshareable': reshareable,
            'reshared_from': reshared_from,
            'media_object_names': media_object_names,
            'mentioned_user_ids': mentioned_user_ids
        }).json()['id']

        return post_id

    def create_comment(self, post_id: str, content: str, mentioned_user_ids: List[str] = None):
        self._raise_on_unauthenticated()
        if not mentioned_user_ids:
            mentioned_user_ids = []
        return self.sess.post(f'/api/posts/{post_id}/comment', json={
            'content': content,
            'mentioned_user_ids': mentioned_user_ids
        }).json()['id']

    def create_nested_comment(self, post_id: str, comment_id: str, content: str, mentioned_user_ids: List[str] = None):
        self._raise_on_unauthenticated()
        if not mentioned_user_ids:
            mentioned_user_ids = []
        return self.sess.post(f"/api/posts/{post_id}/comment/{comment_id}/comment", json={
            'content': content,
            'mentioned_user_ids': mentioned_user_ids
        })

    def follow(self, following_user_id: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f"/api/following/{following_user_id}")

    def create_reaction(self, post_id: str, emoji: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f"/api/posts/{post_id}/reactions", json={
            'emoji': emoji
        })


def main():
    # Drop everything in mino
    s3 = boto3.resource(
        's3',
        endpoint_url="http://localhost:19025",
        region_name="",
        aws_access_key_id="minioadmin",
        aws_secret_access_key="minioadmin"
    )
    bucket = s3.Bucket('minigplus')
    print("Vacuuming s3")
    bucket.objects.all().delete()

    # Drop everything in mongodb
    client = pymongo.MongoClient("mongodb://localhost:19023/minigplus")
    print("Vacuuming mongodb")
    client.drop_database("minigplus")

    print("Dumping dummy data")
    # Sign up some users
    kt = User('kt'); kt.sign_up(); kt.sign_in(); kt.update_avatar('kt.jpeg')
    ika = User('ika'); ika.sign_up(); ika.sign_in(); ika.update_avatar('ika.jpeg')
    soybean = User('soybean'); soybean.sign_up(); soybean.sign_in(); soybean.update_avatar('soybean.png')
    xiaolaba = User('xiaolaba'); xiaolaba.sign_up(); xiaolaba.sign_in(); xiaolaba.update_avatar('xiaolaba.png')
    buki = User('buki'); buki.sign_up(); buki.sign_in(); buki.update_avatar('buki.png')
    kyo = User('kyo'); kyo.sign_up(); kyo.sign_in(); kyo.update_avatar('kyo.png')
    duff = User('duff'); duff.sign_up(); duff.sign_in(); duff.update_avatar('duff.jpg')
    kele = User('kele'); kele.sign_up(); kele.sign_in(); kele.update_avatar('kele.jpg')
    ahuhu = User('ahuhu'); ahuhu.sign_up(); ahuhu.sign_in(); ahuhu.update_avatar('ahuhu.png')

    # Create some circles
    kt_ika_circle_id = kt.create_circle('ika')
    kt_gplus_circle_id = kt.create_circle('g+')

    # Add people to circles

    # Add some followings
    ika.follow('kt')
    kt.follow('ika')
    xiaolaba.follow('kt')
    kt.follow('xiaolaba')

    # Create some posts
    kt.create_post('rua', is_public=True)
    kt.create_post(' _Hello, World!_ ', is_public=True)
    kt_ika_post = kt.create_post('Ika!1!!!! @ika', is_public=False, circle_ids=[kt_ika_circle_id], mentioned_user_ids=['ika'])
    ika.create_post('iPhone', is_public=True, media_filenames=['iphone.jpeg'])
    ika.create_post(' *iPad* ', is_public=True, media_filenames=['ipad.jpeg'])
    ika.create_post('MacBook Pro', is_public=True, media_filenames=['mbp.jpeg'])
    ika.create_post('MacBook Air', is_public=True, media_filenames=['mba.jpeg'])
    kt.create_post('鬼城！！！', is_public=False, circle_ids=[kt_gplus_circle_id])
    with open('./scripts/xss.txt') as f:
        kt.create_post(f.read(), is_public=True, circle_ids=[kt_gplus_circle_id])
    ika.create_post('iMac', is_public=True, media_filenames=['imac.jpg'])
    ika.create_post('AirPods Pro', is_public=True, media_filenames=['app.jpeg'])

    # Create some reshares
    # kt.create_post('是傑哥耶！！', is_public=True, reshareable=True, reshared_from=sirjie_post_id)

    # Create some reactions
    # kt.create_reaction(sirjie_post_id, '👦')

    # Create some comments


if __name__ == '__main__':
    main()
