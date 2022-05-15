import time


def now_ms():
    return time.time_ns() // 1_000_000


def now_seconds():
    return time.time_ns() // 1_000_000_000
