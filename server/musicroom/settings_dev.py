import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SNAPKIT_CLIENT_ID = "fbeca407-ed14-471f-8092-b95e83b5a63a"

BASEURL = 'http://localhost:8000'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1']

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'zcub=w$8!$61&x_jggl-u5&3ccgvf-kd^22b^cb)%235ggb15'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

SESSION_COOKIE_DOMAIN = None
