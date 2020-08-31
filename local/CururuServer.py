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
        return unpack(response.content)

    def fetch_matrix(self, id):
        pass

    def list_by_name(self, substring, only_historyless=True):
        pass

    def unlock(self, data, training_data_uuid=None):
        pass


