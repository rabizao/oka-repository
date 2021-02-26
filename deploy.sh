#!/bin/bash
printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
date | tee ~/deploy.log
printf "all____ \n"



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
printf "____FILES____\n" | tee -a ~/deploy.log

printf "____Backup current:____\n" | tee -a ~/deploy.log
rsync -a /oka-repository/ /oka-repository_bkp/ --delete &
    printf "____SSD -> to RAM:____\n" | tee -a ~/deploy.log
    rsync -a /oka-repository/ /run/shm/oka-repository/ --delete
printf "____Backup current:____ FINISHED \n\n" | tee -a ~/deploy.log
    printf "____SSD -> RAM:____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____Starting with user:____\n" | tee -a ~/deploy.log
whoami | tee -a ~/deploy.log
printf "____Starting with user:____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____Pulling from github____\n" | tee -a ~/deploy.log
# cd /home/oka/oka-repository/
cd /run/shm/oka-repository/
git pull | tee -a ~/deploy.log 
printf "____Pulling from github____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____FILES____ FINISHED \n\n" | tee -a ~/deploy.log



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
printf "____BACKEND____\n" | tee -a ~/deploy.log
cd backend

printf "____Create venv if needed____\n" | tee -a ~/deploy.log
[ ! -f venv ] && python3 -m venv venv
printf "____Create venv if needed____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____Updating venv____\n" | tee -a ~/deploy.log
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
printf "____Updating venv____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____Migrating DB____\n" | tee -a ~/deploy.log
flask db migrate &> ~/deploy.log
printf "____Migrating DB____ FINISHED \n\n" | tee -a ~/deploy.log
printf "____Upgrading DB____\n" | tee -a ~/deploy.log
flask db upgrade &> ~/deploy.log
printf "____Upgrading DB____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____BACKEND____ FINISHED \n\n" | tee -a ~/deploy.log



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
printf "____FRONTEND____\n" | tee -a ~/deploy.log

printf "____Install NPM packages____\n" | tee -a ~/deploy.log
cd ../frontend
#npm set progress=false
yarn install | tee -a ~/deploy.log 
printf "____Install NPM packages____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____Build static frontend____\n" | tee -a ~/deploy.log
yarn build | tee -a ~/deploy.log
printf "____Build static frontend____ FINISHED \n\n" | tee -a ~/deploy.log

cd
printf "____FRONTEND____ FINISHED \n\n" | tee -a ~/deploy.log



    printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
    printf "____DEPLOY FILES____\n" | tee -a ~/deploy.log

    printf "____RAM -> SSD:____\n" | tee -a ~/deploy.log
    rsync -a /run/shm/oka-repository/ /oka-repository/ --delete
    printf "____RAM -> SSD:____ FINISHED \n\n" | tee -a ~/deploy.log

    printf "____DEPLOY FILES____ FINISHED \n\n" | tee -a ~/deploy.log



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
printf "____SERVICES____\n" | tee -a ~/deploy.log

printf "____Restarting NGINX\n" | tee -a ~/deploy.log
/usr/bin/sudo /usr/sbin/service nginx restart | tee -a ~/deploy.log
printf "____Restarting NGINX____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____Restarting Celery\n" | tee -a ~/deploy.log
/usr/bin/sudo /usr/sbin/service celery restart | tee -a ~/deploy.log &
printf "____Restarting Celery____ FINISHED \n\n" | tee -a ~/deploy.log
printf "____Restarting API\n" | tee -a ~/deploy.log
/usr/bin/sudo /usr/sbin/service oka restart | tee -a ~/deploy.log &
printf "____Restarting API____ FINISHED \n\n" | tee -a ~/deploy.log

printf "____SERVICES____ FINISHED \n\n" | tee -a ~/deploy.log



printf "\n\n\n\n\n==============================================================================\n" | tee -a ~/deploy.log
date | tee ~/deploy.log
printf "all____ FINISHED \n"
