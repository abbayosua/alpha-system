'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Upload, Video, Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SaksiLaporPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'penggelembungan', label: 'Penggelembungan Suara' },
    { value: 'penyuapan', label: 'Penyuapan/Suap' },
    { value: 'intimidasi', label: 'Intimidasi Pemilih' },
    { value: 'kekerasan', label: 'Kekerasan/Ancaman' },
    { value: 'administrasi', label: 'Ketidakberesan Administrasi' },
    { value: 'lainnya', label: 'Lainnya' },
  ];

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Ukuran video maksimal 50MB');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Masukkan judul laporan');
      return;
    }
    if (!description.trim()) {
      toast.error('Masukkan deskripsi kejadian');
      return;
    }
    if (!category) {
      toast.error('Pilih kategori pelanggaran');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Laporan berhasil dikirim!');
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      removeVideo();
    } catch (error) {
      toast.error('Gagal mengirim laporan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Lapor Pelanggaran"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'Lapor' }]}
      />

      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Penting!</AlertTitle>
        <AlertDescription>
          Pastikan laporan yang Anda sampaikan berdasarkan fakta yang benar. Laporan palsu dapat
          dikenakan sanksi hukum.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Form Laporan
            </CardTitle>
            <CardDescription>
              Laporkan kecurangan atau pelanggaran yang Anda saksikan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Laporan</Label>
              <Input
                id="title"
                placeholder="Judul singkat kejadian"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori Pelanggaran</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Kejadian</Label>
              <Textarea
                id="description"
                placeholder="Jelaskan kronologi kejadian secara detail..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datetime">Waktu Kejadian</Label>
              <Input id="datetime" type="datetime-local" />
            </div>
          </CardContent>
        </Card>

        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Bukti Video
            </CardTitle>
            <CardDescription>
              Upload video sebagai bukti pendukung (opsional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoPreview ? (
              <div className="relative">
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Klik atau drag video ke sini
                </p>
                <p className="text-sm text-muted-foreground">
                  Format: MP4, WebM, MOV. Maks: 50MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Tips merekam video:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Pastikan pencahayaan cukup</li>
                <li>Rekam dengan jelas objek kejadian</li>
                <li>Jangan mengedit atau memanipulasi video</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Kirim Laporan</h3>
              <p className="text-sm text-muted-foreground">
                Laporan akan ditinjau oleh tim verifikasi
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title || !description || !category}
              variant="destructive"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Kirim Laporan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
