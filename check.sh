#!/bin/bash
IFS=$' \t\r\n'

get_log_message() {
    local uri="$1"
    local res_code="$2"
    local req_time="$3"

    echo "[$(date +"%Y-%m-%d %H:%M:%S %Z")] $uri $res_code $req_time"
}

send_message_to_telegram() {
    local chat_id="$1"
    local bot_token="$2"
    local text="$3"

    curl -skL -o /dev/null -X POST \
        -H "Content-Type: application/json" \
        -d '{
                "chat_id": "'"$chat_id"'",
                "text": "'"$text"'"
            }' \
        https://api.telegram.org/bot$bot_token/sendMessage        
}

check_flow() {
    local ALARM_CHAT_ID=""
    local LOG_CHAT_ID=""
    local BOT_TOKEN=""
    local URI_FILE=""

    while [ "$#" -gt 0 ]; do
        case "$1" in
        --alarm_chat_id=*) ALARM_CHAT_ID="${1#*=}"; shift 1 ;;
        --log_chat_id=*) LOG_CHAT_ID="${1#*=}"; shift 1 ;;
        --bot_token=*) BOT_TOKEN="${1#*=}"; shift 1 ;;
        --uri_file=*) URI_FILE="${1#*=}"; shift 1 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
        esac
    done

    while read -r uri; do
        read res_code req_time <<< $(curl -skL -o /dev/null -w "%{http_code} %{time_total}" "$uri")

        send_message_to_telegram "$LOG_CHAT_ID" "$BOT_TOKEN" "$(get_log_message $uri $res_code $req_time)"

        if [ "$res_code" != "200" ]; then
            send_message_to_telegram "$ALARM_CHAT_ID" "$BOT_TOKEN" "Alarm\n$(get_log_message $uri $res_code $req_time)"
        fi

    done < $URI_FILE
}
