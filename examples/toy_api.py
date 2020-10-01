# This example shows how to externally access the api by making requests.
# If you want to access from the same server and do the same kind of operations,
# there are examples of how to do this in tests.py file.

import random

import requests

base_url = 'http://localhost:5000/api/'   # apche/ngix redireciona api p/ porta
url_downloads = base_url + 'downloads/data?uuids=ġɼпϋæӖƱӌЄɬϳҢğv'

response = requests.get(url_downloads)
print(response.text)


exit()

# CREATE USER
url_createuser = base_url + 'users'

random_username = "username" + str(random.randint(1, 100000))
random_password = "password" + str(random.randint(1, 100000))
random_email = "email@" + str(random.randint(1, 100000)) + ".com"

data_createuser = {"username": random_username,
                   "password": random_password, "name": "Teste", "email": random_email}
response_createuser = requests.post(url_createuser, json=data_createuser)
print(response_createuser.text)


# GET AUTHENTICATION TOKEN
url_login = base_url + 'auth/login'

data_login = {"username": random_username, "password": random_password}
response_login = requests.post(url_login, json=data_login)
access_token = response_login.json()['access_token']
print("####################TOKEN####################\n" + access_token)

headers = {'Authorization': 'Bearer ' + access_token}

url_posts = base_url + 'posts'


# Ideia para funcao para criar post no oka
# oka.new_post(data=data, name="teste", description="description", token="token_site")
# oka.send_job(uuid=$#@%@!#$, code="ml")

# Caso de uso "store remoto" (apenas cache de resultado)
# storeserver.fetch()      -> busca Data no store remote usando credencial de forma transparente
# storeserver.store(Data)  -> guarda Data no store remote usando credencial de forma transparente

# caso de uso "compartilhamento
# Oka()
# oka.commit
# oka.find(name="asdsad", uuid="ffddsfdfasa")
# download / load / get
# oka.upload(data, name, description)
# oka.loaddata(uuid/filtros) -> data.arff
# oka.loadarff(uuid/filtros) -> data -> data.arff


# POSTS
print("CREATE A NEW POST TO THE AUTHENTICATED USER\n")
random_uuid = "uuid" + str(random.randint(1, 100000))

data_createpost = {"data_uuid": random_uuid,
                   "name": "Post teste", "description": "Este eh o description do post teste"}
r = requests.post(url_posts, json=data_createpost, headers=headers)
print(r.text)

print("GET ALL POSTS THAT BELONG TO THE AUTHENTICATED USER")
# The following request returns all the posts that the user that generated the token above has access to.
# The api knows who is making this request, so selections per user can be easily made.
# The response can be paginated and selections can be made
# by adding to the url (for example): ?name=teste&per_page=50&page=1
r = requests.get(url_posts, headers=headers)
print(r.text)
