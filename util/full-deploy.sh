cd /home/oka/oka-repository/ && sudo -u oka git pull; cd -
cd /home/oka/tatu/ && sudo -u oka git pull; cd -
cd /home/oka/akangatu/ && sudo -u oka git pull; cd -
cd /home/oka/transf/ && sudo -u oka git pull; cd -
cd /home/oka/aiuna/ && sudo -u oka git pull; cd -
cd /home/oka/kururu/ && sudo -u oka git pull; cd -
cd /home/oka/cruipto/ && sudo -u oka git pull; cd -
cd /home/oka/oka-repository/backend
source venv/bin/activate
flask db migrate
flask db upgrade
cd -
echo "Restart services..."
echo "oka..."
systemctl restart oka
echo "nginx..."
systemctl restart nginx
echo "celery..."
systemctl restart celery

