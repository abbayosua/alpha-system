'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, MapPin, Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SaksiFinalCheckInPage() {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfie(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selfie) {
      toast.error('Ambil foto selfie terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Check-in akhir berhasil! Tugas Anda telah selesai.');
    } catch (error) {
      toast.error('Gagal melakukan check-in akhir');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Check-in Akhir"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'Check-in Akhir' }]}
      />

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Selamat!</AlertTitle>
        <AlertDescription>
          Anda telah menyelesaikan tugas utama. Lakukan check-in akhir untuk menyelesaikan tugas hari ini.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto Selfie Akhir
          </CardTitle>
          <CardDescription>
            Ambil foto selfie setelah penghitungan suara selesai
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selfie ? (
            <div className="space-y-4">
              <img src={selfie} alt="Selfie" className="w-full max-w-md mx-auto rounded-lg" />
              <Button variant="outline" onClick={() => setSelfie(null)} className="w-full">
                Ambil Ulang
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Klik untuk mengambil foto selfie
              </p>
              <p className="text-sm text-muted-foreground">
                Format: JPG, PNG. Maks: 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Selesaikan Tugas</h3>
              <p className="text-sm text-muted-foreground">
                Pastikan semua tugas sudah selesai sebelum check-out
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={!selfie || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Check-out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
