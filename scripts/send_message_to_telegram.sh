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
