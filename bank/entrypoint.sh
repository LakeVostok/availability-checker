#!/usr/bin/env bash
set -euo pipefail

printenv > /etc/environment

cron -f
