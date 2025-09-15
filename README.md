The service is splitted in to two parts:
- bank - things, related to bank checker
- sms-gate - checker for sms-gate

To launch:
1) Install docker https://docs.docker.com/engine/install/
2) Create telegram bot and group, add the bot to this chat and fill the .env file:
`LOG_CHAT_ID` - chat for all messages,
`ALARM_CHAT_ID` - chat only for alarms, in dev it is ok to reuse LOG_CHAT_ID,
`BOT_TOKEN` - bot token,
SMS_GATE_USERNAME -
SMS_GATE_PASSWORD - leave both empty for dev
3) Work with docker:
`docker compose up bank --build` - launch bank checker.
Also it is possible to run scripts without docker (but unix-compatible shell should be used), e.g. `ALARM_CHAT_ID=xxx LOG_CHAT_ID=yyy BOT_TOKEN=zzz node ./bank/scripts/check.sh`
