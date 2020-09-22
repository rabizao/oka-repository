import json

from cururu.okaserver import OkaServer
from pjdata.content.specialdata import UUIDData
from pjdata.creation import read_arff
from util.create import user, token

print("Create user and token...")
user = user("davips", "pass123", base_url="http://data.analytics.icmc.usp.br/api")[0:2]
token = token(*user, base_url="http://data.analytics.icmc.usp.br/api")
with open("token.txt", "w") as f:
    json.dump({"token": token}, f)

storage = OkaServer(post=True, token=token, url="http://data.analytics.icmc.usp.br/api/cururu")

print("Reading file...")
data = read_arff("iris.arff")[1]

print("Storing...")
storage.store(data)
print("ok!")

print("Fetching...")
d = storage.fetch(UUIDData("ĹЇЖȡfĭϹƗͶэգ8Ƀű"))
print(d)
