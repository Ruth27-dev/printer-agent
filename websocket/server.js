const WebSocket = require('ws');

let server;

const broadcast = (message) => {
  if (!server) return;
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

const startWebsocketServer = (port = process.env.WS_PORT || 8787) => {
  if (server) return server;

  server = new WebSocket.Server({ port });
  server.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'ready' }));
    socket.on('message', (data) => {
      // Echo incoming payloads for now; replace with domain logic as needed.
      broadcast({ type: 'message', data: data.toString() });
    });
  });

  return server;
};

module.exports = { startWebsocketServer, broadcast };
