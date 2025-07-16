FROM debian:bookworm-20250630-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends cron dos2unix curl && \
    rm -rf /var/lib/apt/lists/*

COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

COPY ./scripts/* /opt/scripts/
RUN chmod -R +x /opt/scripts

COPY ./cron/* /etc/cron.d
RUN dos2unix /etc/cron.d/*
RUN chmod 0644 /etc/cron.d/*
