import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Trash2, QrCode } from 'lucide-react';
import { getPaymentSettings, savePaymentSettings } from '@/lib/settingsStorage';
import { useToast } from '@/hooks/use-toast';

// Read an image file and downscale it to a compact PNG data URL.
// Keeps the QR crisp for print while staying small enough for Firestore.
const fileToResizedDataUrl = (file: File, maxSize = 600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const PaymentQRSettings: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrImage, setQrImage] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await getPaymentSettings();
        setQrImage(settings.qrImage);
        setNote(settings.note);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load payment settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file (PNG or JPG)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setQrImage(dataUrl);
      toast({
        title: 'Image ready',
        description: 'Click "Save Payment QR" to store it.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to read the selected image',
        variant: 'destructive',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePaymentSettings({ qrImage, note });
      toast({
        title: 'Saved',
        description: 'Payment QR updated. It will now appear on invoices.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save payment QR',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    setQrImage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-invoice-blue flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Payment QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Upload a payment QR code (UPI / bank / wallet). Once saved, it appears in the
          "Scan to Pay" section of every invoice preview and PDF.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Uploader */}
          <div className="space-y-4">
            <div>
              <Label>QR Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="qr-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-1 border-invoice-blue text-invoice-blue hover:bg-invoice-blue-light"
              >
                <Upload className="w-4 h-4 mr-2" />
                {qrImage ? 'Replace QR Image' : 'Upload QR Image'}
              </Button>
            </div>

            <div>
              <Label htmlFor="qr-note">Caption (optional)</Label>
              <Textarea
                id="qr-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. UPI: starlink@okbank"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-invoice-blue hover:bg-invoice-blue/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Payment QR'}
              </Button>
              {qrImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemove}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label>Preview (as shown on invoice)</Label>
            <div className="mt-1 border border-invoice-border rounded-lg p-4 flex items-center justify-center min-h-[200px] bg-muted/30">
              {qrImage ? (
                <div className="text-center">
                  <p className="text-xs font-semibold text-invoice-text mb-1">SCAN TO PAY</p>
                  <img
                    src={qrImage}
                    alt="Payment QR"
                    className="h-32 w-32 mx-auto object-contain"
                  />
                  {note && (
                    <p className="text-[11px] text-invoice-text mt-1 max-w-[160px] mx-auto whitespace-pre-line">
                      {note}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <QrCode className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No QR uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
