import io
import json
import threading
# import aiuna
# exit()
from aiuna.file import File
from kururu.tool.communication.cache import Cache
from kururu.tool.communication.log import Log
from kururu.tool.communication.report import Report
from kururu.tool.enhancement.binarize import Binarize
from kururu.tool.enhancement.pca import PCA
from kururu.tool.evaluation.metric import Metric2
from kururu.tool.evaluation.split import Split, Split1
from kururu.tool.learning.supervised.classification.svm import SVM2

import random
import requests
from kururu.tool.learning.supervised.classification.svm import SVM2
from tatu.pickle_ import Pickle
from tatu.sql.mysql import MySQL
from tatu.sql.sqlite import SQLite
from util.create import user, token
#
#
# # TODO: multiple caches are not working regarding whether to post
# # TIP: TsSplit should come before TrSplit to ensure the same original data is used as input for both.
# from tatu.okast import OkaSt

cfg = json.load(open("config.json"))
my = MySQL(db=cfg["lmy"]["db"])

# oka = OkaSt(okatoken, alias="Iris", url=url)
sq = SQLite()
# my = MySQL(db="oka:kururu@localhost/oka")
#
wflow = (
        File("iris.arff")
        * Binarize
        * Split
        * PCA(n=3)
        * Cache(PCA(n=3), storage=sq)
        # * Cache(PCA(n=3), storage=oka)
        * PCA(n=3)
        * Log(">>>>>>>>>>>>>>>>> {X.shape} {inner.X.shape}")
        * Report("{id}")
        # * Cache(SVM2(C=0.25), storage=my)
    # * Metric2
    # * Report("tr {r}\t\tts {inner.r}")
)

data = wflow.data

print("Data ID", data.id)


# print("Shape", data.X.shape[1], len(data.Xt))


#
# data >>= PCA()
# print(data.id)
# TODO  queue = None qnd descomenta acima
# sq.update_remote(my)
# my.update_remote(OkaSt(okatoken, alias="Iris", url=url))
# SQLite().update_remote(MySQL(db="oka:kururu@localhost/oka"))


data >>= PCA()
print(" _________ d id:", data.id)

p = data.parent_uuid
print(" _________    children:", my.fetch_children(p), p.id)

def test_okast_id():
    from util.create import user, token
    url = "http://localhost:5000"
    user = user("davips", "pass123", base_url=url)
    okatoken = token(**user, base_url=url)
    print("user created")
    o = OkaSt(token=okatoken, url=url)
    print(f"idddddd {o.id}")

# test_okast_id()
