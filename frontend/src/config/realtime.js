/** Base URL for Socket.IO (same host as REST API, no trailing slash). */
export function getSocketBaseUrl(backendUrl) {
  const raw =
    import.meta.env.VITE_SOCKET_URL ||
    backendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";
  return String(raw).replace(/\/$/, "");
}

/** PeerJS broker (defaults to public PeerServer cloud). Override on Vercel if needed. */
export function getPeerClientOptions() {
  return {
    host: import.meta.env.VITE_PEER_SERVER_HOST || "0.peerjs.com",
    port: Number(import.meta.env.VITE_PEER_SERVER_PORT || 443),
    path: import.meta.env.VITE_PEER_SERVER_PATH || "/",
    secure: import.meta.env.VITE_PEER_SERVER_SECURE !== "false",
  };
}
