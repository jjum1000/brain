# 📋 Task 004: YouTube 영상 통합

**작성일**: 2025-10-31
**우선순위**: 🟡 High
**예상 시간**: 3-5일
**상태**: ⏳ 준비 완료

---

## 📌 작업 개요

각 전략에 대한 YouTube 교육 영상을 통합하여 사용자가 전략을 이해하기 쉽도록 구현합니다.

---

## 🎯 완료 조건

- [ ] Strategy 타입에 youtubeUrl 필드 추가
- [ ] YouTube 플레이어 컴포넌트 작성
- [ ] 영상 메타데이터 표시
- [ ] 반응형 비디오 플레이어
- [ ] 오류 처리

---

## 📁 파일 구조

```
src/
├── components/
│   ├── common/
│   │   └── YouTubePlayer.tsx        (신규)
│   └── pages/
│       └── StrategyDetail.tsx       (수정)
└── types/
    └── firestore.ts                (수정) - Strategy에 youtubeUrl 추가
```

---

## 🔧 기존 코드 참고

### 1. 타입 확장 패턴
**파일**: `src/types/firestore.ts`

```typescript
export interface Strategy {
  id: string;
  name: string;
  description: string;
  // ... 기존 필드들
}
```

**적용**: `youtubeUrl` 필드 추가

### 2. 컴포넌트 구조
**파일**: `src/components/pages/StrategyDetail.tsx`

기존 섹션들과 동일한 Card 기반 레이아웃

---

## 📦 필수 의존성

```bash
# 옵션 1: 라이브러리 사용
npm install react-youtube

# 옵션 2: 순수 iframe (라이브러리 불필요)
# 권장: 의존성 최소화
```

---

## 🛠️ 구현 단계

### 1단계: Strategy 타입 수정 (src/types/firestore.ts)

**기존 코드**:
```typescript
export interface Strategy {
  id: string;
  name: string;
  description: string;
  // ...
}
```

**수정 코드**:
```typescript
export interface Strategy {
  id: string;
  name: string;
  description: string;
  youtubeUrl?: string;           // ← 추가
  youtubeTitle?: string;         // ← 추가
  youtubeDescription?: string;   // ← 추가
  // ... 기존 필드들
}
```

---

### 2단계: YouTubePlayer 컴포넌트 (src/components/common/YouTubePlayer.tsx)

**방법 1: iframe 사용 (권장 - 의존성 최소)**

```typescript
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
  width?: string | number;
  height?: string | number;
}

export const YouTubePlayer: FC<YouTubePlayerProps> = ({
  videoUrl,
  title = 'Strategy Tutorial',
  width = '100%',
  height = 400,
}) => {
  // YouTube URL에서 video ID 추출
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <Alert className="bg-amber-600/20 border-amber-600">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-200 ml-2">
          Invalid YouTube URL
        </AlertDescription>
      </Alert>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubePlayer;
```

**방법 2: react-youtube 라이브러리 사용**

```typescript
import { FC } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
}

export const YouTubePlayer: FC<YouTubePlayerProps> = ({
  videoUrl,
  title = 'Strategy Tutorial',
}) => {
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) return null;

  const opts: YouTubeProps['opts'] = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <YouTube videoId={videoId} opts={opts} />
      </CardContent>
    </Card>
  );
};
```

**권장**: 방법 1 (iframe) 사용 - 의존성 최소화

---

### 3단계: StrategyDetail.tsx 수정

**기존 구조** (대략):

```typescript
export function StrategyDetail() {
  const { strategy, loading, error } = useStrategy(id);

  return (
    <div className="space-y-8">
      {/* 전략 정보 */}
      <StrategyInfo strategy={strategy} />

      {/* 성과 차트 */}
      <PerformanceChart strategy={strategy} />

      {/* 거래 이력 */}
      <TradeHistory strategy={strategy} />
    </div>
  );
}
```

**수정 코드**:

```typescript
import { YouTubePlayer } from '@/components/common/YouTubePlayer';

export function StrategyDetail() {
  const { strategy, loading, error } = useStrategy(id);

  return (
    <div className="space-y-8">
      {/* YouTube 영상 (새로 추가) */}
      {strategy?.youtubeUrl && (
        <YouTubePlayer
          videoUrl={strategy.youtubeUrl}
          title={strategy.youtubeTitle || `${strategy.name} - Tutorial`}
        />
      )}

      {/* 전략 정보 */}
      <StrategyInfo strategy={strategy} />

      {/* 성과 차트 */}
      <PerformanceChart strategy={strategy} />

      {/* 거래 이력 */}
      <TradeHistory strategy={strategy} />
    </div>
  );
}
```

---

### 4단계: YouTube URL 저장 (Firestore)

**Firebase Console에서 Strategy 문서 수정**:

```json
{
  "id": "strategy-1",
  "name": "Momentum Trading",
  "description": "...",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "youtubeTitle": "How to Trade Momentum Strategy",
  "youtubeDescription": "Learn the basics of momentum trading..."
}
```

**또는 관리 인터페이스 추가** (선택):

```typescript
// src/components/pages/StrategyManagement.tsx (관리자용)
// 전략 생성/수정 시 youtubeUrl 필드 추가
```

---

## 🎨 UI 예제

```typescript
// StrategyDetail.tsx의 전체 레이아웃
<div className="grid lg:grid-cols-3 gap-8">
  {/* 왼쪽: 영상 */}
  <div className="lg:col-span-2">
    <YouTubePlayer
      videoUrl={strategy.youtubeUrl}
      title="Strategy Explanation"
    />

    {/* 영상 설명 */}
    {strategy.youtubeDescription && (
      <Card className="mt-4 bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-300">
            {strategy.youtubeDescription}
          </p>
        </CardContent>
      </Card>
    )}
  </div>

  {/* 오른쪽: 전략 정보 */}
  <div>
    <StrategyInfoCard strategy={strategy} />
  </div>
</div>
```

---

## ⚠️ 주의사항

### 1. YouTube 개인정보 보호 모드
```typescript
// 리다이렉트 없이 비디오 재생
const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
```

### 2. 동적 높이 조정
```typescript
// 반응형 비디오 플레이어
const aspectRatio = 16 / 9;
const width = containerWidth;
const height = width / aspectRatio;
```

### 3. URL 검증
```typescript
const isValidYouTubeUrl = (url: string): boolean => {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/./.test(url);
};
```

---

## 🧪 검증 체크리스트

- [ ] YouTube 링크 파싱 정상
- [ ] 영상 재생 정상
- [ ] 반응형 플레이어
- [ ] 잘못된 URL 처리
- [ ] 로딩 상태 표시
- [ ] 오류 메시지 표시

---

**작성**: Claude AI
**최종 검토**: 2025-10-31
**상태**: 실행 준비 완료 ✅
