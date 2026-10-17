import { WebSocketServer, WebSocket } from 'ws';
import { MarketSimulator } from '../src/services/marketSimulator';
import { WSClientMessage, WSServerMessage } from '../src/types/market';
import { INITIAL_STOCKS } from '../src/services/mockData';

const PORT = Number(process.env.PORT) || 8080;
const TICK_INTERVAL = Number(process.env.TICK_INTERVAL_MS) || 750;

interface ClientConnection {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  isAlive: boolean;
}

const wss = new WebSocketServer({ port: PORT });
const simulator = new MarketSimulator(TICK_INTERVAL);
const clients = new Map<string, ClientConnection>();

let clientCounter = 0;

console.log(`\n======================================================`);
console.log(`  🚀 PulseTrade WebSocket Market Simulator Server`);
console.log(`  📡 Listening on ws://localhost:${PORT}`);
console.log(`  ⏱️  Tick Interval: ${TICK_INTERVAL}ms`);
console.log(`  📈 Seeded Stocks: ${Object.keys(INITIAL_STOCKS).join(', ')}`);
console.log(`======================================================\n`);

wss.on('connection', (ws: WebSocket) => {
  clientCounter++;
  const clientId = `client_${clientCounter}_${Math.random().toString(36).substring(2, 7)}`;
  
  const client: ClientConnection = {
    id: clientId,
    ws,
    subscriptions: new Set(Object.keys(INITIAL_STOCKS)), // Default to all symbols
    isAlive: true,
  };

  clients.set(clientId, client);
  console.log(`[WS] Client connected: ${clientId} (Total: ${clients.size})`);

  // Send Welcome message
  const welcomeMsg: WSServerMessage = {
    type: 'welcome',
    clientId,
    serverTime: Date.now(),
    availableSymbols: Object.keys(INITIAL_STOCKS),
    isSimulated: true,
  };
  ws.send(JSON.stringify(welcomeMsg));

  // Send Initial Snapshot
  const snapshotMsg: WSServerMessage = {
    type: 'snapshot',
    data: simulator.getSnapshot(),
  };
  ws.send(JSON.stringify(snapshotMsg));

  // Handle incoming messages
  ws.on('message', (data: Buffer | string) => {
    try {
      const msg: WSClientMessage = JSON.parse(data.toString());

      switch (msg.type) {
        case 'subscribe':
          if (Array.isArray(msg.symbols)) {
            msg.symbols.forEach((sym) => client.subscriptions.add(sym.toUpperCase()));
            console.log(`[WS] ${clientId} subscribed to: ${msg.symbols.join(', ')}`);
          }
          break;

        case 'unsubscribe':
          if (Array.isArray(msg.symbols)) {
            msg.symbols.forEach((sym) => client.subscriptions.delete(sym.toUpperCase()));
          }
          break;

        case 'ping': {
          const pongMsg: WSServerMessage = {
            type: 'pong',
            clientTimestamp: msg.timestamp || Date.now(),
            serverTimestamp: Date.now(),
          };
          ws.send(JSON.stringify(pongMsg));
          break;
        }

        default:
          console.warn(`[WS] Unknown message type:`, msg);
      }
    } catch (err) {
      console.error(`[WS] Malformed message from ${clientId}:`, err);
      const errorMsg: WSServerMessage = {
        type: 'error',
        message: 'Malformed JSON payload',
      };
      ws.send(JSON.stringify(errorMsg));
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`[WS] Client disconnected: ${clientId} (Remaining: ${clients.size})`);
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error on client ${clientId}:`, err.message);
  });
});

// Broadcast simulator ticks to subscribed clients
simulator.subscribe((tick) => {
  const message: WSServerMessage = {
    type: 'tick',
    tick,
  };
  const payload = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (client.subscriptions.has(tick.symbol)) {
        client.ws.send(payload);
      }
    }
  });
});

// Start simulator
simulator.start();

// Heartbeat interval to check alive connections
const heartbeatInterval = setInterval(() => {
  clients.forEach((client, id) => {
    if (!client.isAlive) {
      console.log(`[WS] Terminating stale connection: ${id}`);
      client.ws.terminate();
      clients.delete(id);
      return;
    }
    client.isAlive = false;
    client.ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
  simulator.stop();
});

// Graceful exit
process.on('SIGINT', () => {
  console.log('\n[WS] Shutting down WebSocket Simulator Server...');
  simulator.stop();
  wss.close(() => {
    process.exit(0);
  });
});
