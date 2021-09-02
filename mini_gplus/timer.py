import time


class Timer(object):
    def __enter__(self):
        self.start = time.time_ns() // 1000000
        return self

    def __exit__(self, *args):
        self.end = time.time_ns() // 1000000
        self.interval = self.end - self.start
