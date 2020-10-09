cd /home/oka/oka-repository/ && sudo -u oka git pull; cd -
cd /home/oka/tatu/ && sudo -u oka git pull; cd -
cd /home/oka/akangatu/ && sudo -u oka git pull; cd -
cd /home/oka/transf/ && sudo -u oka git pull; cd -
cd /home/oka/aiuna/ && sudo -u oka git pull; cd -
cd /home/oka/kururu/ && sudo -u oka git pull; cd -
cd /home/oka/cruipto/ && sudo -u oka git pull; cd -
cd /home/oka/oka-repository/frontend && sudo -u oka npm run-script build; cd -
cd /home/oka/oka-repository/backend
source venv/bin/activate
flask db migrate
flask db upgrade
cd -
echo "Restart services..."
systemctl restart oka nginx celery

