from aiuna.config import STORAGE_CONFIG
from aiuna.file import File
from kururu.tool.communication.cache import Cache
from kururu.tool.communication.report import Report
from kururu.tool.enhancement.binarize import Binarize
from kururu.tool.enhancement.pca import PCA
from kururu.tool.evaluation.metric import Metric2
from kururu.tool.evaluation.split import Split
from kururu.tool.learning.supervised.classification.svm import SVM2

import random
import requests


def user(username=None, password=None, email=None, base_url="http://localhost:5000"):
    """Create a new user."""

    username = username or ("username" + str(random.randint(1, 100000)))
    password = password or ("password" + str(random.randint(1, 100000)))
    email = email or ("email@" + str(random.randint(1, 100000)) + ".com")

    url_createuser = base_url + '/api/users'
    data_createuser = {"username": username,
                       "password": password, "name": "Teste", "email": email}
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
    response_login = requests.post(
        base_url + "/api/auth/create-api-token", headers=headers)
    return response_login.json()['api_token']


# url = "http://data.analytics.icmc.usp.br"
url = "http://localhost:5000"
user = user("davips", "pass123", base_url=url)
okatoken = token(**user, base_url=url)
STORAGE_CONFIG["oka"] = {"engine": "oka", "token": okatoken, "url": url}
STORAGE_CONFIG["okapost"] = {
    "engine": "okapost", "token": okatoken, "url": url}
print("user created")

# TODO: multiple caches are not working regarding whether to post
# TIP: TsSplit should come before TrSplit to ensure the same original data is used as input for both.
wflow = (
    File("iris.arff")
    * Binarize
    * Cache(Split(test_size=0.23), storage_alias="okapost")
    * Cache(PCA(n=3), storage_alias="oka")
    * Report("{id}")
    * Cache(SVM2(C=0.5), storage_alias="oka")
    * Metric2
    * Report("tr {r}\t\tts {inner.r} \t\t{history^name}")
)

data = wflow.data

print("Data ID", data.id)
print("Shape", data.X.shape[1], len(data.Xt))
# print(test.arff("nome", "desc"))
