To launch:
1) Install docker https://docs.docker.com/engine/install/
2) Create telegram bot and group, add the bot to this chat and fill the .env file:
`LOG_CHAT_ID` - chat for all messages,
`ALARM_CHAT_ID` - chat only for alarms, in dev it is ok to reuse LOG_CHAT_ID,
`BOT_TOKEN` - bot token
3) Work with docker:
`docker compose up -d` - (re)launch the service.
`docker compose down` - stop the service
Take a look for the rest commands in documentation or chatgpt
Also it is ok to use docker desktop

Also it is possible to run scripts without docker (but unix-compatible shell should be used), e.g. `ALARM_CHAT_ID=xxx LOG_CHAT_ID=yyy BOT_TOKEN=zzz ./scripts/check.sh`
