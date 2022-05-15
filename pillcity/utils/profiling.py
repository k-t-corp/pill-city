import os
import functools
from .now_ms import now_ms


def timer(func):
    """Print the runtime of the decorated function"""
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        if not os.getenv('PROFILE'):
            return func(*args, **kwargs)
        start_time = now_ms()
        value = func(*args, **kwargs)
        end_time = now_ms()
        run_time = end_time - start_time
        print(f"Finished {func.__name__!r} in {run_time} milliseconds")
        return value
    return wrapper_timer
