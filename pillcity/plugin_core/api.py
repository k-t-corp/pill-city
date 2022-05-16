from abc import ABC, abstractmethod
from typing import Optional
from flask import Blueprint
from .context import PillCityPluginContext


class PillCityPlugin(ABC):
    def __init__(self, context: PillCityPluginContext):
        self._context = context  # type: PillCityPluginContext

    def get_context(self) -> PillCityPluginContext:
        return self._context

    @abstractmethod
    def init(self):
        pass

    @abstractmethod
    def job(self):
        pass

    @abstractmethod
    def job_interval_seconds(self) -> int:
        pass

    @abstractmethod
    def flask_blueprint(self) -> Optional[Blueprint]:
        pass
