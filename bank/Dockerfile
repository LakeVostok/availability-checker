FROM node:24.4.1-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends cron dos2unix curl && \
    rm -rf /var/lib/apt/lists/*

COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY ./scripts /opt/scripts
RUN npm ci --prefix=/opt/scripts

COPY ./cron/* /etc/cron.d
RUN dos2unix /etc/cron.d/*
RUN chmod 0644 /etc/cron.d/*
