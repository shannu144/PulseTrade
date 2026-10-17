import React from 'react';
import { Timeframe } from '../../types/market';
import { CandlestickChart, LineChart, Maximize2 } from 'lucide-react';

export type ChartType = 'candles' | 'area';

interface ChartControlsProps {
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  onResetZoom: () => void;
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '1Y', value: '1Y' },
];

export const ChartControls: React.FC<ChartControlsProps> = ({
  timeframe,
  onTimeframeChange,
  chartType,
  onChartTypeChange,
  onResetZoom,
}) => {
  return (
    <div className="chart-controls-bar">
      {/* Timeframe Selectors */}
      <div className="timeframe-group" role="group" aria-label="Timeframe selection">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onTimeframeChange(tf.value)}
            className={`timeframe-btn ${timeframe === tf.value ? 'timeframe-active' : ''}`}
            aria-pressed={timeframe === tf.value}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="chart-controls-right">
        {/* Chart Style Toggle (Candles vs Area) */}
        <div className="chart-style-group" role="group" aria-label="Chart style">
          <button
            onClick={() => onChartTypeChange('candles')}
            className={`chart-style-btn ${chartType === 'candles' ? 'active' : ''}`}
            title="Candlestick Chart"
            aria-label="Candlestick Chart"
            aria-pressed={chartType === 'candles'}
          >
            <CandlestickChart size={15} />
          </button>
          <button
            onClick={() => onChartTypeChange('area')}
            className={`chart-style-btn ${chartType === 'area' ? 'active' : ''}`}
            title="Area Line Chart"
            aria-label="Area Line Chart"
            aria-pressed={chartType === 'area'}
          >
            <LineChart size={15} />
          </button>
        </div>

        {/* Fit / Reset Zoom */}
        <button
          onClick={onResetZoom}
          className="chart-action-btn"
          title="Reset Zoom / Fit Content"
          aria-label="Fit chart content"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );
};
