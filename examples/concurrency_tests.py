from tatu.sql.mysql import MySQL
import requests


# Only tatu
tatu = MySQL(db='tatu:kururu@localhost/tatu', threaded=False)


def get_data():
    data = tatu.fetch("3l9bSwFwL0TsSztkDb0iuVQ", lazy=False)
    attrs = data.Xd
    print("ATTRS>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", attrs)


# Only SQLALchemy
response_login = requests.post(
    'http://localhost:5000/api/auth/login', json={"username": "rabizao", "password": "rafael"})
access_token = response_login.json()['access_token']
headers = {'Authorization': 'Bearer ' + access_token}

# for i in range(10000):
#     response_users = requests.get('http://localhost:5000/api/users/rabizao', headers=headers)
#     print(i, response_users.json()['username'])


# Tatu and SQLAlchemy
for i in range(10000):
    # get_data()
    response = requests.get(
        'http://localhost:5000/api/posts/1', headers=headers)
    print(i, response.json()['attrs'])
