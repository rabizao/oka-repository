#!/bin/bash
printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
date | tee ~/deploy_log.txt
printf "all____ \n"



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
printf "____FILES____\n" | tee -a ~/deploy_log.txt

printf "____Backup current:____\n" | tee -a ~/deploy_log.txt
rsync -a /oka-repository/ /oka-repository_bkp/ --delete &
printf "____SSD -> to RAM:____\n" | tee -a ~/deploy_log.txt
rsync -a /oka-repository/ /run/shm/oka-repository/ --delete
printf "____Backup current:____ FINISHED \n\n" | tee -a ~/deploy_log.txt
printf "____SSD -> RAM:____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____Starting with user:____\n" | tee -a ~/deploy_log.txt
whoami | tee -a ~/deploy_log.txt
printf "____Starting with user:____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____Pulling from github____\n" | tee -a ~/deploy_log.txt
#cd /home/oka/
cd /run/shm/oka-repository/
git pull | tee -a ~/deploy_log.txt 
printf "____Pulling from github____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____FILES____ FINISHED \n\n" | tee -a ~/deploy_log.txt



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
printf "____BACKEND____\n" | tee -a ~/deploy_log.txt
cd backend
source venv/bin/activate

printf "____Updating venv____\n" | tee -a ~/deploy_log.txt
pip install -r requirements.txt
printf "____Updating venv____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____Migrating DB____\n" | tee -a ~/deploy_log.txt
flask db migrate &> ~/deploy_log.txt
printf "____Migrating DB____ FINISHED \n\n" | tee -a ~/deploy_log.txt
printf "____Upgrading DB____\n" | tee -a ~/deploy_log.txt
flask db upgrade &> ~/deploy_log.txt
printf "____Upgrading DB____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____BACKEND____ FINISHED \n\n" | tee -a ~/deploy_log.txt



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
printf "____FRONTEND____\n" | tee -a ~/deploy_log.txt

printf "____Install NPM packages____\n" | tee -a ~/deploy_log.txt
cd ../frontend
#npm set progress=false
#npm i -g pnpm
yarn install | tee -a ~/deploy_log.txt 
printf "____Install NPM packages____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____Build static frontend____\n" | tee -a ~/deploy_log.txt
yarn build | tee -a ~/deploy_log.txt
printf "____Build static frontend____ FINISHED \n\n" | tee -a ~/deploy_log.txt

cd
printf "____FRONTEND____ FINISHED \n\n" | tee -a ~/deploy_log.txt



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
printf "____DEPLOY FILES____\n" | tee -a ~/deploy_log.txt

printf "____RAM -> SSD:____\n" | tee -a ~/deploy_log.txt
rsync -a /run/shm/oka-repository/ /oka-repository/ --delete
printf "____RAM -> SSD:____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____DEPLOY FILES____ FINISHED \n\n" | tee -a ~/deploy_log.txt



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
printf "____SERVICES____\n" | tee -a ~/deploy_log.txt

printf "____Restarting NGINX\n" | tee -a ~/deploy_log.txt
/usr/bin/sudo /usr/sbin/service nginx restart | tee -a ~/deploy_log.txt
printf "____Restarting NGINX____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____Restarting Celery\n" | tee -a ~/deploy_log.txt
/usr/bin/sudo /usr/sbin/service celery restart | tee -a ~/deploy_log.txt &
printf "____Restarting Celery____ FINISHED \n\n" | tee -a ~/deploy_log.txt
printf "____Restarting API\n" | tee -a ~/deploy_log.txt
/usr/bin/sudo /usr/sbin/service oka restart | tee -a ~/deploy_log.txt &
printf "____Restarting API____ FINISHED \n\n" | tee -a ~/deploy_log.txt

printf "____SERVICES____ FINISHED \n\n" | tee -a ~/deploy_log.txt



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy_log.txt
date | tee ~/deploy_log.txt
printf "all____ FINISHED \n"
