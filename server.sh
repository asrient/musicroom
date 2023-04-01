#!/usr/bin/bash
cd server
source venv/bin/activate
export DATABASE_URL="postgres://mr:123456@127.0.0.1:5432/mr"
python manage.py collectstatic
python manage.py migrate --run-syncdb
gunicorn musicroom.wsgi -b 0.0.0.0:8000 