import json

import numpy as np
import pandas
from sklearn.preprocessing import OneHotEncoder

from idict import let


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


def nomcols(input="X", output="nomcols", **kwargs):
    """
    >>> import numpy as np
    >>> X = np.array([[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]])
    >>> nomcols(X=X)
    {'nomcols': [1], '_history': Ellipsis}
    """
    X = kwargs[input]
    idxs = []
    for i, x in enumerate(X[0]):
        if not is_number(x):
            idxs.append(i)
    return {output: idxs, "_history": ...}


nomcols.metadata = {
    "id": "---------------------------------nomcols",
    "name": "nomcols",
    "description": "List column indices of nominal attributes.",
    "parameters": ...,
    "code": ...,
}


def binarize(input="X", idxsin="nomcols", output="Xbin", **kwargs):
    """
    >>> import numpy as np
    >>> X = np.array([[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]])
    >>> binarize(X=X, nomcols=[1])
    {'Xbin': array([[1. , 0. , 0. , 0. , 1.6],
           [0. , 1. , 0. , 3.2, 2. ],
           [0. , 0. , 1. , 8. , 3. ]]), '_history': Ellipsis}
    """
    X = kwargs[input]
    cols = kwargs[idxsin]
    encoder = OneHotEncoder()
    nom = encoder.fit_transform(X[:, cols]).toarray()
    num = np.delete(X, cols, axis=1).astype(float)
    Xout = np.column_stack((nom, num))
    return {output: Xout, "_history": ...}


binarize.metadata = {
    "id": "--------------------------------binarize",
    "name": "binarize",
    "description": "Binarize nominal attributes so they can be handled as numeric.",
    "parameters": ...,
    "code": ...,
}


def X2histogram(col=0, input="X", output="histogram", **kwargs):
    """
    >>> import numpy as np
    >>> X = np.array([[0, 2.1, 1.6], [3.2, 3, 2], [8, 7, 3]])
    >>> X2histogram(X=X, col=1)
    {'histogram': [{'x': '(1.1, 1.59]', 'count': 0}, {'x': '(1.59, 2.08]', 'count': 0}, {'x': '(2.08, 2.57]', 'count': 1}, {'x': '(2.57, 3.06]', 'count': 1}, {'x': '(3.06, 3.55]', 'count': 0}, {'x': '(3.55, 4.04]', 'count': 0}, {'x': '(4.04, 4.53]', 'count': 0}, {'x': '(4.53, 5.02]', 'count': 0}, {'x': '(5.02, 5.51]', 'count': 0}, {'x': '(5.51, 6.0]', 'count': 0}, {'x': '(6.0, 6.49]', 'count': 0}, {'x': '(6.49, 6.98]', 'count': 0}, {'x': '(6.98, 7.47]', 'count': 1}, {'x': '(7.47, 7.96]', 'count': 0}], '_history': Ellipsis}
    """
    X = kwargs[input]
    cut = list(map(float, X[:, col]))
    maximum = max(cut)
    minimum = min(cut)
    step = (maximum - minimum) / 10
    ranges = np.arange(minimum - 1, maximum + 1, step)

    df = pandas.DataFrame(cut)
    df2 = df.groupby(pandas.cut(cut, ranges)).count()
    result = [{"x": str(k), "count": v} for k, v in df2.to_dict()[0].items()]
    return {output: result, "_history": ...}


X2histogram.metadata = {
    "id": "-----------------------------X2histogram",
    "name": "X2histogram",
    "description": "Generate a histogram for the specified column of a field.",
    "parameters": ...,
    "code": ...,
}


def obj2str(input="obj", output="str", **kwargs):
    """
    >>> import numpy as np
    >>> X = [[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]]
    >>> obj2str(obj=X)
    {'str': '[[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]]', '_history': Ellipsis}
    """
    return {output: json.dumps(kwargs[input]), "_history": ...}


obj2str.metadata = {
    "id": "---------------------------json--obj2str",
    "name": "obj2str",
    "description": "Generate a JSON-formatted text representing the given object.",
    "parameters": ...,
    "code": ...,
}


def histogram_macro(d, col):
    """
    >>> import numpy as np
    >>> from idict import idict
    >>> X = np.array([[0, "a", 1.6], [3.2, "b", 2], [8, "c", 3]])
    >>> d = idict(X=X)
    >>> histogram_macro(d, col=2).str
    '[{"x": "(0.6, 0.74]", "count": 0}, {"x": "(0.74, 0.88]", "count": 0}, {"x": "(0.88, 1.02]", "count": 0}, {"x": "(1.02, 1.16]", "count": 0}, {"x": "(1.16, 1.3]", "count": 0}, {"x": "(1.3, 1.44]", "count": 0}, {"x": "(1.44, 1.58]", "count": 0}, {"x": "(1.58, 1.72]", "count": 1}, {"x": "(1.72, 1.86]", "count": 0}, {"x": "(1.86, 2.0]", "count": 1}, {"x": "(2.0, 2.14]", "count": 0}, {"x": "(2.14, 2.28]", "count": 0}, {"x": "(2.28, 2.42]", "count": 0}, {"x": "(2.42, 2.56]", "count": 0}, {"x": "(2.56, 2.7]", "count": 0}, {"x": "(2.7, 2.84]", "count": 0}, {"x": "(2.84, 2.98]", "count": 0}, {"x": "(2.98, 3.12]", "count": 1}, {"x": "(3.12, 3.26]", "count": 0}, {"x": "(3.26, 3.4]", "count": 0}, {"x": "(3.4, 3.54]", "count": 0}, {"x": "(3.54, 3.68]", "count": 0}, {"x": "(3.68, 3.82]", "count": 0}, {"x": "(3.82, 3.96]", "count": 0}]'
    """
    return d >> nomcols >> binarize >> let(X2histogram, col=col) >> let(obj2str, input="histogram")
