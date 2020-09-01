from pjdata.config import STORAGE_CONFIG
from pjdata.content.specialdata import NoData
from pjml.tool.data.communication.cache import Cache
from pjml.tool.data.communication.report import Report
from pjml.tool.data.evaluation.metric import Metric
from pjml.tool.data.evaluation.split import TrSplit, TsSplit
from pjml.tool.data.flow.file import File
from pjml.tool.data.modeling.supervised.classifier.svmc import SVMC
from pjml.tool.data.processing.feature.reductor.pca import PCA
from util.create import user, token

okatoken = token(*user("okatest", "pass123")[0:2])
STORAGE_CONFIG["oka"] = {"engine": "oka", "token": okatoken, "post": True}

wflow = Cache(
    File("iris.arff"),
    TsSplit(),  # TsSplit should come before TrSplit to ensure the same original data is used as input for both.
    TrSplit(),
    PCA(),
    SVMC(),
    Metric(enhance=False),
    Report("metric ... R: $R", enhance=False),
    storage_alias="oka"
)
train, test = wflow.dual_transform(NoData, NoData)
