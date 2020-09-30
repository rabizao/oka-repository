from aiuna.config import STORAGE_CONFIG
from aiuna.file import File
from kururu.tool.communication.cache import Cache
from kururu.tool.communication.report import Report
from kururu.tool.enhancement.binarize import Binarize
from kururu.tool.enhancement.pca import PCA
from kururu.tool.evaluation.metric import Metric
from kururu.tool.evaluation.split import Split
from kururu.tool.learning.supervised.classification.svm import SVM
from tatu.pickleserver import PickleServer

from util.create import user, token

# url = "http://data.analytics.icmc.usp.br"
url = "http://localhost:5000"
user = user("davips", "pass123", base_url=url)
okatoken = token(**user, base_url=url)
STORAGE_CONFIG["oka"] = {"engine": "oka", "token": okatoken, "url": url}
STORAGE_CONFIG["okapost"] = {"engine": "okapost", "token": okatoken, "url": url}
print("user created")

# TODO: multiple caches are not working regarding whether to post
# TIP: TsSplit should come before TrSplit to ensure the same original data is used as input for both.
wflow = File("iris.arff") \
        * Binarize() \
        * Cache(Split(), storage_alias="okapost") \
        * PCA(n=3) \
        * Report("{id}") \
        * SVM(C=0.5) \
        * Metric()
    # * Report("metric ... R: $R", enhance=False)

data = wflow.data

print("Data ID", data.id)
print("Shape", data.X.shape[1], len(data.Xt))
# print(test.arff("nome", "desc"))
