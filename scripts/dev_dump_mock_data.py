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

    def create_circle(self, circle_name: str):
        self._raise_on_unauthenticated()
        self.sess.post(f'/api/circle/{circle_name}')

    def add_user_to_circle(self, circle_name: str, member_user_id: str):
        self._raise_on_unauthenticated()
        self.sess.post(f'/api/circle/{circle_name}/membership/{member_user_id}')

    def create_post(self, content: str, is_public: bool, circle_names=None, reshareable: bool = False,
                    reshared_from: Optional[str] = None, media_filenames: List[str] = None):
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
        if circle_names is None:
            circle_names = []
        post_id = self.sess.post(f'/api/posts', data={
            'content': content,
            'is_public': is_public,
            'circle_names': circle_names,
            'reshareable': reshareable,
            'reshared_from': reshared_from,
            'media_object_names': media_object_names
        }).json()['id']

        return post_id

    def create_comment(self, post_id: str, content: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f'/api/posts/{post_id}/comment', json={
            'content': content,
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

    # Sign up some users
    kt = User('kt'); kt.sign_up(); kt.sign_in(); kt.update_avatar('kt.jpeg')
    ika = User('ika'); ika.sign_up(); ika.sign_in(); ika.update_avatar('ika.jpeg')
    innkuika = User('innkuika'); innkuika.sign_up(); innkuika.sign_in(); innkuika.update_avatar('innkuika.jpg')
    ikayaki = User('ikayaki'); ikayaki.sign_up(); ikayaki.sign_in(); ikayaki.update_avatar('ikayaki.jpg')
    ikayaro = User('ikayaro'); ikayaro.sign_up(); ikayaro.sign_in(); ikayaro.update_avatar('ikayaro.png')
    ika2 = User('ikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); ika2.sign_up(); ika2.sign_in(); ika2.update_avatar('ika2.png')
    billy = User('billy'); billy.sign_up(); billy.sign_in(); billy.update_avatar('billy.jpeg')
    van = User('van'); van.sign_up(); van.sign_in(); van.update_avatar('van.png')
    xiaolaba = User('xiaolaba'); xiaolaba.sign_up(); xiaolaba.sign_in(); xiaolaba.update_avatar('xiaolaba.png')
    buki = User('buki'); buki.sign_up(); buki.sign_in(); buki.update_avatar('buki.jpg')
    mawei = User('mawei'); mawei.sign_up(); mawei.sign_in(); mawei.update_avatar('mawei.jpg')
    duff = User('duff'); duff.sign_up(); duff.sign_in(); duff.update_avatar('duff.jpeg')
    kele = User('kele'); kele.sign_up(); kele.sign_in(); kele.update_avatar('kele.jpg')
    ahuhu = User('ahuhu'); ahuhu.sign_up(); ahuhu.sign_in()
    senpai = User('114514'); senpai.sign_up(); senpai.sign_in(); senpai.update_avatar('senpai.png')
    sirjie = User('sirjie'); sirjie.sign_up(); sirjie.sign_in(); sirjie.update_avatar('sirjie.bmp')

    # Create some circles
    kt.create_circle('ika')
    kt.create_circle('gachi')
    kt.create_circle('g+')

    # Add people to circles
    kt.add_user_to_circle('ika', 'ika')
    kt.add_user_to_circle('ika', 'innkuika')
    kt.add_user_to_circle('ika', 'ikayaki')
    kt.add_user_to_circle('ika', 'ikayaro')
    kt.add_user_to_circle('ika', 'ikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    kt.add_user_to_circle('gachi', 'billy')
    kt.add_user_to_circle('g+', 'billy')
    kt.add_user_to_circle('gachi', 'van')
    kt.add_user_to_circle('ika', 'van')
    kt.add_user_to_circle('g+', 'xiaolaba')
    kt.add_user_to_circle('g+', 'buki')
    kt.add_user_to_circle('g+', 'mawei')
    kt.add_user_to_circle('g+', 'duff')
    kt.add_user_to_circle('g+', 'kele')
    kt.add_user_to_circle('g+', 'ahuhu')

    # Add some followings
    ika.follow('kt')
    kt.follow('ika')
    van.follow('kt')
    xiaolaba.follow('kt')
    kt.follow('xiaolaba')
    senpai.follow('kt')
    sirjie.follow('kt')
    kt.follow('sirjie')

    # Create some posts
    kt.create_post('rua', is_public=True)
    kt.create_post(' _Hello, World!_ ', is_public=True)
    kt_ika_post = kt.create_post('Ika!1!!!!', is_public=False, circle_names=['ika'])
    ika.create_post('iPhone', is_public=True, media_filenames=['iphone.jpeg'])
    ika.create_post(' *iPad* ', is_public=True, media_filenames=['ipad.jpeg'])
    ika.create_post('MacBook Pro', is_public=True, media_filenames=['mbp.jpeg'])
    ika.create_post('MacBook Air', is_public=True, media_filenames=['mba.jpeg'])
    kt.create_post('BOY NEXT DOOR. SLABU GET UR AS BACK HERE. HENG HENG HENG AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                   'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', is_public=False,
                   circle_names=['gachi'])
    kt.create_post('鬼城！！！', is_public=False, circle_names=['g+'])
    with open('./scripts/xss.txt') as f:
        kt.create_post(f.read(), is_public=True, circle_names=['g+'])
    ika.create_post('iMac', is_public=True, media_filenames=['imac.jpg'])
    ika.create_post('AirPods Pro', is_public=True, media_filenames=['app.jpeg'])

    senpai.create_post('henghenghengaaaa', is_public=True)
    senpai.create_post('kouchaiidesuka', is_public=True)
    sirjie_post_id = sirjie.create_post('我家呢還 *蠻大* 的', is_public=True, reshareable=True, media_filenames=[
        'jie1.png', 'jie2.jpg', 'jie3.jpg'
    ])
    sirjie.create_post('拿都可以拿', is_public=True)
    sirjie.create_post('你看這個彬彬才喝幾罐就醉了', is_public=True)
    senpai.create_post('114514', is_public=True)
    sirjie.create_post('這麼說你很勇ho', is_public=True)
    sirjie.create_post('我房裡有好康的', is_public=True)
    sirjie.create_post(' -聽話！讓我看看！- ', is_public=True)

    # Create some reshares
    kt.create_post('是傑哥耶！！', is_public=True, reshareable=True, reshared_from=sirjie_post_id)

    # Create some reactions
    kt.create_reaction(sirjie_post_id, '👦')

    # Create some comments
    ika_kt_ika_comment = ika.create_comment(kt_ika_post, 'rua')
    innkuika.create_comment(kt_ika_post, 'twitter.com/realInnkuIka')
    innkuika.create_nested_comment(kt_ika_post, ika_kt_ika_comment, '')
    ikayaki.create_comment(kt_ika_post, ' _twitter.com/realIkaYaki_ ')
    ikayaki.create_nested_comment(
        kt_ika_post,
        ika_kt_ika_comment,
        '@ika Innkuika is crokked!!!! Make Ika Great Again!!!!!!',
        ['ika']
    )
    ikayaro.create_comment(kt_ika_post, 'twitter.com/realIkaYaro')
    ikayaki.create_nested_comment(kt_ika_post, ika_kt_ika_comment, 'twitter.com/realIkaYaro twitter.com/realIkaYaro twi'
                                                                   'tter.com/realIkaYaro twitter.com/realIkaYaro twitte'
                                                                   'r.com/realIkaYaro twitter.com/realIkaYaro twitter.c'
                                                                   'om/realIkaYaro twitter.com/realIkaYaro twitter.com/'
                                                                   'realIkaYaro twitter.com/realIkaYaro twitter.com/rea'
                                                                   'lIkaYaro')
    ika2.create_comment(kt_ika_post, " -I'm 混亂邪惡- ")
    ika2.create_nested_comment(kt_ika_post, ika_kt_ika_comment, '/profile/ikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')


if __name__ == '__main__':
    main()
