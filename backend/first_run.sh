#!/bin/sh
read -p " -> If you proceed your local database will be removed. Are you sure? (y/n) " CONT
if [ "$CONT" = "y" ]; then
  rm -rf migrations
  rm ~/.oka/app.db;
  flask db init
  flask db migrate
  flask db upgrade;
  flask create-admin;
else
  echo "Nothing done.";
fi
echo " -> Done.";
