'use client';

import { useRef, useState, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Check, QrCode } from 'lucide-react';

interface QRCodeSectionProps {
  shareableUrl: string;
  businessName: string;
}

export function QRCodeSection({ shareableUrl, businessName }: QRCodeSectionProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSupported] = useState(() => typeof navigator !== 'undefined' && !!navigator.share);

  // Generate safe filename from business name
  const safeFileName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const downloadQR = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${safeFileName}-review-qr.png`;
    link.href = url;
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  }, [safeFileName]);

  const shareQR = useCallback(async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) return;

      const file = new File([blob], `${safeFileName}-review-qr.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${businessName} - Review QR Code`,
          text: 'Scan this QR code to leave a review',
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback: share just the URL if file sharing not supported
        await navigator.share({
          title: `${businessName} - Review Link`,
          text: 'Leave a review using this link',
          url: shareableUrl,
        });
      }
    } catch (err) {
      // User cancelled or share failed - ignore
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }, [businessName, safeFileName, shareableUrl]);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <QrCode className="w-5 h-5 text-muted-foreground" />
          QR Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* QR Code Display */}
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-xl shadow-inner border border-zinc-200"
          >
            <QRCodeCanvas
              value={shareableUrl}
              size={180}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 flex-1 w-full sm:w-auto">
            <p className="text-sm text-muted-foreground">
              Print or share this QR code so customers can easily scan and leave a review.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant={downloadSuccess ? 'default' : 'secondary'}
                onClick={downloadQR}
                className="flex-1"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </>
                )}
              </Button>

              {shareSupported && (
                <Button
                  variant="outline"
                  onClick={shareQR}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share QR
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
