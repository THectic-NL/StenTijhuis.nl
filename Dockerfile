# nginx:alpine-slim is het meest minimale officiële nginx-image.
# Alpine = kleine Linux-distributie (~5 MB), slim = zonder onnodige tools.
# Geen PHP nodig: de site is volledig statisch.
#
# USE CASE: lokale ontwikkeling, demo, of productie als statische site.
FROM nginx:1.31.0-alpine-slim@sha256:9e666aeefa9801445bc2ff4994c48d314736dae4cf1f551ace03e38ea0373552

# Debugging only: bash en nano (uncomment indien nodig)
# RUN apk update && apk add --no-cache bash nano

# Alleen de statische bestanden kopiëren naar nginx
COPY ./webroot /usr/share/nginx/html

EXPOSE 80

# Nginx op de voorgrond draaien zodat Docker de container actief houdt
CMD ["nginx", "-g", "daemon off;"]
