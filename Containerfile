FROM docker.io/library/caddy:2-alpine

# Copy our custom configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy the static website build contents
COPY dist /srv

# Expose the port Caddy is listening on
EXPOSE 8080
