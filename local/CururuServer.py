from io import BytesIO

import requests

from cururu.persistence import Persistence
from cururu.pickleserver import PickleServer
from pjdata.aux.compression import pack, unpack
from pjdata.content.specialdata import UUIDData
from pjdata.creation import read_arff
from pjdata.types import Data


class CururuServer(Persistence):
    def __init__(self, token, url="http://localhost:5000/api/cururu"):
        self.headers = {'Authorization': 'Bearer ' + token}
        self.url = url

    def store(self, data: Data, check_dup: bool = True):
        packed = pack(data)
        files = {'file': BytesIO(packed)}
        r = requests.post(self.url, files=files, headers=self.headers)

    def _fetch_impl(self, data: Data, lock: bool = False) -> Data:
        response = requests.get(self.url + f"?uuid={data.id}", headers=self.headers)
        return unpack(response.content.getbuffer())

    def fetch_matrix(self, id):
        pass

    def list_by_name(self, substring, only_historyless=True):
        pass

    def unlock(self, data, training_data_uuid=None):
        pass


data = read_arff('iris.arff')[1]
storage = CururuServer("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1OTg5MDExMDMsIm5iZiI6MTU5ODkwMTEwMywianRpIjoiZjRkMzQ4OTYtOWNmNy00YzRjLWJhYmYtYmFjZGQzMjQ2NDYzIiwiZXhwIjoxNTk4OTQ0MzAzLCJpZGVudGl0eSI6ImRhdmlwcyIsImZyZXNoIjpmYWxzZSwidHlwZSI6ImFjY2VzcyJ9.ZQWrKdPsrUExRCw4VqVJ7J14tDfktUm0QqSdtx75YUI")
d = storage.fetch(data.hollow())
print(d)
