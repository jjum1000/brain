import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface YouTubePlayerProps {
  videoUrl: string;
  title?: string;
}

/**
 * YouTube 플레이어 컴포넌트
 * iframe을 사용한 순수 구현 (의존성 최소화)
 * 다양한 YouTube URL 형식을 지원합니다
 */
export function YouTubePlayer({
  videoUrl,
  title = 'Strategy Tutorial',
}: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * YouTube URL에서 video ID를 추출합니다
   * 지원하는 형식:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://www.youtube.com/embed/VIDEO_ID
   */
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /youtube\.com\/watch\?v=([^&\n?#]+)/,
      /youtu\.be\/([^?\n#]+)/,
      /youtube\.com\/embed\/([^?\n#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  };

  /**
   * YouTube URL이 유효한 형식인지 검증합니다
   */
  const isValidYouTubeUrl = (url: string): boolean => {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url);
  };

  useEffect(() => {
    try {
      // URL 검증
      if (!isValidYouTubeUrl(videoUrl)) {
        setError('Invalid YouTube URL format');
        setLoading(false);
        return;
      }

      // Video ID 추출
      const id = extractVideoId(videoUrl);
      if (!id) {
        setError('Unable to extract video ID from URL');
        setLoading(false);
        return;
      }

      setVideoId(id);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError('Failed to process YouTube URL');
      setLoading(false);
    }
  }, [videoUrl]);

  // 로딩 중
  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="w-full h-[400px] bg-slate-700" />
        </CardContent>
      </Card>
    );
  }

  // 오류 발생
  if (error || !videoId) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-600/20 border-amber-600">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-200 ml-2">
              {error || 'Invalid YouTube URL'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // YouTube 임베드 URL 구성
  // rel=0: 관련 영상 숨김
  // modestbranding=1: YouTube 로고 간소화
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* 반응형 16:9 aspect ratio 컨테이너 */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ border: 'none' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default YouTubePlayer;
