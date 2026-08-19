# nginx:alpine-slim is het meest minimale officiële nginx-image.
# Alpine = kleine Linux-distributie (~5 MB), slim = zonder onnodige tools.
# Geen PHP nodig: de site is volledig statisch.
#
# USE CASE: lokale ontwikkeling, demo, of productie als statische site.
FROM nginx:1.31.4-alpine-slim@sha256:eb37f58646a901dc7727cf448cae36daaefaba79de33b5058dab79aa4c04aefb

# Debugging only: bash en nano (uncomment indien nodig)
# RUN apk update && apk add --no-cache bash nano

# Alleen de statische bestanden kopiëren naar nginx
COPY ./webroot /usr/share/nginx/html

# Eigen nginx config: security headers, gzip, cache
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Nginx draaien als niet-root gebruiker (security hardening)
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid
USER nginx

# Nginx op de voorgrond draaien zodat Docker de container actief houdt
CMD ["nginx", "-g", "daemon off;"]
