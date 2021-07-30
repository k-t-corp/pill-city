import pymongo
from typing import List
from requests_toolbelt.sessions import BaseUrlSession


class User(object):
    def __init__(self, user_id):
        self.user_id = user_id
        self.sess = BaseUrlSession(base_url='http://localhost:5000')
        self.sess.hooks = {
            'response': lambda r, *args, **kwargs: r.raise_for_status()
        }
        self.access_token = None

    def sign_up(self):
        self.sess.post('/api/me', json={
            'id': self.user_id,
            'password': '1234'
        })

    def sign_in(self):
        self.access_token = self.sess.post('/api/auth', json={
            'id': self.user_id,
            'password': '1234'
        }).json()['access_token']
        self.sess.headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

    def _raise_on_unauthenticated(self):
        if not self.access_token:
            raise RuntimeError(f'{self.user_id} is unauthenticated')

    def create_circle(self, circle_name: str):
        self._raise_on_unauthenticated()
        self.sess.post(f'/api/circle/{circle_name}')

    def add_user_to_circle(self, circle_name: str, member_user_id: str):
        self._raise_on_unauthenticated()
        self.sess.post(f'/api/circle/{circle_name}/membership/{member_user_id}')

    def create_post(self, content: str, is_public: bool, circle_names: List[str]):
        self._raise_on_unauthenticated()
        return self.sess.post(f'/api/posts', json={
            'content': content,
            'is_public': is_public,
            'circle_names': circle_names
        }).json()['id']

    def create_comment(self, post_id: str, content: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f'/api/posts/{post_id}/comment', json={
            'content': content,
        }).json()['id']

    def create_nested_comment(self, post_id: str, comment_id: str, content: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f"/api/posts/{post_id}/comment/{comment_id}/comment", json={
            'content': content
        })


def main():
    # drop everything in database
    client = pymongo.MongoClient("mongodb://localhost:19023/minigplus")
    client.drop_database("minigplus")

    # sign up some users
    kt = User('kt'); kt.sign_up(); kt.sign_in()
    ika = User('ika'); ika.sign_up(); ika.sign_in()
    innkuika = User('innkuika'); innkuika.sign_up(); innkuika.sign_in()
    ikayaki = User('ikayaki'); ikayaki.sign_up(); ikayaki.sign_in()
    ikayaro = User('ikayaro'); ikayaro.sign_up(); ikayaro.sign_in()
    ika2 = User('ikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); ika2.sign_up(); ika2.sign_in()
    billy = User('billy'); billy.sign_up(); billy.sign_in()
    van = User('van'); van.sign_up(); van.sign_in()
    xiaolaba = User('xiaolaba'); xiaolaba.sign_up(); xiaolaba.sign_in()
    buki = User('buki'); buki.sign_up(); buki.sign_in()
    mawei = User('mawei'); mawei.sign_up(); mawei.sign_in()
    duff = User('duff'); duff.sign_up(); duff.sign_in()
    kele = User('kele'); kele.sign_up(); kele.sign_in()
    ahuhu = User('ahuhu'); ahuhu.sign_up(); ahuhu.sign_in()
    senpai = User('114514'); senpai.sign_up(); senpai.sign_in()
    sirjie = User('sirjie'); sirjie.sign_up(); sirjie.sign_in()

    # create some circles
    kt.create_circle('ika')
    kt.create_circle('gachi')
    kt.create_circle('g+')

    # add people to circles
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

    # post something
    kt.create_post('rua', is_public=True, circle_names=[])
    kt.create_post('Hello, World!', is_public=True, circle_names=[])
    kt_ika_post = kt.create_post('Ika!1!!!!', is_public=False, circle_names=['ika'])
    kt.create_post('BOY NEXT DOOR. SLABU GET UR AS BACK HERE. HENG HENG HENG AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', is_public=False, circle_names=['gachi'])
    kt.create_post('鬼城！！！', is_public=False, circle_names=['g+'])

    ika.create_post('iPhone', is_public=True, circle_names=[])
    ika.create_post('iPad', is_public=True, circle_names=[])
    ika.create_post('MacBook Pro', is_public=True, circle_names=[])
    ika.create_post('MacBook Air', is_public=True, circle_names=[])
    ika.create_post('iMac', is_public=True, circle_names=[])
    ika.create_post('AirPod Pro', is_public=True, circle_names=[])

    senpai.create_post('henghenghengaaaa', is_public=True, circle_names=[])
    senpai.create_post('kouchaiidesuka', is_public=True, circle_names=[])
    senpai.create_post('114514', is_public=True, circle_names=[])

    sirjie.create_post('我家呢還蠻大的', is_public=True, circle_names=[])
    sirjie.create_post('拿都可以拿', is_public=True, circle_names=[])
    sirjie.create_post('你看這個彬彬才喝幾罐就醉了', is_public=True, circle_names=[])
    sirjie.create_post('這麼說你很勇ho', is_public=True, circle_names=[])
    sirjie.create_post('我房裡有好康的', is_public=True, circle_names=[])
    sirjie.create_post('聽話！讓我看看！', is_public=True, circle_names=[])

    # Create some comments
    ika_kt_ika_comment = ika.create_comment(kt_ika_post, 'rua')
    innkuika.create_comment(kt_ika_post, 'twitter.com/realInnkuIka')
    innkuika.create_nested_comment(kt_ika_post, ika_kt_ika_comment, '')
    ikayaki.create_comment(kt_ika_post, 'twitter.com/realIkaYaki')
    ikayaki.create_nested_comment(kt_ika_post, ika_kt_ika_comment, 'Innkuika is crokked!!!! Make Ika Great Again!!!!!!')
    ikayaro.create_comment(kt_ika_post, 'twitter.com/realIkaYaro')
    ikayaki.create_nested_comment(kt_ika_post, ika_kt_ika_comment, 'twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro twitter.com/realIkaYaro')
    ika2.create_comment(kt_ika_post, "I'm 混亂邪惡")
    ika2.create_nested_comment(kt_ika_post, ika_kt_ika_comment, '/profile/ikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')


if __name__ == '__main__':
    main()
