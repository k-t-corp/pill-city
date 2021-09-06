import os
import functools
import time


def timer(func):
    """Print the runtime of the decorated function"""
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        if not os.getenv('PROFILE'):
            return func(*args, **kwargs)
        start_time = time.time_ns() // 1_000_000
        value = func(*args, **kwargs)
        end_time = time.time_ns() // 1_000_000
        run_time = end_time - start_time
        print(f"Finished {func.__name__!r} in {run_time} milliseconds")
        return value
    return wrapper_timer
