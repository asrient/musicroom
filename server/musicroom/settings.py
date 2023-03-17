"""
Django settings for musicroom project.

Generated by 'django-admin startproject' using Django 3.0.8.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
import dj_database_url

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJ_SECRET_KEY', 'bhyr/@5h56yBhgr$t6uj*RF!0')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'musicroom'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'musicroom.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'musicroom', 'pages')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'musicroom.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

db_url = os.environ.get('DATABASE_URL')

DATABASES = {}

if db_url != None:
    DATABASES['default'] = dj_database_url.parse(db_url)
else:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LOGIN_URL = '/login'

AUTH_USER_MODEL = 'musicroom.User'

BASEURL = os.environ.get('BASE_URL', 'http://localhost:8000')

DOMAIN_NAME = os.environ.get('DOMAIN_NAME', 'localhost')

REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379')

SNAPKIT_CLIENT_ID = os.environ.get('SNAPKIT_CLIENT_ID', "xxx-xxx-xxx")

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'exposed')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# add like 'heroku1':'https://gth.fgh.com'
STORAGE_URLS = {
    'home': '',
    'jio': '',
}

JIOMUSIC_STREAM_BASEURL = 'https://jiobeats.cdn.jio.com/mod/_definst_/mp4:hdindiamusic/audiofiles/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'musicroom', 'static')
]

LIVE_ACCESS_KEY = os.environ.get('LIVE_ACCESS_KEY', '1122')

LIVE_URL = os.environ.get('LIVE_URL', 'http://localhost:3000')

SESSION_COOKIE_NAME = 'mrsid'

SESSION_COOKIE_DOMAIN = '.'+DOMAIN_NAME

try:
    from musicroom.settings_dev import *
except ImportError:
    print("Using Django PRODUCTION Settings")


#####################
'''
ENV VARS REQUIRED:

DJ_SECRET_KEY
BASE_URL
DOMAIN_NAME
SNAPKIT_CLIENT_ID
REDIS_URL
DATABASE_URL
LIVE_ACCESS_KEY
LIVE_URL
'''
