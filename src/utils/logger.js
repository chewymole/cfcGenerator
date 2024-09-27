const DEBUG_MODE = window.APP_CONFIG?.DEBUG_MODE || false;

export function log(...args) {
  if (DEBUG_MODE) {
    console.log(...args);
  }
}

export function warn(...args) {
  if (DEBUG_MODE) {
    console.warn(...args);
  }
}

export function error(...args) {
  // Always log errors, regardless of debug mode
  console.error(...args);
}
