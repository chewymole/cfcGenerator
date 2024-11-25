import { useSettingsStore } from "../stores/settingsStore";

const LogLevels = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

function getLogLevel() {
  const settings = useSettingsStore();
  return LogLevels[settings.getLogLevel.toUpperCase()] || LogLevels.ERROR;
}

function shouldLog(level) {
  return getLogLevel() >= level;
}

export function log(...args) {
  if (shouldLog(LogLevels.DEBUG)) {
    console.log(...args);
  }
}

export function info(...args) {
  if (shouldLog(LogLevels.INFO)) {
    console.info(...args);
  }
}

export function warn(...args) {
  if (shouldLog(LogLevels.WARN)) {
    console.warn(...args);
  }
}

export function error(...args) {
  if (shouldLog(LogLevels.ERROR)) {
    console.error(...args);
  }
}
