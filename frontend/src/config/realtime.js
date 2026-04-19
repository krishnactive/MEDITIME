/** Base URL for Socket.IO (same host as REST API, no trailing slash). */
export function getSocketBaseUrl(backendUrl) {
  const raw =
    import.meta.env.VITE_SOCKET_URL ||
    backendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";
  return String(raw).replace(/\/$/, "");
}

const defaultIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function parseIceServers() {
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (!raw) return defaultIceServers;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultIceServers;
  } catch {
    return defaultIceServers;
  }
}

/** PeerJS broker (defaults to public PeerServer cloud). Override on Vercel if needed. */
export function getPeerClientOptions() {
  return {
    host: import.meta.env.VITE_PEER_SERVER_HOST || "0.peerjs.com",
    port: Number(import.meta.env.VITE_PEER_SERVER_PORT || 443),
    path: import.meta.env.VITE_PEER_SERVER_PATH || "/",
    secure: import.meta.env.VITE_PEER_SERVER_SECURE !== "false",
    config: {
      iceServers: parseIceServers(),
    },
  };
}
