from cururu.okaserver import OkaServer
from pjdata.content.specialdata import UUIDData
from pjdata.creation import read_arff
from util.user import create_user, token

print("Create user and token...")
token = token(*create_user("okatest", "pass123")[0:2])

storage = OkaServer(post=True, token=token)

print("Reading file...")
data = read_arff("iris.arff")[1]

print("Storing...")
storage.store(data)
print("ok!")

print("Fetching...")
d = storage.fetch(UUIDData("ĹЇЖȡfĭϹƗͶэգ8Ƀű"))
print(d)
