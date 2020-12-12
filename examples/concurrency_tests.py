import multiprocessing
import operator
import time

import requests
from simplejson import JSONDecodeError

from aiuna.step.dataset import Dataset
from tatu.sql.mysql import MySQL

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

run = True


def f(conn):
    global run
    try:
        i = 0
        print("s", end='')
        while i < 40 and run:
            requests.get('http://localhost:5000/api/posts/1', headers=headers).json()
            print(".", end='', flush=True)
            i += 1
    except JSONDecodeError as e:
        print("X", end='', flush=True)
        conn.send(False)
        return str(e)
    return False


parent_conn, child_conn = multiprocessing.Pipe()
n_processes = 4
pool = mp.ProcessPool(n_processes)
results = pool.amap(f, [child_conn] * n_processes)
error = False
while True:
    time.sleep(0.1)
    finished = results.ready()
    error = parent_conn.poll()
    if finished or error:
        break

print("End")
pool.close()
# pool.join()
parent_conn.close()
child_conn.close()
pool.terminate()

print()

if error:
    print("ERROR")
else:
    print("OK")
