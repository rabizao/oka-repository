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
    'http://localhost:5000/api/auth/login', json={"username": "davips", "password": "pass123"})
print(response_login)
access_token = response_login.json()['access_token']
headers = {'Authorization': 'Bearer ' + access_token}

# for i in range(10000):
#     response_users = requests.get('http://localhost:5000/api/users/rabizao', headers=headers)
#     print(i, response_users.json()['username'])


# Tatu and SQLAlchemy


import pathos.multiprocessing as mp


def f(l):
    resps = []
    status = []
    try:
        for i in range(5):
            # response = get_data().id
            requests.get('http://localhost:5000/api/posts/1', headers=headers).json()
            status.append(True)
    except JSONDecodeError:
        resps.append(None)
        status.append(False)
    return all(status), resps


n_processes = 20
pool = mp.Pool(n_processes)
sts_rs_s = pool.map(f, [1] * n_processes)
pool.close()
pool.join()

print("OK" if all(x[0] for x in sts_rs_s) else list(filter(lambda a: not bool(a[0]), sts_rs_s))[:1])
