import random

import requests

# my = MySQL(db=cfg["lmy"]["db"])
#
# # oka = OkaSt(okatoken, alias="Iris", url=url)
# sq = SQLite()
# # my = MySQL(db="oka:kururu@localhost/oka")
# #
# wflow = (
#     File("iris.arff")
#     * Binarize
#     * Split
#     * PCA(n=3)
#     * Cache(PCA(n=3), storage=sq)
#     # * Cache(PCA(n=3), storage=oka)
#     * PCA(n=3)
#     * Log(">>>>>>>>>>>>>>>>> {X.shape} {inner.X.shape}")
#     * Report("{id}")
#     # * Cache(SVM2(C=0.25), storage=my)
#     # * Metric2
#     # * Report("tr {r}\t\tts {inner.r}")
# )
#
# data = wflow.data
#
# print("Data ID", data.id)
#
#
# # print("Shape", data.X.shape[1], len(data.Xt))
#
#
# #
# # data >>= PCA()
# # print(data.id)
# # TODO  queue = None qnd descomenta acima
# # sq.update_remote(my)
# # my.update_remote(OkaSt(okatoken, alias="Iris", url=url))
# # SQLite().update_remote(MySQL(db="oka:kururu@localhost/oka"))
#
#
# data >>= PCA()
# print(" _________ d id:", data.id)
#
# p = data.parent_uuid
# print(" _________    children:", my.fetch_children(p), p.id)
# import aiuna
# exit()
#
#
# # TODO: multiple caches are not working regarding whether to post
# # TIP: TsSplit should come before TrSplit to ensure the same original data is used as input for both.
# from tatu.okast import OkaSt
# cfg = json.load(open("config.json"))


def user(username=None, password=None, email=None, base_url="http://localhost:5000"):
    """Create a new user."""

    username = username or ("username" + str(random.randint(1, 100000)))
    password = password or ("password" + str(random.randint(1, 100000)))
    email = email or ("email@" + str(random.randint(1, 100000)) + ".com")

    url_createuser = base_url + '/api/users'
    data_createuser = {"username": username, "password": password, "name": "Teste", "email": email}
    response_createuser = requests.post(url_createuser, json=data_createuser)
    print(response_createuser.text)
    return {"username": username, "password": password, "email": email}


def test_okast_id():
    url = "http://localhost:5000"
    user("davips", "pass123", base_url=url)
    user("testes", "pass123", base_url=url)
    print("user created")
    # o = OkaSt(token=okatoken, url=url)
    # print(f"idddddd {o.id}")


test_okast_id()
