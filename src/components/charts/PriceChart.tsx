import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  UTCTimestamp,
  MouseEventParams,
} from 'lightweight-charts';
import { Stock, Timeframe, OHLCVCandle } from '../../types/market';
import { generateHistoricalCandles } from '../../services/mockData';
import { ChartControls, ChartType } from './ChartControls';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatNumberWithCommas } from '../../utils/formatNumber';
import { Skeleton } from '../ui/Skeleton';

interface PriceChartProps {
  stock: Stock | null;
  isLoading?: boolean;
}

interface HoveredData {
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ stock, isLoading = false }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null);

  // Store active candle data locally for real-time tick merging
  const candlesRef = useRef<OHLCVCandle[]>([]);

  // Generate initial historical data when symbol or timeframe changes
  const historicalData = useMemo(() => {
    if (!stock) return [];
    return generateHistoricalCandles(stock.symbol, stock.currentPrice, timeframe);
  }, [stock?.symbol, timeframe]);

  // Initialize and render chart
  useEffect(() => {
    if (!chartContainerRef.current || !stock) return;

    candlesRef.current = [...historicalData];

    // Clean up previous chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: '#0d131f' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.12,
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: timeframe === '1D' || timeframe === '1W',
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartInstanceRef.current = chart;

    // 1. Add Price Series (Candles or Area)
    if (chartType === 'candles') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });

      const formattedCandles = candlesRef.current.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      candleSeries.setData(formattedCandles);
      candleSeriesRef.current = candleSeries;
      areaSeriesRef.current = null;
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(14, 165, 233, 0.35)',
        bottomColor: 'rgba(14, 165, 233, 0.01)',
        lineColor: '#38bdf8',
        lineWidth: 2,
      });

      const formattedArea = candlesRef.current.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.close,
      }));

      areaSeries.setData(formattedArea);
      areaSeriesRef.current = areaSeries;
      candleSeriesRef.current = null;
    }

    // 2. Add Volume Histogram Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Separate scale
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    const formattedVolume = candlesRef.current.map((c) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
    }));

    volumeSeries.setData(formattedVolume);
    volumeSeriesRef.current = volumeSeries;

    // 3. Crosshair hover inspection
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.time || !param.seriesData) {
        setHoveredData(null);
        return;
      }

      let priceData: any = null;
      if (candleSeriesRef.current) {
        priceData = param.seriesData.get(candleSeriesRef.current);
      } else if (areaSeriesRef.current) {
        priceData = param.seriesData.get(areaSeriesRef.current);
      }

      const volData: any = volumeSeriesRef.current
        ? param.seriesData.get(volumeSeriesRef.current)
        : null;

      if (priceData) {
        const timeNum = Number(param.time) * 1000;
        const date = new Date(timeNum);
        const timeStr =
          timeframe === '1D' || timeframe === '1W'
            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if ('open' in priceData) {
          setHoveredData({
            timeStr,
            open: priceData.open,
            high: priceData.high,
            low: priceData.low,
            close: priceData.close,
            volume: volData?.value || 0,
          });
        } else {
          setHoveredData({
            timeStr,
            open: priceData.value,
            high: priceData.value,
            low: priceData.value,
            close: priceData.value,
            volume: volData?.value || 0,
          });
        }
      }
    });

    chart.timeScale().fitContent();

    // 4. ResizeObserver for responsive resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [stock?.symbol, timeframe, chartType, historicalData]);

  // Real-time tick update: dynamically update the latest candle as live prices change
  useEffect(() => {
    if (!stock || candlesRef.current.length === 0) return;

    const currentPrice = stock.currentPrice;
    const lastIndex = candlesRef.current.length - 1;
    const lastCandle = candlesRef.current[lastIndex];

    const updatedCandle: OHLCVCandle = {
      ...lastCandle,
      high: Math.max(lastCandle.high, currentPrice),
      low: Math.min(lastCandle.low, currentPrice),
      close: currentPrice,
      volume: lastCandle.volume + 50,
    };

    candlesRef.current[lastIndex] = updatedCandle;

    try {
      if (candleSeriesRef.current) {
        candleSeriesRef.current.update({
          time: updatedCandle.time as UTCTimestamp,
          open: updatedCandle.open,
          high: updatedCandle.high,
          low: updatedCandle.low,
          close: updatedCandle.close,
        });
      }

      if (areaSeriesRef.current) {
        areaSeriesRef.current.update({
          time: updatedCandle.time as UTCTimestamp,
          value: updatedCandle.close,
        });
      }

      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.update({
          time: updatedCandle.time as UTCTimestamp,
          value: updatedCandle.volume,
          color:
            updatedCandle.close >= updatedCandle.open
              ? 'rgba(16, 185, 129, 0.35)'
              : 'rgba(244, 63, 94, 0.35)',
        });
      }
    } catch {
      // Prevent crash if chart was mid-destruction
    }
  }, [stock?.currentPrice, stock?.lastUpdated]);

  const handleResetZoom = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.timeScale().fitContent();
    }
  };

  if (isLoading || !stock) {
    return (
      <div className="price-chart-card skeleton-card">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="180px" height="28px" />
          <Skeleton width="220px" height="28px" />
        </div>
        <Skeleton height="360px" width="100%" />
      </div>
    );
  }

  return (
    <div className="price-chart-card">
      {/* Chart Header Bar */}
      <div className="price-chart-header">
        <div className="chart-title-box">
          <span className="chart-ticker">{stock.symbol}</span>
          <span className="chart-currency">USD • {timeframe} Interval</span>
          <span className="chart-sim-notice">Simulated Price History</span>
        </div>

        <ChartControls
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          chartType={chartType}
          onChartTypeChange={setChartType}
          onResetZoom={handleResetZoom}
        />
      </div>

      {/* Hover Inspection Bar */}
      <div className="chart-inspect-bar" aria-live="polite">
        {hoveredData ? (
          <div className="inspect-metrics">
            <span className="inspect-item">
              <span className="inspect-label">TIME:</span> {hoveredData.timeStr}
            </span>
            <span className="inspect-item">
              <span className="inspect-label">O:</span> {formatCurrency(hoveredData.open)}
            </span>
            <span className="inspect-item">
              <span className="inspect-label">H:</span> {formatCurrency(hoveredData.high)}
            </span>
            <span className="inspect-item">
              <span className="inspect-label">L:</span> {formatCurrency(hoveredData.low)}
            </span>
            <span className="inspect-item">
              <span className="inspect-label">C:</span> {formatCurrency(hoveredData.close)}
            </span>
            <span className="inspect-item">
              <span className="inspect-label">VOL:</span> {formatNumberWithCommas(hoveredData.volume)}
            </span>
          </div>
        ) : (
          <div className="inspect-hint">
            Move cursor over chart for candle OHLCV inspection
          </div>
        )}
      </div>

      {/* Chart Canvas Container */}
      <div
        ref={chartContainerRef}
        className="chart-canvas-container"
        tabIndex={0}
        aria-label={`${stock.symbol} interactive candlestick and volume financial chart`}
      />
    </div>
  );
};
