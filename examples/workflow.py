from pjdata.config import STORAGE_CONFIG
from pjdata.content.specialdata import NoData
from pjml.tool.data.communication.cache import Cache
from pjml.tool.data.communication.report import Report
from pjml.tool.data.evaluation.metric import Metric
from pjml.tool.data.evaluation.split import TrSplit, TsSplit
from pjml.tool.data.flow.file import File
from pjml.tool.data.modeling.supervised.classifier.svmc import SVMC
from pjml.tool.data.processing.feature.binarize import Binarize
from pjml.tool.data.processing.feature.reductor.pca import PCA
from util.create import user, token

# url = "http://data.analytics.icmc.usp.br"
url = "http://localhost:5000"
user = user("davips", "pass123", base_url=url)[0:2]
okatoken = token(*user, base_url=url)
STORAGE_CONFIG["oka"] = {"engine": "oka", "token": okatoken, "url": url}
STORAGE_CONFIG["okapost"] = {"engine": "okapost", "token": okatoken, "url": url}
print("user created")

# TODO: multiple caches are not working regarding whether to post
# TIP: TsSplit should come before TrSplit to ensure the same original data is used as input for both.
wflow = File("iris.arff") \
        * Binarize() \
        * TsSplit() \
        * TrSplit() \
        * PCA(n=3) \
        * Report("{id}") \
        * SVMC(C=0.5) \
        * Cache(Metric(enhance=False), storage_alias="okapost") \
    # * Report("metric ... R: $R", enhance=False)

train, test = wflow.dual_transform(NoData, NoData)

print(train.id, test.id)
print(test.X.shape[1], len(test.Xt))
# print(test.arff("nome", "desc"))
