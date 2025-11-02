import type { FC } from 'react';
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

/**
 * QRCodeGenerator Component
 * Displays a QR code for easy sharing of addresses
 * Supports downloading as PNG image
 */
interface QRCodeGeneratorProps {
  value: string;
  title?: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export const QRCodeGenerator: FC<QRCodeGeneratorProps> = ({
  value,
  title = 'Solana Address',
  size = 200,
  level = 'H',
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Display */}
      <div ref={qrRef} className="p-4 bg-white rounded-lg">
        <QRCodeSVG value={value} size={size} level={level} includeMargin={true} />
      </div>

      {/* Title */}
      <p className="text-xs text-slate-400">{title}</p>

      {/* Download Button */}
      <Button
        onClick={downloadQR}
        variant="outline"
        className="gap-2"
        size="sm"
      >
        <Download className="h-4 w-4" />
        Download QR
      </Button>
    </div>
  );
};
