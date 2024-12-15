import { APP_CONFIG } from "@config/appConfig";

// This maintains backward compatibility with window.APP_CONFIG
// while we migrate to the new system
if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}

export default APP_CONFIG;
