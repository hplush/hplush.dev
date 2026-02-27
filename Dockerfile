FROM cgr.dev/chainguard/nginx:latest

COPY --from=ghcr.io/tarampampam/microcheck:1.3.0 /bin/httpcheck /bin/httpcheck
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./content/ /var/www/

LABEL org.opencontainers.image.source=https://github.com/hplush/hplush.dev
LABEL org.opencontainers.image.description="hplush lab web page"
LABEL org.opencontainers.image.licenses=MIT

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD ["/bin/httpcheck", "http://localhost:8000/"]
