# nginx:alpine-slim is het meest minimale officiële nginx-image.
# Alpine = kleine Linux-distributie (~5 MB), slim = zonder onnodige tools.
# Geen PHP nodig: de site is volledig statisch.
#
# USE CASE: lokale ontwikkeling, demo, of productie als statische site.
FROM nginx:1.31.5-alpine-slim@sha256:ac8c92d192f5d66410fae6fbb3addac897c3bb690e221303588e3b32373972c1

# Debugging only: bash en nano (uncomment indien nodig)
# RUN apk update && apk add --no-cache bash nano

# Alleen de statische bestanden kopiëren naar nginx met de juiste eigenaar
COPY --chown=nginx:nginx ./webroot /usr/share/nginx/html

# Eigen nginx config: security headers, gzip, cache
COPY --chown=nginx:nginx ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Nginx draaien als niet-root gebruiker (security hardening)
RUN touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid
USER nginx

# Nginx op de voorgrond draaien zodat Docker de container actief houdt
CMD ["nginx", "-g", "daemon off;"]
