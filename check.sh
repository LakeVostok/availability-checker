#!/bin/bash
IFS=$' \t\r\n'

CHAT_ID=""
BOT_TOKEN=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --chat_id=*) CHAT_ID="${1#*=}"; shift 1 ;;
    --bot_token=*) BOT_TOKEN="${1#*=}"; shift 1 ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
done

check_uri() {
    local uri="$1"
    local response=$(curl -sKL -o /dev/null -w "%{http_code}" "$uri")

    echo $response
}

send_message_to_telegram() {
    local chat_id="$1"
    local bot_token="$2"
    local text="$3"

    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{
                "chat_id": "'"$chat_id"'",
                "text": "'"$text"'"
            }' \
        https://api.telegram.org/bot$bot_token/sendMessage        
}

check_flow() {
    local uri_file_path="$1"

    while read -r uri; do
        code=$(check_uri $uri)

        if [ "$code" != "200" ]; then
            send_message_to_telegram $CHAT_ID $BOT_TOKEN "$uri doesn't respond"
        fi

    done < $uri_file_path
}

check_flow ./list
