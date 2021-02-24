import pathos.multiprocessing as mp
import multiprocessing
import time
from getpass import getpass

import requests
from simplejson import JSONDecodeError

print("Lembrar de inserir um iris.arff pela web")
username = input("Username to connect to OKA: ")
password = getpass("Password to connect to OKA: ")
data = {"username": username, "password": password}
# Only SQLALchemy
response_login = requests.post(
    'http://data.analytics.icmc.usp.br/api/auth/login', json=data)
print(response_login)
access_token = response_login.json()['access_token']
headers = {'Authorization': 'Bearer ' + access_token}

run = True
last_error = None


def f(conn):
    global run, last_error
    try:
        i = 0
        print("s", end='')
        while i < 100 and run:
            requests.get('http://data.analytics.icmc.usp.br/api/posts/5',
                         headers=headers).json()
            print(".", end='', flush=True)
            i += 1
    except JSONDecodeError as e:
        print("X", end='', flush=True)
        conn.send(str(e) + " <----- " + response.text)


start = time.time()

parent_conn, child_conn = multiprocessing.Pipe()
n_processes = 100
pool = mp.ProcessPool(n_processes)
results = pool.amap(f, [child_conn] * n_processes)
error = False
while True:
    time.sleep(1)
    finished = results.ready()
    error = parent_conn.poll()
    last_error = error and parent_conn.recv()
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
    print(last_error)
    print("ERROR")
else:
    end = time.time()
    print("OK", end - start, "s")
