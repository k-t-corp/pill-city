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

    def create_post(self, content: Optional[str], is_public: bool, circle_ids=None, reshareable: bool = False,
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
            media_object_names = self.sess.post(f'/api/media', files=files).json()
            for _, f in files.items():
                f.close()

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
            media_filepaths = list(map(lambda fn: os.path.join('scripts', 'dev_mock_data_media', fn), media_filenames))
            files = {}
            for i, fp in enumerate(media_filepaths):
                if i < 9:
                    files['media' + str(i)] = open(fp, 'rb')
            media_object_names = self.sess.post(f'/api/media', files=files).json()
            for _, f in files.items():
                f.close()

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
            media_filepaths = list(map(lambda fn: os.path.join('scripts', 'dev_mock_data_media', fn), media_filenames))
            files = {}
            for i, fp in enumerate(media_filepaths):
                if i < 9:
                    files['media' + str(i)] = open(fp, 'rb')
            media_object_names = self.sess.post(f'/api/media', files=files).json()
            for _, f in files.items():
                f.close()

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


def signup_user(user_id, avatar):
    user = User(user_id)
    user.sign_up()
    user.sign_in()
    if avatar:
        user.update_avatar(avatar)
    return user


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
    mongodb = pymongo.MongoClient("mongodb://localhost:19023/minigplus")
    print("Vacuuming mongodb")
    mongodb.drop_database("minigplus")

    # Drop everything in redis
    r = redis.from_url("redis://localhost:19024")
    print("Vacuuming redis")
    r.flushall()

    print("Dumping dummy data")
    # Sign up some users
    ghost = signup_user('ghost', None)
    official = signup_user('official', None)
    kt = signup_user('kt', 'kt.jpeg')
    ika = signup_user('ika', 'ika.jpeg')
    soybean = signup_user('soybean', 'soybean.png')
    xiaolaba = signup_user('xiaolaba', 'xiaolaba.png')
    buki = signup_user('buki', 'buki.png')
    kyo = signup_user('kyo', 'kyo.png')
    duff = signup_user('duff', 'duff.jpg')
    kele = signup_user('kele', 'kele.jpg')
    ahuhu = signup_user('ahuhu', 'ahuhu.png')
    luxiyuan = signup_user('luxiyuan', 'luxiyuan.jpeg')
    roddyzhang = signup_user('roddyzhang', 'roddyzhang.png')
    mawei = signup_user('mawei', 'mawei.jpg')
    horo = signup_user('horo', 'horo.png')
    everybody = ['kt', 'soybean', 'xiaolaba', 'buki', 'kyo', 'duff', 'kele', 'ahuhu', 'luxiyuan', 'roddyzhang', 'mawei',
                 'horo']
    everybody_obj = [kt, soybean, xiaolaba, buki, kyo, duff, kele, ahuhu, luxiyuan, roddyzhang, mawei, horo, ika]

    # Create some circles
    kt_gplus_circle_id = kt.create_circle('g+')
    ahuhu_limited_circle_id = ahuhu.create_circle('limited')

    # Add people to circles
    ahuhu.add_user_to_circle(ahuhu_limited_circle_id, 'ika')
    ahuhu.add_user_to_circle(ahuhu_limited_circle_id, 'kele')
    ahuhu.add_user_to_circle(ahuhu_limited_circle_id, 'duff')

    # Add some followings
    for user in everybody:
        ika.follow(user)

    # Create some posts
    official.create_post('Welcome to pill.city! '
                         'Click the Users tab on top (or the left most tab if you are on a phone) '
                         'to start following people!', is_public=True)
    with open('./scripts/xss.txt') as f:
        kt.create_post(f.read(), is_public=True, circle_ids=[kt_gplus_circle_id])
    kt.create_post(' _Hello, World!_ ', is_public=True)
    xiaomoyu_id = ika.create_post('大家好我是小墨魚 qwq', is_public=True)
    ika.create_post('@buki  -叔叔快看- ', is_public=True, media_filenames=['gaygineer.jpg'], mentioned_user_ids=['buki'])
    sizhongfangshi_id = soybean.create_post('谁告诉你连着wifi就不会耗流量了？ ！ \n\nApp的网络访问方式起码在Android就有四种，其中一种是仅使用GSM网络',
                                            is_public=True, reshareable=True)
    huoguomei_id = roddyzhang.create_post("打个DOTA打到一般忽然壕语文的麦克风里出现妹子催促他快点打完吃火锅， -耿耿于怀啊- \n\n -JB文必须死- ", is_public=True,
                                          media_filenames=['huoguomei.png'])
    heisi_id = ahuhu.create_post(None, is_public=False, circle_ids=[ahuhu_limited_circle_id],
                                 reshareable=True,
                                 media_filenames=['heisi1.jpeg', 'heisi2.jpeg', 'heisi3.jpeg', 'heisi4.jpeg'])
    weiji_id = horo.create_post('你这种伪基佬真淫家早该B了！@mawei ', is_public=True, mentioned_user_ids=['mawei'])
    kotori_id = kt.create_post('啊啊啊啊啊啊阿啊啊啊啊啊啊啊啊 @ika', is_public=True, mentioned_user_ids=['ika'], media_filenames=['kotori1.jpg', 'kotori2.jpg', 'kotori3.jpg', 'kotori4.jpg'])

    # Create some reshares
    sizhongzhuanfa_id = luxiyuan.create_post(
        '''有一回，骚豆菊苣对我说道：“你用过Android么？”我略略点一点头。
他说：“用过……我便考你一考。AndroidApp的网络访问方式，是怎样的？”
我懒懒地答他道：“谁要你教，不就是wifi之类的么？”
骚豆菊苣显出极高兴的样子，将两个指头敲着柜台，点头说：“对呀对呀！App访问网络有四种方式，你知道么？”
我愈不耐烦了，努着嘴走远。骚豆菊苣刚用指甲蘸了酒，想在柜上画图，见我毫不热心，便又叹一口气，显出极惋惜的样子。''',
        is_public=True, reshareable=True, reshared_from=sizhongfangshi_id)
    kele.create_post('啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊', is_public=True, reshareable=True, reshared_from=heisi_id)

    # Create some reactions
    for i, user in enumerate(everybody_obj):
        user.create_reaction(sizhongzhuanfa_id, '➕')
        if i < 6:
            user.create_reaction(huoguomei_id, '🔥')
        if i < 9:
            user.create_reaction(huoguomei_id, '➕')
        if i < 8:
            user.create_reaction(xiaomoyu_id, '➕')

    # Create some comments
    duff.create_comment(heisi_id, '啊啊啊啊啊啊啊啊啊')
    ika.create_comment(heisi_id, '四齋蒸鵝心')
    mawei.create_comment(weiji_id, '毛的！！')
    weiji_comment_id = mawei.create_comment(weiji_id, '过几天我就真的要搞基了好吧！！')
    horo.create_nested_comment(weiji_id, weiji_comment_id, '。。。')
    horo.create_nested_comment(weiji_id, weiji_comment_id, '为啥')
    mawei.create_nested_comment(weiji_id, weiji_comment_id, '@horo 都把人家约到家里了好吧！！', ['horo'])
    kt.create_comment(xiaomoyu_id, '你好我是 kt')
    kyo_kt_kotori_comment_id = kyo.create_comment(kotori_id, None, media_filenames=['szzex1.jpg'])
    ika_kt_kotori_comment_id = ika.create_comment(kotori_id, '四齋蒸鵝心', media_filenames=['szzex2.jpg'])
    ika_kt_kotori_comment2_id = ika.create_comment(kotori_id, None, media_filenames=['szzex2.jpg'])
    ika.create_nested_comment(kotori_id, ika_kt_kotori_comment_id, '四齋蒸鵝心', media_filenames=['szzex2.jpg'])
    ika.create_nested_comment(kotori_id, ika_kt_kotori_comment2_id, None, media_filenames=['szzex2.jpg'])
    kyo.delete_comment(kotori_id, kyo_kt_kotori_comment_id)
    kt.delete_post(kotori_id)


if __name__ == '__main__':
    main()
