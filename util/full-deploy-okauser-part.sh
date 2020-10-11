echo "Deleting venv..."
rm /home/oka/oka-repository/backend/venv -rf

echo "Creating venv..."
cd /home/oka/oka-repository/backend/
python3.8 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -e ~/cruipto
pip install -e ~/transf
pip install -e ~/aiuna
pip install -e ~/tatu
pip install -e ~/akangatu
pip install -e ~/kururu
pip install -e ~/tatu
pip install redis eventlet flask_socketio gunicorn pymysql

echo "Pulling..."
cd /home/oka/oka-repository/ && git pull; cd -
cd /home/oka/tatu/ && git pull; cd -
cd /home/oka/akangatu/ && git pull; cd -
cd /home/oka/transf/ && git pull; cd -
cd /home/oka/aiuna/ && git pull; cd -
cd /home/oka/kururu/ && git pull; cd -
cd /home/oka/cruipto/ && git pull; cd -
cd /home/oka/oka-repository/frontend && npm run-script build; cd -
cd /home/oka/oka-repository/backend

echo "flask migrating..."
flask db migrate

echo "flask upgrading..."
flask db upgrade




