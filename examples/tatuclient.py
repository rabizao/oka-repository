import json

from aiuna.file import File
from tatu.okaserver import OkaServer
from aiuna.content.specialdata import UUIDData
from aiuna.creation import read_arff
from util.create import user, token

print("Create user...")
user = user("davips", "pass123")#, base_url="http://data.analytics.icmc.usp.br")[0:2]
print("Create token...")
token = token(**user) #, base_url="http://data.analytics.icmc.usp.br")
with open("token.txt", "w") as f:
    json.dump({"token": token}, f)

print("OkaS")
storage = OkaServer(post=True, token=token)#, url="http://data.analytics.icmc.usp.br")

print("Reading file...")
data = File("iris.arff").data

print("Storing...")
storage.store(data)
print("ok!")

print("Fetching...")
d = storage.fetch(UUIDData(data.uuid))
print(d.id)
