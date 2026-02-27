FROM cgr.dev/chainguard/nginx:latest
COPY --from=ghcr.io/tarampampam/microcheck:1.3.0 /bin/httpcheck /bin/httpcheck
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./content/ /var/www/

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD ["/usr/bin/hc", "http://localhost:8080/"]
