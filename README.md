# MusicRoom

![logo](img/mr.jpg)

Listen to music with friends, together! Colaborate and maintain a playlist with friends real time. Create a room and let friends join you. Built using: React, Django, NodeJs, Socket.io

## Try it yourself

[friendzone.live](https://friendzone.live) (hosted on heroku)

## Features

- Listen to music with friends together, live.
- Group chat with your friends while enjoying music.
- Private rooms - Only people you want can join.

## Guide

### The home page. This will list all the active rooms available to you

![home](img/home.png)

### Let’s create a room

![create room](img/music-picker.png)

### This is how a room looks like

![room](img/room.png)

### Rooms are private, others can join only if they have permission

![room access](img/room-access.png)

### Group chat in the room

![room chat](img/chat.png)

## About the codebase 📁

The whole repo is divided into 3 parts

### Django Server

- Location: `/server`
- This is the main django server serving files, APIs and implementing most of the features.

### Live server

- Location: `/liveServer`
- This is the nodeJS server is used to push realtime updates to clients via websockets and also implements the group chat feature, it listens to updates from the main server via `Redis` pub/sub feature and relays the updates to appropriate rooms and clients. It uses `MongoDB` for storing chat messages and `socket.io` to connecting with clients.

### React codebase

- Location: `/webapp`
- This is the React Frontend codebase that gets bundled and served by our main server.

## How to start working on the server code ⚒

This codebase is in Django

#### Create a virtualenv 🌎

```bash
virtualenv venv
```

#### Activate our python virtual environment ✈

```bash
venv\Scripts\activate
```

#### Install all required packages 📦

```bash
pip install -r requirements.txt
```

#### After making changes to static files

```bash
python manage.py collectstatic
```

#### After modifying database models, generate necessary migration code 💾

```bash
python manage.py makemigrations musicroom
```

#### Apply any database migration 💿

```bash
python manage.py migrate --run-syncdb
```

#### Run server in dev mode 🏃‍♀️

```bash
python manage.py runserver 0.0.0.0:8000
```

#### Run server in production mode 🏁

  (This will only work on linux)

```bash
gunicorn -b 0.0.0.0:80 musicroom.wsgi
```

#### Env variables for django ⚙

For local setup, you can also use `settings_dev.py` file

- `DJ_SECRET_KEY`: Django secret key
- `BASE_URLBASE_URL`: Root url of the server. eg: `https://example.com`
- `DATABASE_URL`: eg: `postgres://user:password@localhost/dbname`
- `DOMAIN_NAME`: eg: `example.com`
- `LIVE_ACCESS_KEY`: A random string that needs to be same both servers. eg: `xx-access-key-xx`
- `LIVE_URL`: The `socket.io` url of the live server. eg: `https://live.friendzone.live/updates`
- `REDIS_URL`: eg: `redis://user1:password@redis.example.com:31949`
- `SNAPKIT_CLIENT_ID`: Optional

## How to start working on the Live server code ⚒

This codebase is in NodeJs

#### Install all required packages 📦

```bash
npm i
```

#### Env variables for NodeJs

For local setup, you can also use `.env` file

- `MAIN_SERVER_URL`: eg: `https://example.com` if running on same machine as main server, you can use the local address ie `localhost:port`
- `ACCESS_KEY`: Same access key set in the main server.
- `REDIS_URL`: Should be same as main server
- `MONGO_URL`: eg: `mongodb://localhost:27017/mr`
- `MAIN_SERVER_PUBLIC_URL`: eg: `https://example.com`

#### Run server

```bash
node index.js
```
