import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { OrderTicket } from '../components/trading/OrderTicket';
import { Watchlist } from '../components/market/Watchlist';
import { INITIAL_STOCKS } from '../services/mockData';

describe('UI Component Tests', () => {
  describe('StatusBadge', () => {
    it('renders connected state with latency', () => {
      render(
        <StatusBadge
          status="connected"
          source="standalone_ws"
          latency={14}
        />
      );

      expect(screen.getByText('WS Live')).toBeInTheDocument();
      expect(screen.getByText('14ms')).toBeInTheDocument();
    });

    it('renders connecting state', () => {
      render(
        <StatusBadge
          status="connecting"
          source="standalone_ws"
        />
      );

      expect(screen.getByText('Connecting')).toBeInTheDocument();
    });

    it('renders error state with retry button', () => {
      const handleReconnect = vi.fn();
      render(
        <StatusBadge
          status="error"
          source="offline"
          onReconnect={handleReconnect}
        />
      );

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      const retryBtn = screen.getByLabelText('Retry WebSocket connection');
      fireEvent.click(retryBtn);
      expect(handleReconnect).toHaveBeenCalled();
    });
  });

  describe('OrderTicket', () => {
    const mockStock = INITIAL_STOCKS['AAPL'];

    it('renders order ticket with stock info and default quantity', () => {
      render(
        <OrderTicket
          stock={mockStock}
          availableCash={50000}
          sharesOwned={10}
          onExecuteOrder={vi.fn()}
        />
      );

      expect(screen.getByText('Order Entry')).toBeInTheDocument();
      expect(screen.getByText('BUY')).toBeInTheDocument();
      expect(screen.getByText('SELL')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('toggles between BUY and SELL sides', () => {
      render(
        <OrderTicket
          stock={mockStock}
          availableCash={50000}
          sharesOwned={10}
          onExecuteOrder={vi.fn()}
        />
      );

      const sellBtn = screen.getByRole('tab', { name: /sell/i });
      fireEvent.click(sellBtn);

      expect(screen.getByText(/SELL 10 AAPL/i)).toBeInTheDocument();
    });

    it('shows inline validation error when cash is insufficient for buy', () => {
      render(
        <OrderTicket
          stock={mockStock}
          availableCash={100} // Only $100 available, but 10 shares of AAPL (~$2285)
          sharesOwned={0}
          onExecuteOrder={vi.fn()}
        />
      );

      expect(screen.getByText(/Insufficient cash/i)).toBeInTheDocument();
    });
  });

  describe('Watchlist', () => {
    const stocksList = [INITIAL_STOCKS['AAPL'], INITIAL_STOCKS['MSFT']];

    it('renders stocks table correctly', () => {
      render(
        <Watchlist
          stocks={stocksList}
          selectedSymbol="AAPL"
          flashStates={{}}
          onSelectStock={vi.fn()}
          onRemoveStock={vi.fn()}
          onAddStock={vi.fn()}
          onResetWatchlist={vi.fn()}
          sortField="symbol"
          sortOrder="asc"
          onSort={vi.fn()}
          allAvailableSymbols={['AAPL', 'MSFT', 'NVDA']}
          isInWatchlist={() => true}
          isLoading={false}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
    });

    it('shows empty state when watchlist is empty', () => {
      render(
        <Watchlist
          stocks={[]}
          selectedSymbol="AAPL"
          flashStates={{}}
          onSelectStock={vi.fn()}
          onRemoveStock={vi.fn()}
          onAddStock={vi.fn()}
          onResetWatchlist={vi.fn()}
          sortField="symbol"
          sortOrder="asc"
          onSort={vi.fn()}
          allAvailableSymbols={['AAPL', 'MSFT']}
          isInWatchlist={() => false}
          isLoading={false}
        />
      );

      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
      expect(screen.getByText('Restore Default Symbols')).toBeInTheDocument();
    });
  });
});
