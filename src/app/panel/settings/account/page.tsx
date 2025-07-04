'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Pengaturan Akun</h1>
        <p className="text-muted-foreground">Kelola keamanan dan pengaturan akun Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ganti Kata Sandi</CardTitle>
          <CardDescription>Ubah kata sandi Anda secara berkala untuk menjaga keamanan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Kata Sandi Baru</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Kata Sandi Baru</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Ubah Kata Sandi</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
