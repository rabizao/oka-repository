from typing import Dict, TypeVar


def check(key):
    if not isinstance(key, str):
        raise WrongKeyType(f"Key must be string, not {type(key)}.", key)


VT = TypeVar("VT")


class SQLAdict(Dict[str, VT]):
    """
    Dict-like persistence based on SQLAlchemy

    Usage:

    >>> d = SQLAdict("sqlite:///test.db")
    >>> d["x"] = 5
    >>> d["x"]
    5

    """

    def __init__(self, url):
        super().__init__()
        self.url = url

    def __contains__(self, key):
        check(key)
        return key in self.data  # aqui em vez de usar self.data, usaria SQLAlchemy

    def __setitem__(self, key: str, value):
        check(key)
        self.data[key] = value  # aqui em vez de usar self.data, usaria SQLAlchemy

    def __getitem__(self, key):
        check(key)
        return self.data[key]  # aqui em vez de usar self.data, usaria SQLAlchemy

    def __delitem__(self, key):
        check(key)
        del self.data[key]  # aqui em vez de usar self.data, usaria SQLAlchemy (não essencial agora)

    def __getattr__(self, key):
        check(key)
        return self.__getattribute__(key)


class WrongKeyType(Exception):
    pass
