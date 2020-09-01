from pjdata.config import STORAGE_CONFIG
from pjdata.content.specialdata import NoData
from pjml.tool.data.communication.cache import Cache
from pjml.tool.data.communication.report import Report
from pjml.tool.data.evaluation.metric import Metric
from pjml.tool.data.evaluation.split import TrSplit, TsSplit
from pjml.tool.data.flow.file import File
from pjml.tool.data.modeling.supervised.classifier.svmc import SVMC
from pjml.tool.data.processing.feature.reductor.pca import PCA
from pjml.workflow import Workflow
from util.create import user, token

okatoken = token(*user("okatest", "pass123")[0:2])
STORAGE_CONFIG["oka"] = {"engine": "oka", "token": okatoken}
STORAGE_CONFIG["okapost"] = {"engine": "okapost", "token": okatoken}

# TODO: multiple caches are not working regarding whether to post
wflow = Workflow(
    File("iris.arff"),
    TsSplit(),  # TsSplit should come before TrSplit to ensure the same original data is used as input for both.
    TrSplit(),
    PCA(n=4),
    # Cache(PCA(n=4), storage_alias="oka"),
    Report("{id}"),
    SVMC(),
    Cache(Metric(enhance=False), storage_alias="okapost"),
    Report("metric ... R: $R", enhance=False)
)
train, test = wflow.dual_transform(NoData, NoData)
