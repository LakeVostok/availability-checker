require("dotenv").config();

const fs = require("fs");

const LOG_FILE = process.env.LOG_FILE || "heartbeat.log";

function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${isError ? "ERROR" : "INFO"}: ${message}\n`;
  console.log(logEntry.trim());
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error(`Failed to write to log file: ${err.message}`);
  });
}

module.exports = { log };
