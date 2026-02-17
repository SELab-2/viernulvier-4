#!/bin/bash
# either run this as a script in the /backend/database/database_proper folder or line by line in the CLI

# install and enable docker service
sudo apt install docker # or dnf/pacman -S/...
sudo systemctl start docker
sudo systemctl enable docker

# not always needed but in case of permission issues:
sudo usermod -aG docker "$USER"
newgrp docker

# test if everything works:
docker run hello-world

# run following commands in the /backend/database folder:

# run the .yml file
docker-compose up -d
# docker compose up -d # one of the 2 depending on your installation.

# turn off the db:
# docker-compose down
# docker compose down -d # for the newer systems

# test that postgres db is running correctly:
PGPASSWORD=404 psql -h 127.0.0.1 -p 5432 -U selab2 -d selab2_dev
# you should be in the database as user "selab2" type exit to leave.

# restore db from thz dump so you have a working database:
pg_restore -h 127.0.0.1 -p 5432 -U selab2 -d selab2_dev -v devdb.dump

# be careful with script under here -> overwrites the current db backup!
# pg_dump -h 127.0.0.1 -p 5432 -U selab2 -d selab2_dev -F c -b -v -f devdb.dump # overwrite the dump (share through git with others)

# to setup the database in webstorm use user "selab2" with pw "404" and db "selab2_dev" on port 5432.
# please check to make sure you can use the db for instance: "SELECT * FROM productions"
# if there are any questions or problems you can mesg me (seb).