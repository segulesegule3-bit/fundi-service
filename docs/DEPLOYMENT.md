# Production Deployment Guide - Fundi Service Tanzania

This guide details steps to deploy Fundi Service Tanzania into production Ubuntu Servers using Docker Compose, Nginx Reverse Proxy, SSL configurations, and Kubernetes alternatives.

---

## 1. Quick Docker Deploy

The easiest way to boot the entire stack (Database, Cache, API, Static Web ingress) is by running Docker Compose.

1. Install Docker & Docker Compose on Ubuntu:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   ```
2. Navigate to the project's docker directory:
   ```bash
   cd fundi-service-tanzania/docker
   ```
3. Boot the environment in detached mode:
   ```bash
   docker-compose up --build -d
   ```
4. Verify running containers:
   ```bash
   docker ps
   ```

---

## 2. Nginx Reverse Proxy & SSL Setup

We use Nginx to terminate SSL certificates and route traffic to the container network.

1. Install Nginx & Certbot on the host:
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx -y
   ```
2. Configure site options: Edit `/etc/nginx/sites-available/fundiservice.co.tz`
   ```nginx
   server {
       listen 80;
       server_name fundiservice.co.tz *.fundiservice.co.tz;

       location / {
           proxy_pass http://localhost:80; # Points to the Docker Nginx container
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Activate configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/fundiservice.co.tz /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. Secure domain with SSL Certificates via Certbot:
   ```bash
   sudo certbot --nginx -d fundiservice.co.tz -d *.fundiservice.co.tz
   ```

---

## 3. Kubernetes Deployment Alternative

For highly scalable cloud deployment, apply the Kubernetes manifests:

1. Apply resources:
   ```bash
   kubectl apply -f k8s/deployment.yml
   ```
2. Get external IP of Ingress/LoadBalancer:
   ```bash
   kubectl get svc -n fundi-marketplace
   ```
