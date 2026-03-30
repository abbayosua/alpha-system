'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, MapPin, Upload, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export default function SaksiCheckInPage() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
  });
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsVerified, setGpsVerified] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tpsLocation = {
    latitude: -6.1944,
    longitude: 106.8374,
    maxDistance: 100, // 100 meters
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: 'Browser tidak mendukung GPS' }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const distance = calculateDistance(
          latitude,
          longitude,
          tpsLocation.latitude,
          tpsLocation.longitude
        );

        setLocation({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
        });

        setGpsVerified(distance <= tpsLocation.maxDistance);
        
        if (distance > tpsLocation.maxDistance) {
          toast.warning(`Anda berada ${Math.round(distance)}m dari TPS (maks: ${tpsLocation.maxDistance}m)`);
        } else {
          toast.success('Lokasi terverifikasi!');
        }
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: 'Gagal mendapatkan lokasi. Pastikan GPS aktif.',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const captureSelfie = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      toast.error('Tidak dapat mengakses kamera');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setSelfie(canvas.toDataURL('image/jpeg'));
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      }
    }
  };

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
    if (!location.latitude || !selfie) {
      toast.error('Lengkapi semua data sebelum submit');
      return;
    }

    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Check-in berhasil!');
    } catch (error) {
      toast.error('Gagal melakukan check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Check-in"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'Check-in' }]}
      />

      {/* Info Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Penting!</AlertTitle>
        <AlertDescription>
          Pastikan GPS aktif dan Anda berada di lokasi TPS yang ditugaskan untuk melakukan check-in.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GPS Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lokasi GPS
            </CardTitle>
            <CardDescription>
              Verifikasi lokasi Anda di TPS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {location.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : location.latitude ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-medium">{location.latitude.toFixed(6)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-medium">{(location.longitude ?? 0).toFixed(6)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Akurasi</p>
                  <p className="font-medium">{location.accuracy?.toFixed(0)} meter</p>
                </div>
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  gpsVerified ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {gpsVerified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-green-600">Lokasi terverifikasi</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600">Di luar radius TPS</span>
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={getLocation} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Perbarui Lokasi
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Klik tombol di bawah untuk mendapatkan lokasi Anda
                </p>
                <Button onClick={getLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Dapatkan Lokasi
                </Button>
              </div>
            )}

            {location.error && (
              <p className="text-sm text-destructive">{location.error}</p>
            )}
          </CardContent>
        </Card>

        {/* Selfie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Foto Selfie
            </CardTitle>
            <CardDescription>
              Ambil foto selfie untuk verifikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selfie ? (
              <div className="space-y-4">
                <img src={selfie} alt="Selfie" className="w-full rounded-lg" />
                <Button
                  variant="outline"
                  onClick={() => setSelfie(null)}
                  className="w-full"
                >
                  Ambil Ulang
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg bg-muted"
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={captureSelfie}>
                    <Camera className="mr-2 h-4 w-4" />
                    Buka Kamera
                  </Button>
                  <Button onClick={takePhoto} variant="secondary">
                    Ambil Foto
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">atau</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Foto
                </Button>
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
      </div>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Submit Check-in</h3>
              <p className="text-sm text-muted-foreground">
                Pastikan semua data sudah benar sebelum submit
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!location.latitude || !selfie || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit Check-in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
