'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Upload, CheckCircle2, AlertTriangle, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export default function SaksiInputPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [c1Photo, setC1Photo] = useState<string | null>(null);
  const [votes, setVotes] = useState({
    candidate1: 0,
    candidate2: 0,
    candidate3: 0,
    invalidVotes: 0,
  });

  const totalVoters = 850;
  const totalVotes = votes.candidate1 + votes.candidate2 + votes.candidate3 + votes.invalidVotes;
  const validVotes = votes.candidate1 + votes.candidate2 + votes.candidate3;
  const participationRate = ((totalVotes / totalVoters) * 100).toFixed(1);

  const handleVoteChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setVotes((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setC1Photo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!c1Photo) {
      toast.error('Upload foto C1 terlebih dahulu');
      return;
    }

    if (totalVotes === 0) {
      toast.error('Masukkan data suara');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Data suara berhasil disubmit!');
    } catch (error) {
      toast.error('Gagal menyimpan data suara');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-6">
      <Header
        title="Input Suara"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'Input Suara' }]}
      />

      {/* Info Alert */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Petunjuk</AlertTitle>
        <AlertDescription>
          Masukkan hasil perhitungan suara sesuai dengan formulir C1. Pastikan data yang dimasukkan sudah benar.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vote Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Hasil Perhitungan Suara
            </CardTitle>
            <CardDescription>
              TPS 045 - Total Pemilih: {totalVoters} orang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="candidate1">Pasangan Calon No. 1</Label>
                <Input
                  id="candidate1"
                  type="number"
                  min="0"
                  value={votes.candidate1 || ''}
                  onChange={(e) => handleVoteChange('candidate1', e.target.value)}
                  placeholder="Jumlah suara"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidate2">Pasangan Calon No. 2</Label>
                <Input
                  id="candidate2"
                  type="number"
                  min="0"
                  value={votes.candidate2 || ''}
                  onChange={(e) => handleVoteChange('candidate2', e.target.value)}
                  placeholder="Jumlah suara"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidate3">Pasangan Calon No. 3</Label>
                <Input
                  id="candidate3"
                  type="number"
                  min="0"
                  value={votes.candidate3 || ''}
                  onChange={(e) => handleVoteChange('candidate3', e.target.value)}
                  placeholder="Jumlah suara"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invalidVotes">Suara Tidak Sah</Label>
                <Input
                  id="invalidVotes"
                  type="number"
                  min="0"
                  value={votes.invalidVotes || ''}
                  onChange={(e) => handleVoteChange('invalidVotes', e.target.value)}
                  placeholder="Jumlah suara tidak sah"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary & C1 Upload */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Suara Sah</p>
                  <p className="text-2xl font-bold">{validVotes}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Suara Tidak Sah</p>
                  <p className="text-2xl font-bold">{votes.invalidVotes}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Suara</p>
                  <p className="text-2xl font-bold">{totalVotes}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Partisipasi</p>
                  <p className="text-2xl font-bold">{participationRate}%</p>
                </div>
              </div>

              {totalVotes > totalVoters && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Peringatan!</AlertTitle>
                  <AlertDescription>
                    Total suara ({totalVotes}) melebihi jumlah pemilih ({totalVoters})
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Distribusi Suara</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-24 text-sm">Calon 1</div>
                    <Progress value={(votes.candidate1 / totalVotes) * 100 || 0} className="flex-1" />
                    <div className="w-12 text-sm text-right">{votes.candidate1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 text-sm">Calon 2</div>
                    <Progress value={(votes.candidate2 / totalVotes) * 100 || 0} className="flex-1" />
                    <div className="w-12 text-sm text-right">{votes.candidate2}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 text-sm">Calon 3</div>
                    <Progress value={(votes.candidate3 / totalVotes) * 100 || 0} className="flex-1" />
                    <div className="w-12 text-sm text-right">{votes.candidate3}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* C1 Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload C1
              </CardTitle>
              <CardDescription>Upload foto formulir C1 sebagai bukti</CardDescription>
            </CardHeader>
            <CardContent>
              {c1Photo ? (
                <div className="space-y-4">
                  <img src={c1Photo} alt="C1 Document" className="w-full rounded-lg" />
                  <Button variant="outline" onClick={() => setC1Photo(null)} className="w-full">
                    Ganti Foto
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                  onClick={() => document.getElementById('c1-upload')?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Klik atau drag foto C1 ke sini
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Format: JPG, PNG. Maks: 10MB
                  </p>
                  <input
                    id="c1-upload"
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
      </div>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Submit Data Suara</h3>
              <p className="text-sm text-muted-foreground">
                Pastikan semua data sudah benar sebelum submit
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting || totalVotes === 0 || !c1Photo}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
