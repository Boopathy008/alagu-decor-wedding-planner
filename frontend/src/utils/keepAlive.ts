/**
 * keepAlive.ts
 * Pings the backend API every 14 minutes to prevent it from going to sleep
 * on free-tier hosting (Render, Railway, etc.).
 */

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

export function startKeepAlive(apiBaseUrl: string): void {
  const pingUrl = apiBaseUrl.replace(/\/api\/?$/, "") + "/actuator/health";

  const ping = () => {
    fetch(pingUrl, { method: "GET", mode: "no-cors" }).catch(() => {
      // Silently ignore – backend might not be configured yet
    });
  };

  // Ping immediately on startup, then every 14 minutes
  ping();
  setInterval(ping, PING_INTERVAL_MS);
}
