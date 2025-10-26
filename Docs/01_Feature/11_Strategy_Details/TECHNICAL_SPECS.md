# 기술 사양서 - 전략 상세 페이지

## 시스템 아키텍처

```
┌─────────────────────────────────────────┐
│         React Component                 │
│    (StrategyDetailsPage.tsx)            │
├─────────────────────────────────────────┤
│  Header | Video | Chart | History      │
├─────────────────────────────────────────┤
│         API Layer (TanStack Query)      │
├─────────────────────────────────────────┤
│  Strategy | Trades | PriceData | Stats  │
└─────────────────────────────────────────┘
```

## 컴포넌트 구조

### 1. StrategyDetailsPage (메인 페이지)
```typescript
interface StrategyDetailsPageProps {
  strategyId: string;
}

const StrategyDetailsPage: React.FC<StrategyDetailsPageProps> = ({ strategyId }) => {
  // 데이터 페칭
  const strategy = useQuery(['strategy', strategyId]);
  const trades = useQuery(['trades', strategyId]);
  const priceData = useQuery(['priceData', strategyId]);

  return (
    <div className="strategy-details">
      <StrategyHeader strategy={strategy} />
      <YouTubeSection video={strategy.video} />
      <ChartSection priceData={priceData} trades={trades} />
      <TradeHistorySection trades={trades} />
      <PerformanceStats strategy={strategy} trades={trades} />
    </div>
  );
};
```

### 2. StrategyHeader (헤더)
```typescript
interface StrategyHeaderProps {
  strategy: Strategy;
}

const StrategyHeader: React.FC<StrategyHeaderProps> = ({ strategy }) => {
  return (
    <header className="strategy-header">
      <div className="header-info">
        <h1>{strategy.name}</h1>
        <Badge risk={strategy.risk}>{strategy.risk}</Badge>
      </div>
      <div className="key-metrics">
        <MetricCard label="APY" value={`${strategy.apy}%`} />
        <MetricCard label="24h Return" value={`${strategy.returns_24h}%`} />
        <MetricCard label="TVL" value={formatCurrency(strategy.tvl)} />
        <MetricCard label="Users" value={strategy.users} />
      </div>
      <Button>Deposit Now</Button>
    </header>
  );
};
```

### 3. YouTubeSection (영상)
```typescript
interface YouTubeSectionProps {
  video: {
    url: string;
    channelName: string;
    views: string;
    uploaded: string;
    thumbnail: string;
  };
}

const YouTubeSection: React.FC<YouTubeSectionProps> = ({ video }) => {
  return (
    <section className="youtube-section">
      <div className="video-container">
        <iframe
          width="100%"
          height="500"
          src={video.url}
          frameBorder="0"
          allowFullScreen
        />
      </div>
      <div className="video-metadata">
        <div className="channel-info">
          <img src={video.thumbnail} alt={video.channelName} />
          <div className="info">
            <h3>{video.channelName}</h3>
            <p>{video.views} views • {video.uploaded}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
```

### 4. ChartSection (차트)
```typescript
interface ChartSectionProps {
  priceData: PriceData[];
  trades: Trade[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ priceData, trades }) => {
  const [timeframe, setTimeframe] = useState('1D');

  useEffect(() => {
    const chart = createChart();

    // 캔들 차트 데이터
    const candleData = priceData.map(d => ({
      time: d.timestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    // 거래 신호 표시
    const buyTrades = trades.filter(t => t.type === 'BUY');
    const sellTrades = trades.filter(t => t.type === 'SELL');

    // 마커 추가
    buyTrades.forEach(trade => {
      chart.addMarker({
        time: trade.timestamp,
        position: 'belowBar',
        color: '#4ade80',
        shape: 'circle',
        size: 2,
      });
    });

    sellTrades.forEach(trade => {
      chart.addMarker({
        time: trade.timestamp,
        position: 'aboveBar',
        color: '#f87171',
        shape: 'circle',
        size: 2,
      });
    });

    return () => chart.remove();
  }, [priceData, trades]);

  return (
    <section className="chart-section">
      <div className="chart-controls">
        {['1H', '1D', '1W', '1M'].map(tf => (
          <Button
            key={tf}
            variant={timeframe === tf ? 'default' : 'outline'}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>
      <div id="chart" className="chart-container" />
    </section>
  );
};
```

### 5. TradeHistorySection (거래 히스토리)
```typescript
interface TradeHistorySectionProps {
  trades: Trade[];
}

const TradeHistorySection: React.FC<TradeHistorySectionProps> = ({ trades }) => {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'pnl'>('date');

  const filteredTrades = trades
    .filter(t => filter === 'all' || t.type.toLowerCase() === filter)
    .sort((a, b) => {
      if (sortBy === 'date') return b.timestamp - a.timestamp;
      if (sortBy === 'pnl') return b.pnl - a.pnl;
      return 0;
    });

  return (
    <section className="trade-history">
      <div className="controls">
        <Select value={filter} onValueChange={setFilter}>
          <option value="all">All</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <option value="date">Date</option>
          <option value="pnl">P&L</option>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTrades.map(trade => (
            <TableRow key={trade.id}>
              <TableCell>{formatDate(trade.timestamp)}</TableCell>
              <TableCell>
                <Badge variant={trade.type === 'BUY' ? 'green' : 'red'}>
                  {trade.type}
                </Badge>
              </TableCell>
              <TableCell>${trade.price.toFixed(2)}</TableCell>
              <TableCell>{trade.quantity}</TableCell>
              <TableCell className={trade.pnl >= 0 ? 'text-green' : 'text-red'}>
                +${trade.pnl.toFixed(2)} ({trade.pnl_percent}%)
              </TableCell>
              <TableCell>
                <Badge>{trade.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(trades.length / 50)}
        onPageChange={setPage}
      />
    </section>
  );
};
```

### 6. PerformanceStats (성과 통계)
```typescript
interface PerformanceStatsProps {
  strategy: Strategy;
  trades: Trade[];
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ strategy, trades }) => {
  // 통계 계산
  const totalTrades = trades.length;
  const winTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = (winTrades / totalTrades) * 100;
  const avgProfit = trades.reduce((sum, t) => sum + t.pnl, 0) / totalTrades;
  const mdd = calculateMDD(trades);
  const sharpeRatio = calculateSharpe(trades);

  return (
    <section className="performance-stats">
      <div className="stats-grid">
        <StatCard label="Total Trades" value={totalTrades} />
        <StatCard label="Win Rate" value={`${winRate.toFixed(2)}%`} />
        <StatCard label="Avg Profit" value={`$${avgProfit.toFixed(2)}`} />
        <StatCard label="MDD" value={`${mdd.toFixed(2)}%`} />
        <StatCard label="Sharpe Ratio" value={sharpeRatio.toFixed(2)} />
        <StatCard label="Total P&L" value={`$${strategy.totalPnL.toFixed(2)}`} />
      </div>
    </section>
  );
};
```

## API 엔드포인트

### Strategy Details
```
GET /api/strategies/:id

Response:
{
  "id": "strategy_001",
  "name": "Luna Trend Following",
  "creator": "Crypto King",
  "description": "...",
  "risk": "medium",
  "apy": 28.5,
  "tvl": 1234567,
  "users": 342,
  "returns_24h": 2.3,
  "video": {
    "url": "https://youtube.com/embed/...",
    "channelName": "Crypto King",
    "views": "1.2M",
    "subscribers": "500K",
    "uploaded": "2025-10-20",
    "thumbnail": "https://..."
  }
}
```

### Price Data
```
GET /api/strategies/:id/price-data?timeframe=1D&limit=100

Response:
[
  {
    "timestamp": 1698432000,
    "open": 150.23,
    "high": 160.45,
    "low": 148.90,
    "close": 158.50,
    "volume": 1234567
  },
  ...
]
```

### Trade History
```
GET /api/strategies/:id/trades?limit=50&offset=0

Response:
{
  "total": 1234,
  "data": [
    {
      "id": "trade_001",
      "timestamp": 1698432000,
      "type": "BUY",
      "price": 155.23,
      "quantity": 100,
      "pnl": 320.50,
      "pnl_percent": 2.1,
      "status": "completed",
      "txHash": "0x..."
    },
    ...
  ]
}
```

### Performance Stats
```
GET /api/strategies/:id/stats

Response:
{
  "totalTrades": 1234,
  "winRate": 65.5,
  "avgProfit": 150.25,
  "mdd": 12.5,
  "sharpeRatio": 1.8,
  "totalPnL": 185123.45
}
```

## TradingView 차트 통합

### Lightweight Charts 사용
```typescript
import { createChart } from 'lightweight-charts';

const chart = createChart(document.getElementById('chart'), {
  layout: {
    textColor: '#d1d5db',
    background: { color: '#1f2937' },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  },
});

// 캔들스틱 시리즈
const candleSeries = chart.addCandlestickSeries();
candleSeries.setData(candleData);

// 거래량
const volumeSeries = chart.addHistogramSeries();
volumeSeries.setData(volumeData);

chart.timeScale().fitContent();
```

## 성능 최적화

### 데이터 캐싱
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30초
      cacheTime: 600000, // 10분
    },
  },
});
```

### 가상 스크롤 (거래 히스토리)
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={trades.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

### 이미지 최적화
```typescript
// YouTube 썸네일
<img
  src={video.thumbnail}
  alt={video.channelName}
  loading="lazy"
  width={120}
  height={90}
/>
```

## 보안 고려사항

### 1. YouTube API
```typescript
// 서버에서만 API 키 사용
const getVideoInfo = async (videoId: string) => {
  const response = await fetch(`${process.env.API_URL}/videos/${videoId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.YOUTUBE_API_KEY}`
    }
  });
};
```

### 2. XSS 방지
```typescript
// iframe sandbox 속성
<iframe
  sandbox="allow-scripts allow-same-origin"
  src={sanitizedUrl}
/>
```

### 3. CORS 설정
```typescript
// 백엔드에서 설정
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true,
}));
```

## 테스트 전략

### Unit Tests
```typescript
describe('TradeHistorySection', () => {
  it('should filter trades by type', () => {
    const trades = [
      { id: 1, type: 'BUY' },
      { id: 2, type: 'SELL' },
    ];
    // Test filtering
  });
});
```

### E2E Tests
```typescript
describe('Strategy Details Page', () => {
  it('should load strategy data', () => {
    cy.visit('/strategy/strategy_001');
    cy.contains('Luna Trend Following').should('be.visible');
  });

  it('should display chart', () => {
    cy.get('#chart').should('be.visible');
  });
});
```

## 배포 체크리스트

- [ ] YouTube API 키 설정
- [ ] 차트 라이브러리 통합
- [ ] API 엔드포인트 구현
- [ ] 데이터베이스 스키마 생성
- [ ] 성능 최적화 완료
- [ ] 보안 검토 완료
- [ ] 브라우저 호환성 테스트
- [ ] 모바일 반응성 테스트
- [ ] 프로덕션 배포
