# nginx:alpine-slim is het meest minimale officiële nginx-image.
# Alpine = kleine Linux-distributie (~5 MB), slim = zonder onnodige tools.
# Geen PHP nodig: de site is volledig statisch.
#
# USE CASE: lokale ontwikkeling, demo, of productie als statische site.
FROM nginx:1.31.1-alpine-slim@sha256:3fe7a344f234ac4b84817896c9294ffae74eae03fc1ad0ff502457fef5cebef8

# Debugging only: bash en nano (uncomment indien nodig)
# RUN apk update && apk add --no-cache bash nano

# Alleen de statische bestanden kopiëren naar nginx
COPY ./webroot /usr/share/nginx/html

# Eigen nginx config: security headers, gzip, cache
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx op de voorgrond draaien zodat Docker de container actief houdt
CMD ["nginx", "-g", "daemon off;"]
