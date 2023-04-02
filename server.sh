#!/usr/bin/bash
cd server
source venv/bin/activate
export DATABASE_URL="<postgres://user:xxxx@127.0.0.1:5432/db>"
python manage.py collectstatic
python manage.py migrate --run-syncdb
gunicorn musicroom.wsgi -b 0.0.0.0:8000 