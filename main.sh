#!/bin/bash
IFS=$' \t\r\n'

source /etc/app_creds

source ~/availability-checker/check.sh

check_flow --alarm_chat_id="$ALARM_CHAT_ID" --log_chat_id="$LOG_CHAT_ID" --bot_token="$BOT_TOKEN" --uri_file="./list"
