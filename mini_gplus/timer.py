import time


class Timer(object):
    def __enter__(self):
        self.start = round(time.time() * 1000)
        return self

    def __exit__(self, *args):
        self.end = round(time.time() * 1000)
        self.interval = self.end - self.start
