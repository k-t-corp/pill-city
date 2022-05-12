from abc import ABC, abstractmethod
from typing import Optional
from flask import Blueprint
from .platform import PillCityServerPlatform


class PillCityServerPlugin(ABC):
    def __init__(self, platform: PillCityServerPlatform):
        self.platform = platform  # type: PillCityServerPlatform

    @abstractmethod
    def get_name(self) -> str:
        pass

    @abstractmethod
    def init(self):
        pass

    @abstractmethod
    def job(self):
        pass

    @abstractmethod
    def flask_blueprint(self) -> Optional[Blueprint]:
        pass
