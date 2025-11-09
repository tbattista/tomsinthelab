FROM nginx:alpine

# Install envsubst (gettext package)
RUN apk add --no-cache gettext

# Copy website files to nginx html directory
COPY website/ /usr/share/nginx/html/

# Copy custom nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-80}

# Start nginx with environment variable substitution
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]