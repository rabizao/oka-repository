echo "Deleting venv..."
rm /home/oka/oka-repository/backend/venv -rf

echo "Deleting media and tatu-* ..."
cd /home/oka/
rm -rf $(find . -name "tatu-*") /home/oka/oka-repository/backend/app/media/* /home/oka/oka-repository/backend/migrations

echo "Creating venv..."
cd /home/oka/oka-repository/backend/
python3.8 -m venv venv
source venv/bin/activate
pip install -U setuptools
pip install wheel

echo "pipping..."
pip install -r requirements.txt
pip install -e ~/garoupa
pip install -e ~/transf
pip install -e ~/aiuna
pip install -e ~/tatu
pip install -e ~/akangatu
pip install -e ~/kururu
pip install -e ~/tatu
pip install redis eventlet flask_socketio gunicorn pymysql python-dotenv flask_sqlalchemy

echo "Pulling..."
cd /home/oka/oka-repository/ && git pull; cd -
cd /home/oka/tatu/ && git pull; cd -
cd /home/oka/akangatu/ && git pull; cd -
cd /home/oka/transf/ && git pull; cd -
cd /home/oka/aiuna/ && git pull; cd -
cd /home/oka/kururu/ && git pull; cd -
cd /home/oka/garoupa/ && git pull; cd -
cd /home/oka/oka-repository/frontend && npm run-script build; cd -
cd /home/oka/oka-repository/backend

echo "flask init..."
source venv/bin/activate
flask db init

echo "flask migrating..."
flask db migrate

echo "flask upgrading..."
flask db upgrade




