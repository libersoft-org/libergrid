# LiberGrid - installation

## 1. Download the latest version of this software

These are the installation instructions of this software for the different Linux distributions.

Log in as "root" on your server and run the following commands to download the necessary dependencies and the latest version of this software from GitHub:

### Debian / Ubuntu Linux

```sh
apt update
apt -y upgrade
apt -y install git openssl
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/libergrid.git
cd libergrid
```

### CentOS / RHEL / Fedora Linux

```sh
dnf -y update
dnf -y install git openssl
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/libergrid.git
cd libergrid
```

## 2. Use this software

If you'd like to build this software from source code:

Run build script with the parameter of your base URL path where your web server will serve this software. This is important if you are not serving it from the root of your domain.

For web root (for example: https://YOUR_SERVER/) just run:

```sh
./build.sh
```

For other web path (for example https://YOUR_SERVER/client/) run:

```sh
./build.sh "/client"
```

... and then move the content of your "**build**" folder to your web server.

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
