'use client';

import { useRef, useState, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        QR Code
      </h3>

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
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Print or share this QR code so customers can easily scan and leave a review.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={downloadSuccess ? 'primary' : 'secondary'}
              size="md"
              onClick={downloadQR}
              className="flex-1"
            >
              {downloadSuccess ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Downloaded!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </>
              )}
            </Button>

            {shareSupported && (
              <Button
                variant="outline"
                size="md"
                onClick={shareQR}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share QR
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
