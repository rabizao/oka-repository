from imblearn.under_sampling import RandomUnderSampler as RUS
from sklearn.utils import resample

from idict import let
from idict.function.data import nomcols, binarize
from idict.function.model import fit
from idict.function.text import value2text
from idict.function.vizualization import X2histogram, Xy2scatterplot
from idict.macro.data import xywrapper
from idict.macro.higherorder import compose


def histogram_macro(col):
    """
    >>> import numpy as np
    >>> from idict import idict
    >>> X = np.array([[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]])
    >>> (idict(X=X) >> histogram_macro(2)).text
    '[{"x": "(0.6, 0.74]", "count": 0}, {"x": "(0.74, 0.88]", "count": 0}, {"x": "(0.88, 1.02]", "count": 0}, {"x": "(1.02, 1.16]", "count": 0}, {"x": "(1.16, 1.3]", "count": 0}, {"x": "(1.3, 1.44]", "count": 0}, {"x": "(1.44, 1.58]", "count": 0}, {"x": "(1.58, 1.72]", "count": 1}, {"x": "(1.72, 1.86]", "count": 0}, {"x": "(1.86, 2.0]", "count": 1}, {"x": "(2.0, 2.14]", "count": 0}, {"x": "(2.14, 2.28]", "count": 0}, {"x": "(2.28, 2.42]", "count": 0}, {"x": "(2.42, 2.56]", "count": 0}, {"x": "(2.56, 2.7]", "count": 0}, {"x": "(2.7, 2.84]", "count": 0}, {"x": "(2.84, 2.98]", "count": 0}, {"x": "(2.98, 3.12]", "count": 1}, {"x": "(3.12, 3.26]", "count": 0}, {"x": "(3.26, 3.4]", "count": 0}, {"x": "(3.4, 3.54]", "count": 0}, {"x": "(3.54, 3.68]", "count": 0}, {"x": "(3.68, 3.82]", "count": 0}, {"x": "(3.82, 3.96]", "count": 0}]'
    """
    return compose(nomcols, binarize, let(X2histogram, col=col))


def scatter_macro(colx, coly, n=500, seed=0):
    """
    >>> import numpy as np
    >>> from idict import idict
    >>> X = np.array([[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]])
    >>> y = np.array([2, 4.6, 3.2])
    >>> (idict(X=X, y=y) >> scatter_macro(0,2)).text
    '[{"id": 2.0, "data": [{"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}, {"x": 0.0, "y": 1.6}]}, {"id": 3.2, "data": [{"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}, {"x": 8.0, "y": 3.0}]}, {"id": 4.6, "data": [{"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}, {"x": 3.2, "y": 2.0}]}]'
    """
    return compose(let(fit, algorithm=RUS),
                   xywrapper(function=resample, n_samples=n, random_state=seed),
                   nomcols,
                   binarize,
                   let(Xy2scatterplot, colx=colx, coly=coly))
