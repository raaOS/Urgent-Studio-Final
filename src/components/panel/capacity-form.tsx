
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { saveCapacitySettings } from '@/services/capacityService';
import type { CapacitySettings } from '@/lib/types';

export default function CapacityForm({ initialCapacity }: { initialCapacity: CapacitySettings }) {
  const { toast } = useToast();
  const [capacity, setCapacity] = React.useState<CapacitySettings>(initialCapacity);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCapacitySettings(capacity);
      toast({
        title: "Sukses!",
        description: "Kapasitas order telah berhasil disimpan.",
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Gagal Menyimpan", description: error, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCapacity(prev => ({ ...prev, [id]: parseInt(value, 10) || 0 }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Atur Kapasitas</CardTitle>
          <CardDescription>
            Sistem akan secara otomatis membatasi order baru jika kapasitas ini tercapai.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <>
              <div className="space-y-2">
                <Label htmlFor="weekly">Kapasitas per Minggu</Label>
                <Input 
                  id="weekly" 
                  type="number" 
                  value={capacity.weekly} 
                  onChange={handleInputChange}
                  placeholder="Contoh: 5" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly">Kapasitas per Bulan</Label>
                <Input 
                  id="monthly" 
                  type="number" 
                  value={capacity.monthly}
                  onChange={handleInputChange}
                  placeholder="Contoh: 20" 
                />
              </div>
            </>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Kapasitas
          </Button>
        </CardFooter>
      </Card>

      <Alert>
        <Info className="h-4 w-4"/>
        <AlertTitle>Bagaimana ini bekerja?</AlertTitle>
        <AlertDescription>
          Jika order mingguan sudah mencapai batas, tombol tambah ke keranjang akan dinonaktifkan secara otomatis hingga minggu berikutnya.
        </AlertDescription>
      </Alert>
    </>
  );
}
