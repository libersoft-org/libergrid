# LiberGrid - installation

## 1. Download the latest version of this software and install required system tools

These are the installation instructions of this software for [Debian Linux](https://www.debian.org/).

Log in as "root" on your server and run the following commands to download the necessary dependencies and the latest version of this software from GitHub:

```sh
apt update
apt -y upgrade
apt -y install git openssl g++
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/libergrid.git
cd libergrid/frontend/
./build.sh
cd ../backend/
./start.sh
```

## 2. Use this software

Open your web browser and navigate to: http://127.0.0.1/

If you'd like to **run this software in developer mode**, you need HTTPS certificate keys.

#### a) Generate self-signed certificate keys:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -days $(expr '(' $(date -d 2999/01/01 +%s) - $(date +%s) + 86399 ')' / 86400) -subj "/" -keyout server.key -out server.crt
```

#### b) Use certificate keys signed by your CA:

```sh
ln -s /etc/certbot/live/YOUR_DOMAIN/privkey.pem server.key
ln -s /etc/certbot/live/YOUR_DOMAIN/fullchain.pem server.crt
```

... then use this command to start the server in development mode:

```sh
./start-dev.sh
```

... and then navigate to: https://YOUR_SERVER_ADDRESS:6002/ in your browser. Browser will show the certificate error, just skip it.
