#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

source ./send_message_to_telegram.sh

limit=1000

check() {
    local ALARM_CHAT_ID=""
    local LOG_CHAT_ID=""
    local BOT_TOKEN=""
    local USERNAME=""
    local PASSWORD=""

    while [ "$#" -gt 0 ]; do
        case "$1" in
        --alarm_chat_id=*) ALARM_CHAT_ID="${1#*=}"; shift 1 ;;
        --log_chat_id=*) LOG_CHAT_ID="${1#*=}"; shift 1 ;;
        --bot_token=*) BOT_TOKEN="${1#*=}"; shift 1 ;;
        --username=*) USERNAME="${1#*=}"; shift 1 ;;
        --password=*) PASSWORD="${1#*=}"; shift 1 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
        esac
    done

    result=$(curl -skL "https://sms6.rmlconnect.net/CreditCheck/checkcredits?username=$USERNAME&password=$PASSWORD")

    balance=${result#*:}
    balance=${balance%.*}

    if  [ $balance == "PERMISSION DENIED" ]; then
        send_message_to_telegram "$ALARM_CHAT_ID" "$BOT_TOKEN" "Alarm\nSMS gate: failed to get the balance. Current status is $balance"
    elif [ $balance -lt $limit ]; then
        send_message_to_telegram "$ALARM_CHAT_ID" "$BOT_TOKEN" "Alarm\nSMS gate balance is $balance"
    else
        send_message_to_telegram "$LOG_CHAT_ID" "$BOT_TOKEN" "SMS gate balance is $balance"
    fi
}

check --alarm_chat_id="$ALARM_CHAT_ID" --log_chat_id="$LOG_CHAT_ID" --bot_token="$BOT_TOKEN" --username="$SMS_GATE_USERNAME" --password="$SMS_GATE_PASSWORD"
