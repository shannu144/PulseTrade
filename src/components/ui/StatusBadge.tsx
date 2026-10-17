import React from 'react';
import { ConnectionSource, ConnectionStatus } from '../../types/market';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ConnectionStatus;
  source: ConnectionSource;
  latency?: number;
  onReconnect?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  source,
  latency,
  onReconnect,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: source === 'standalone_ws' ? 'WS Live' : 'Sim Engine',
          badgeClass: 'badge-connected',
          dotClass: 'dot-connected',
          icon: <Wifi size={13} className="text-emerald-400" />,
          tooltip:
            source === 'standalone_ws'
              ? `Connected to local WebSocket server (${latency ?? 5}ms)`
              : 'Connected to in-browser simulation engine (zero server required)',
        };
      case 'connecting':
        return {
          label: 'Connecting',
          badgeClass: 'badge-connecting',
          dotClass: 'dot-connecting',
          icon: <RefreshCw size={13} className="animate-spin text-amber-400" />,
          tooltip: 'Establishing WebSocket handshake...',
        };
      case 'reconnecting':
        return {
          label: 'Reconnecting',
          badgeClass: 'badge-connecting',
          dotClass: 'dot-connecting',
          icon: <RefreshCw size={13} className="animate-spin text-amber-400" />,
          tooltip: 'Reconnecting with exponential backoff...',
        };
      case 'disconnected':
        return {
          label: 'Disconnected',
          badgeClass: 'badge-disconnected',
          dotClass: 'dot-disconnected',
          icon: <WifiOff size={13} className="text-slate-400" />,
          tooltip: 'WebSocket connection closed',
        };
      case 'error':
      default:
        return {
          label: 'Connection Error',
          badgeClass: 'badge-error',
          dotClass: 'dot-error',
          icon: <AlertCircle size={13} className="text-rose-400" />,
          tooltip: 'Failed to connect. Click to retry.',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`status-pill ${config.badgeClass}`}
      title={config.tooltip}
      role="status"
      aria-live="polite"
    >
      <span className={`status-dot ${config.dotClass}`} />
      <span className="status-label">{config.label}</span>
      {status === 'connected' && latency !== undefined && (
        <span className="latency-badge">{latency}ms</span>
      )}
      {(status === 'disconnected' || status === 'error') && onReconnect && (
        <button
          onClick={onReconnect}
          className="reconnect-inline-btn"
          title="Retry connection"
          aria-label="Retry WebSocket connection"
        >
          <RefreshCw size={11} />
        </button>
      )}
    </div>
  );
};
