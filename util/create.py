# This file has functions that show how to externally access the api by making requests.
# If you want to access from the same server and do the same kind of operations,
# there are examples of how to do this in tests.py file.

import random

import requests


def user(username=None, password=None, email=None, base_url="http://localhost:5000"):
    """Create a new user."""

    username = username or ("username" + str(random.randint(1, 100000)))
    password = password or ("password" + str(random.randint(1, 100000)))
    email = email or ("email@" + str(random.randint(1, 100000)) + ".com")

    url_createuser = base_url + '/api/users'
    data_createuser = {"username": username, "password": password, "name": "Teste", "email": email}
    response_createuser = requests.post(url_createuser, json=data_createuser)
    print(response_createuser.text)
    return {"username": username, "password": password, "email": email}


def token(username, password, base_url="http://localhost:5000", email=None):
    """Create a new permanent token for the given user."""
    url_login = base_url + '/api/auth/login'
    data_login = {"username": username, "password": password}
    response_login = requests.post(url_login, json=data_login)

    # Temporary token
    access_token = response_login.json()['access_token']
    print("####################TOKEN####################\n" + access_token)

    # Permanent token
    headers = {'Authorization': 'Bearer ' + access_token}
    response_login = requests.post(base_url + "/api/auth/create-api-token", headers=headers)
    return response_login.json()['api_token']
