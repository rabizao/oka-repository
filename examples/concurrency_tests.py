import multiprocessing
import operator
import time

import requests
from simplejson import JSONDecodeError

from aiuna.step.dataset import Dataset

print("Lembrar de inserir um iris.arff pela web")

# Only SQLALchemy
response_login = requests.post(
    'http://localhost:5000/api/auth/login', json={"username": "davips", "password": "pass123"})
print(response_login)
access_token = response_login.json()['access_token']
headers = {'Authorization': 'Bearer ' + access_token}

import pathos.multiprocessing as mp

run = True


def f(conn):
    global run
    try:
        i = 0
        print("s", end='')
        while i < 50 and run:
            requests.get('http://localhost:5000/api/posts/1', headers=headers).json()
            print(".", end='', flush=True)
            i += 1
    except JSONDecodeError as e:
        print("X", end='', flush=True)
        conn.send(False)
        return str(e)
    return False


parent_conn, child_conn = multiprocessing.Pipe()
n_processes = 50
pool = mp.ProcessPool(n_processes)
results = pool.amap(f, [child_conn] * n_processes)
error = False
while True:
    time.sleep(1)
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
