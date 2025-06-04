./list contains a list of uri, delimeted by \n

curl ignores SSL and follows redirects

Example of use:
./check.sh --chat_id=123 --bot_token=456
where:
--chat_id - id of telegram chat
--bot_token - token for telegram bot

# Storing credentials
```
echo "export ALARM_CHAT_ID=abc123" > /etc/app_creds
echo "export LOG_CHAT_ID=abc123" > /etc/app_creds
echo "export BOT_TOKEN=abc123" > /etc/app_creds
chmod 600 /etc/app_creds
chown root:root /etc/app_creds
```