#!/bin/bash
set -e

cd /Users/user/Documents/pi/project-2026-Dito1290/server_smartcity
source /Users/user/Documents/pi/project-2026-Dito1290/venv/bin/activate

export SECRET_KEY="django-insecure-wi-y!!6cnfq0ulxyxs)xq77v!@40(13m3=3=mgy7p7-9&gv(jn"
export DEBUG="False"
export ALLOWED_HOSTS="localhost,127.0.0.1,0.0.0.0,103.151.63.87"
export CSRF_TRUSTED_ORIGINS="http://localhost:8000,http://127.0.0.1:8000,http://103.151.63.87:8007"
export DJANGO_DB_ENGINE="django.db.backends.sqlite3"
export DJANGO_DB_NAME="db.sqlite3"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn smartcity_app.wsgi:application --bind 0.0.0.0:8000 --workers 2
