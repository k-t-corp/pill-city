import time


def now_ms():
    return time.time_ns() // 1_000_000
