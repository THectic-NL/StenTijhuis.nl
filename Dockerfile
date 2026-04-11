FROM nginx:1.29.8-alpine-slim

# Debugging only: install bash and nano (uncomment if needed)
# RUN apk update && apk add --no-cache bash nano

# Copy webroot files to the Nginx html directory
COPY ./webroot /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
