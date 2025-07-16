#!/usr/bin/env bash
set -euo pipefail
IFS=$' \t\r\n'

get_log_message() {
    local uri="$1"
    local res_code="$2"
    local req_time="$3"
    local errormsg="$4"

    echo "[$(date +"%Y-%m-%d %H:%M:%S %Z")] $uri $res_code $req_time\n$errormsg"
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
    local URI_LIST=""

    while [ "$#" -gt 0 ]; do
        case "$1" in
        --alarm_chat_id=*) ALARM_CHAT_ID="${1#*=}"; shift 1 ;;
        --log_chat_id=*) LOG_CHAT_ID="${1#*=}"; shift 1 ;;
        --bot_token=*) BOT_TOKEN="${1#*=}"; shift 1 ;;
        --uri_list=*) URI_LIST="${1#*=}"; shift 1 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
        esac
    done

    read -ra list <<< "$URI_LIST"
    for uri in "${list[@]}"; do
        uuid=$(cat /proc/sys/kernel/random/uuid)

        IFS='|' read -r res_code req_time errormsg <<< $(curl -skL -o /dev/null -w "%{http_code}|%{time_total}|%{errormsg}" -H "User-Agent: Friend" -H "Req-Id: $uuid" "$uri")

        send_message_to_telegram "$LOG_CHAT_ID" "$BOT_TOKEN" "$(get_log_message "$uri" "$res_code" "$req_time" "$errormsg")"

        if [ "$res_code" != "200" ]; then
            send_message_to_telegram "$ALARM_CHAT_ID" "$BOT_TOKEN" "Alarm\n$(get_log_message "$uri" "$res_code" "$req_time" "$errormsg")"
        fi
    done
}

check_flow --alarm_chat_id="$ALARM_CHAT_ID" --log_chat_id="$LOG_CHAT_ID" --bot_token="$BOT_TOKEN" --uri_list="https://online.sberbank.co.in/ https://guest.online.sberbank.co.in/"
