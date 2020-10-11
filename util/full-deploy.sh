echo "Reseting mysql..."
mysql -e 'drop database oka; create database oka'

echo "Running oka user commands..."
sudo -i -u oka /home/oka/oka-repository/util/full-deploy-okauser-part.sh

echo "Ensuring ownership..."
chown oka.oka /home/oka/ -R

cd -
echo "Restart services:"
echo "oka..."
systemctl restart oka
echo "nginx..."
systemctl restart nginx
echo "celery..."
systemctl restart celery



