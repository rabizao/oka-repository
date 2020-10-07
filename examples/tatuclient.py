import json

from aiuna.file import File
from tatu.okast import OkaSt
from util.create import user, token

print("Create user...")
# , base_url="http://data.analytics.icmc.usp.br")[0:2]
user = user("davips", "pass123")
print("Create token...")
token = token(**user)  # , base_url="http://data.analytics.icmc.usp.br")
with open("token.txt", "w") as f:
    json.dump({"token": token}, f)

print("OkaS")
storage = OkaSt(token=token)#, url="http://data.analytics.icmc.usp.br")

print("Reading file...")
data = File("iris.arff").data

print("Storing...")
storage.store(data)
print("ok!")

print("Fetching...")
d = storage.fetch(data.uuid)
print(d.id)

print("Fetching...")
d = storage.fetch("ØΐEʃωȒȥќǏшġμŃĔ")
print(d and d.id)
print(d and d.inner and d.inner.id)
