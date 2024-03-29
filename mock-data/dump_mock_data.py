import os
import pymongo
import boto3
import redis
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

    def sign_up(self, display_name: Optional[str] = None):
        self.sess.post('/api/signUp', json={
            'id': self.user_id,
            'password': '1234',
            'display_name': display_name
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
        fp = os.path.join('mock-data', "mock_data_avatars", fn)
        with open(fp, 'rb') as f:
            self.sess.post(f'/api/me/avatar', files={
                'file': f,
            }, data={
                'update_post': '1'
            })

    def create_circle(self, name: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f'/api/circles', data={
            'name': name
        }).json()['id']

    def add_user_to_circle(self, circle_id: str, member_user_id: str):
        self._raise_on_unauthenticated()
        self.sess.post(f'/api/circle/{circle_id}/membership/{member_user_id}')

    def create_post(self, content: Optional[str], is_public: bool, circle_ids=None, reshareable: bool = False,
                    reshared_from: Optional[str] = None, media_filenames: List[str] = None,
                    mentioned_user_ids: List[str] = None):
        self._raise_on_unauthenticated()

        # upload media first
        if media_filenames is None:
            media_filenames = []
        media_object_names = []
        if media_filenames:
            for fn in media_filenames:
                fp = os.path.join('mock-data', 'mock_data_media', fn)
                with open(fp, 'rb') as f:
                    files = {'file': f}
                    media_object_names.append(self.sess.post(f'/api/media', files=files).json()['object_name'])

        # post
        if circle_ids is None:
            circle_ids = []
        if mentioned_user_ids is None:
            mentioned_user_ids = []
        post_id = self.sess.post(f'/api/posts', json={
            'content': content,
            'is_public': is_public,
            'circle_ids': circle_ids,
            'reshareable': reshareable,
            'reshared_from': reshared_from,
            'media_object_names': media_object_names,
            'mentioned_user_ids': mentioned_user_ids
        }).json()['id']

        return post_id

    def create_comment(self, post_id: str, content: Optional[str], mentioned_user_ids: List[str] = None,
                       media_filenames: List[str] = None):
        self._raise_on_unauthenticated()

        # upload media first
        if media_filenames is None:
            media_filenames = []
        media_object_names = []
        if media_filenames:
            for fn in media_filenames:
                fp = os.path.join('mock-data', 'mock_data_media', fn)
                with open(fp, 'rb') as f:
                    files = {'file': f}
                    media_object_names.append(self.sess.post(f'/api/media', files=files).json()['object_name'])

        # comment
        if not mentioned_user_ids:
            mentioned_user_ids = []
        return self.sess.post(f'/api/posts/{post_id}/comment', json={
            'content': content,
            'mentioned_user_ids': mentioned_user_ids,
            'media_object_names': media_object_names,
        }).json()['id']

    def create_nested_comment(self, post_id: str, comment_id: str, content: Optional[str], mentioned_user_ids: List[str] = None,
                              media_filenames: List[str] = None):
        self._raise_on_unauthenticated()

        # upload media first
        if media_filenames is None:
            media_filenames = []
        media_object_names = []
        if media_filenames:
            for fn in media_filenames:
                fp = os.path.join('mock-data', 'mock_data_media', fn)
                with open(fp, 'rb') as f:
                    files = {'file': f}
                    media_object_names.append(self.sess.post(f'/api/media', files=files).json()['object_name'])

        # comment
        if not mentioned_user_ids:
            mentioned_user_ids = []
        return self.sess.post(f"/api/posts/{post_id}/comment/{comment_id}/comment", json={
            'content': content,
            'mentioned_user_ids': mentioned_user_ids,
            'media_object_names': media_object_names,
        }).json()['id']

    def follow(self, following_user_id: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f"/api/following/{following_user_id}")

    def create_reaction(self, post_id: str, emoji: str):
        self._raise_on_unauthenticated()
        return self.sess.post(f"/api/posts/{post_id}/reactions", json={
            'emoji': emoji
        })

    def delete_post(self, post_id: str):
        self._raise_on_unauthenticated()
        self.sess.delete(f"/api/post/{post_id}")

    def delete_comment(self, post_id: str, comment_id: str):
        self._raise_on_unauthenticated()
        self.sess.delete(f"/api/posts/{post_id}/comment/{comment_id}")


def signup_user(user_id: str, avatar: Optional[str] = None, display_name: Optional[str] = None):
    user = User(user_id)
    user.sign_up(display_name)
    user.sign_in()
    if avatar:
        user.update_avatar(avatar)
    return user


def main():
    # Drop everything in S3
    s3 = boto3.resource(
        's3',
        region_name=os.environ['AWS_REGION'],
        aws_access_key_id=os.environ['AWS_ACCESS_KEY'],
        aws_secret_access_key=os.environ['AWS_SECRET_KEY']
    )
    bucket = s3.Bucket(os.environ['S3_BUCKET_NAME'])
    print("Vacuuming s3")
    bucket.objects.all().delete()

    # Drop everything in mongodb
    mongodb = pymongo.MongoClient("mongodb://mongo:27017/minigplus")
    print("Vacuuming mongodb")
    mongodb.drop_database("minigplus")

    # Drop everything in redis
    r = redis.from_url("redis://redis:6379")
    print("Vacuuming redis")
    r.flushall()

    print("Dumping dummy data")
    # Sign up some users
    signup_user('ghost')
    official = signup_user('official')
    kt = signup_user('kt', 'kt.jpeg', 'big KT')
    soybean = signup_user('soybean', 'soybean.png', '騷豆')
    xiaolaba = signup_user('xiaolaba', 'xiaolaba.png', '小喇叭')
    buki = signup_user('buki', 'buki.png', '付不起')
    kyo = signup_user('kyo', 'kyo.png', '許工')
    duff = signup_user('duff', 'duff.jpg', '豆腐老師')
    kele = signup_user('kele', 'kele.jpg', '可樂')
    luxiyuan = signup_user('luxiyuan', 'luxiyuan.jpeg', '陸西圓')
    roddyzhang = signup_user('roddyzhang', 'roddyzhang.png', 'Roddy Zhang')
    mawei = signup_user('mawei', 'mawei.jpg', '馬尾')
    horo = signup_user('horo', 'horo.png')
    everybody = ['kt', 'soybean', 'xiaolaba', 'buki', 'kyo', 'duff', 'kele', 'luxiyuan', 'roddyzhang', 'mawei',
                 'horo']
    everybody_obj = [kt, soybean, xiaolaba, buki, kyo, duff, kele, luxiyuan, roddyzhang, mawei, horo]

    # Create some circles
    kt_gplus_circle_id = kt.create_circle('g+')
    kele_limited_circle_id = kele.create_circle('limited')

    # Add people to circles
    kele.add_user_to_circle(kele_limited_circle_id, 'luxiyuan')
    kele.add_user_to_circle(kele_limited_circle_id, 'xiaolaba')
    kele.add_user_to_circle(kele_limited_circle_id, 'duff')

    # Add some followings
    for user in everybody:
        kele.follow(user)

    # Create some posts
    official.create_post('Welcome to pill.city! '
                         'Click the Users tab on top (or the left most tab if you are on a phone) '
                         'to start following people!', is_public=True)
    with open('./mock-data/xss.txt') as f:
        kt.create_post(f.read(), is_public=True, circle_ids=[kt_gplus_circle_id])
    kt.create_post(' _Hello, World!_ ', is_public=True)
    kt.create_post('@buki  -叔叔快看- ', is_public=True, media_filenames=['gaygineer.jpg'], mentioned_user_ids=['buki'])
    sizhongfangshi_id = soybean.create_post('谁告诉你连着wifi就不会耗流量了？ ！ \n\nApp的网络访问方式起码在Android就有四种，其中一种是仅使用GSM网络',
                                            is_public=True, reshareable=True)
    huoguomei_id = roddyzhang.create_post("打个DOTA打到一般忽然壕语文的麦克风里出现妹子催促他快点打完吃火锅， -耿耿于怀啊- \n\n -JB文必须死- ", is_public=True,
                                          media_filenames=['huoguomei.png'])
    heisi_id = kele.create_post(None, is_public=False, circle_ids=[kele_limited_circle_id],
                                 reshareable=True,
                                 media_filenames=['heisi1.jpeg', 'heisi2.jpeg', 'heisi3.jpeg', 'heisi4.jpeg'])
    kotori_id = kt.create_post('啊啊啊啊啊啊阿啊啊啊啊啊啊啊啊 @kele', is_public=True, mentioned_user_ids=['kele'], media_filenames=['kotori1.jpg', 'kotori2.jpg', 'kotori3.jpg', 'kotori4.jpg'])
    weiji_id = horo.create_post('你这种伪基佬真淫家早该B了！ @mawei ', is_public=True, mentioned_user_ids=['mawei'])
    sizhongzhuanfa_id = luxiyuan.create_post(
        '''有一回，骚豆菊苣对我说道：“你用过Android么？”我略略点一点头。
他说：“用过……我便考你一考。AndroidApp的网络访问方式，是怎样的？”
我懒懒地答他道：“谁要你教，不就是wifi之类的么？”
骚豆菊苣显出极高兴的样子，将两个指头敲着柜台，点头说：“对呀对呀！App访问网络有四种方式，你知道么？”
我愈不耐烦了，努着嘴走远。骚豆菊苣刚用指甲蘸了酒，想在柜上画图，见我毫不热心，便又叹一口气，显出极惋惜的样子。''',
        is_public=True, reshareable=True, reshared_from=sizhongfangshi_id)
    kele.create_post('啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊', is_public=True, reshareable=True, reshared_from=heisi_id)
    kotori_id = kt.create_post('啊啊啊啊啊啊阿啊啊啊啊啊啊啊啊 @kele', is_public=True, mentioned_user_ids=['kele'], media_filenames=['kotori1.jpg', 'kotori2.jpg', 'kotori3.jpg', 'kotori4.jpg'])
    kt.create_post('23333 https://china.kyodonews.net/news/2021/10/625d1318d9e5-6.html', is_public=True)
    kt.create_post('http://fsadfsdfqwghfjbasfhasgbfnads.com', is_public=True)
    kele.create_post('https://twitter.com/U_S_O/status/1358737558155399169', is_public=True)
    kele.create_post('https://mobile.twitter.com/U_S_O/status/1358737558155399169', is_public=True)
    kt.create_post('https://twitter.com/daily_keke', is_public=True)
    kt.create_post('https://mobile.twitter.com/daily_keke', is_public=True)
    kt.create_post('https://www.youtube.com/watch?v=y8OnoxKotPQ', is_public=True)
    kt.create_post('https://m.youtube.com/watch?v=y8OnoxKotPQ', is_public=True)
    kele.create_post('https://www.pixiv.net/en/artworks/91872507', is_public=True)
    kt.create_post('test 1', is_public=True, media_filenames=['sif1.png'])
    kt.create_post('test 2', is_public=True, media_filenames=['sif1.png', 'sif2.png'])
    kt.create_post('test 3', is_public=True, media_filenames=['sif1.png', 'sif2.png', 'sif3.png'])
    kt.create_post('test 4', is_public=True, media_filenames=['sif1.png', 'sif2.png', 'sif3.png', 'sif4.png'])
    kt.create_post('test https://twitter.com/daily_keke', is_public=True, media_filenames=['sif1.png', 'sif2.png', 'sif3.png', 'sif4.png'])
    kt.create_post('test https://twitter.com/daily_keke https://www.youtube.com/watch?v=y8OnoxKotPQ https://www.pixiv.net/en/artworks/91872507', is_public=True, media_filenames=['sif1.png', 'sif2.png', 'sif3.png', 'sif4.png'])

    # Create some reactions
    for i, user in enumerate(everybody_obj):
        user.create_reaction(sizhongzhuanfa_id, '➕')
        if i < 6:
            user.create_reaction(huoguomei_id, '🔥')
        if i < 9:
            user.create_reaction(huoguomei_id, '➕')

    # Create some comments
    duff.create_comment(heisi_id, '啊啊啊啊啊啊啊啊啊')
    kele.create_comment(heisi_id, '四齋蒸鵝心')
    mawei.create_comment(weiji_id, '毛的！！')
    weiji_comment_id = mawei.create_comment(weiji_id, '过几天我就真的要搞基了好吧！！')
    horo.create_nested_comment(weiji_id, weiji_comment_id, '。。。')
    horo.create_nested_comment(weiji_id, weiji_comment_id, '为啥')
    mawei.create_nested_comment(weiji_id, weiji_comment_id, '@horo 都把人家约到家里了好吧！！', ['horo'])
    kyo_kt_kotori_comment_id = kyo.create_comment(kotori_id, None, media_filenames=['szzex1.jpg'])
    kele_kt_kotori_comment_id = kele.create_comment(kotori_id, '四齋蒸鵝心', media_filenames=['szzex2.jpg'])
    kele_kt_kotori_comment2_id = kele.create_comment(kotori_id, None, media_filenames=['szzex2.jpg'])
    kele.create_nested_comment(kotori_id, kele_kt_kotori_comment_id, '四齋蒸鵝心', media_filenames=['szzex2.jpg'])
    kele.create_nested_comment(kotori_id, kele_kt_kotori_comment2_id, None, media_filenames=['szzex2.jpg'])
    kyo.delete_comment(kotori_id, kyo_kt_kotori_comment_id)
    kt.delete_post(kotori_id)


if __name__ == '__main__':
    main()
