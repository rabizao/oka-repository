import requests
from simplejson import JSONDecodeError

from aiuna.step.dataset import Dataset
from tatu.sql.mysql import MySQL

# Only tatu
tatu = MySQL(db='tatu:kururu@localhost/tatu', threaded=False)

tatu.store(Dataset().data, ignoredup=True)
tatu.close()

print("Lembrar de inserir um iris.arff pela web")


def get_data():
    data = tatu.fetch("06nk9kyCi8ywesyM8Pjw1jv", lazy=False)
    _ = data.Xd
    return data


# Only SQLALchemy
response_login = requests.post(
    'http://localhost:5000/api/auth/login', json={"username": "rabizao", "password": "rafael"})
access_token = response_login.json()['access_token']
headers = {'Authorization': 'Bearer ' + access_token}

# for i in range(10000):
#     response_users = requests.get('http://localhost:5000/api/users/rabizao', headers=headers)
#     print(i, response_users.json()['username'])


# Tatu and SQLAlchemy


import pathos.multiprocessing as mp


def f(l):
    try:
        rs = []
        for i in range(20):
            # response = get_data().id
            response = requests.get('http://localhost:5000/api/posts/1', headers=headers).json()
            rs.append(response)
    except JSONDecodeError:
        return False
    return rs


pool = mp.Pool()
rs = pool.map(f, [1, 2, 3])
pool.close()
pool.join()

print("OK" if all(rs) else rs)
