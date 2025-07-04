
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";
import { getThemeSettings, saveThemeSettings } from '@/services/themeService';
import type { ThemeSettings, ThemeColors, AnimatedGradient } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type ColorName = keyof Omit<ThemeColors, 'animatedGradient'>;

const defaultTheme: ThemeSettings = {
  light: {
    background: "210 20% 98%",
    primary: "212 84% 53%",
    accent: "39 100% 50%",
    animatedGradient: { duration: 6, colors: "#2F80ED, #FFA500, #2F80ED" },
  },
};

function hexToHsl(hex: string): string {
    if (!hex || !/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)) return '';
    let hexVal = hex.substring(1);
    if (hexVal.length === 3) {
        hexVal = hexVal.split('').map(char => char + char).join('');
    }
    const r = parseInt(hexVal.substring(0, 2), 16) / 255;
    const g = parseInt(hexVal.substring(2, 4), 16) / 255;
    const b = parseInt(hexVal.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    h = h * 360;
    s = s * 100;
    l = l * 100;
    return `${h} ${s}% ${l}%`;
}

function hslToHex(hsl: string): string {
    if (!hsl || hsl.split(' ').length < 3) return '#000000';
    const [h, s, l] = hsl.split(' ').map(val => parseFloat(val));
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }

    const toHex = (n: number) => ('0' + Math.round((n + m) * 255).toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}


export default function DisplaySettingsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<ThemeSettings>(defaultTheme);
  const [formState, setFormState] = React.useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    async function fetchTheme() {
      setIsLoading(true);
      const settings = await getThemeSettings();
      setTheme(settings);
      
      const hexSettings: ThemeSettings = JSON.parse(JSON.stringify(settings));
      hexSettings.light.background = hslToHex(settings.light.background);
      hexSettings.light.primary = hslToHex(settings.light.primary);
      hexSettings.light.accent = hslToHex(settings.light.accent);
      
      setFormState(hexSettings);
      setIsLoading(false);
    }
    fetchTheme();
  }, []);

  const handleColorChange = (colorName: ColorName, hexValue: string) => {
    setFormState(prevForm => ({
      ...prevForm,
      light: { ...prevForm.light, [colorName]: hexValue }
    }));
    
    const hslValue = hexToHsl(hexValue);
    if (hslValue) {
        setTheme(prevTheme => ({
            ...prevTheme,
            light: { ...prevTheme.light, [colorName]: hslValue }
        }));
    }
  };
  
  const handleGradientChange = (gradKey: keyof AnimatedGradient, value: string | number) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      light: { ...prevTheme.light, animatedGradient: { ...prevTheme.light.animatedGradient, [gradKey]: value } }
    }));
    setFormState(prevForm => ({
      ...prevForm,
      light: { ...prevForm.light, animatedGradient: { ...prevForm.light.animatedGradient, [gradKey]: value } }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveThemeSettings(theme);
    if (result.success) {
        toast({
            title: "Sukses!",
            description: "Pengaturan tampilan berhasil disimpan. Halaman akan dimuat ulang untuk menerapkan perubahan.",
        });
        setTimeout(() => window.location.reload(), 1500);
    } else {
        toast({
            variant: "destructive",
            title: "Gagal Menyimpan",
            description: result.error,
        });
    }
    setIsSaving(false);
  };
  
  const currentValues = theme.light;

  const previewStyle = {
    '--background': currentValues.background,
    '--primary': currentValues.primary,
    '--accent': currentValues.accent,
    '--card': '0 0% 100%',
    '--popover': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--primary-foreground': '210 40% 98%',
    '--accent-foreground': '222.2 47.4% 11.2%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': currentValues.primary,
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--secondary': '210 40% 96.1%',
    '--animation-duration': `${currentValues.animatedGradient.duration}s`,
  } as React.CSSProperties;

  const colorInputs = () => {
      if(isLoading) {
        return Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>);
      }
      return (Object.keys(defaultTheme.light).filter(k => k !== 'animatedGradient') as ColorName[]).map(colorName => (
          <div className="space-y-2" key={`light-${colorName}`}>
              <Label htmlFor={`light-${colorName}`} className="capitalize">{colorName}</Label>
              <div className="flex items-center gap-2">
                  <Input type="color" value={formState.light[colorName] as string} onChange={e => handleColorChange(colorName, e.target.value)} className="w-10 h-10 p-1"/>
                  <Input id={`light-${colorName}`} value={formState.light[colorName] as string} onChange={e => handleColorChange(colorName, e.target.value)} />
              </div>
          </div>
      ));
  };

  const gradientCustomizeSection = () => {
    if (isLoading) {
        return <div className="space-y-4"><Skeleton className="h-6 w-1/2"/><Skeleton className="h-10 w-full"/><Skeleton className="h-10 w-full"/></div>
    }
    const gradientSettings = formState.light.animatedGradient;
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Kustomisasi Gradien Teks</h3>
            <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                    <Label htmlFor="duration">Durasi Animasi</Label>
                    <span className='text-sm text-muted-foreground font-medium'>{gradientSettings.duration}s</span>
                </div>
                 <Slider
                    id="duration"
                    min={1}
                    max={20}
                    step={1}
                    value={[gradientSettings.duration]}
                    onValueChange={(value) => handleGradientChange('duration', value[0])}
                />
            </div>
             <div className='space-y-2'>
                 <Label htmlFor="colors">Warna (pisahkan dengan koma)</Label>
                <Input
                    id="colors"
                    value={gradientSettings.colors}
                    onChange={(e) => handleGradientChange('colors', e.target.value)}
                    placeholder="#ff0000, #00ff00, #0000ff"
                />
            </div>
             <div className='space-y-2'>
                 <Label>Pratinjau Gradien</Label>
                 <div className="h-8 w-full rounded-md border" style={{ backgroundImage: `linear-gradient(to right, ${gradientSettings.colors})` }}></div>
            </div>
             <Alert variant="default" className="text-sm">
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Untuk animasi yang lebih halus, pastikan warna awal dan akhir sama.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Tampilan</h1>
        <p className="text-muted-foreground">Sesuaikan skema warna dan tampilan aplikasi Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Tema</CardTitle>
                    <CardDescription>Ubah warna utama aplikasi Anda. Gunakan format HEX (Contoh: #2F80ED).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {colorInputs()}
                        </div>
                    </div>
                    <Separator/>
                    {gradientCustomizeSection()}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                </CardFooter>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Pratinjau Langsung</CardTitle>
                    <CardDescription>Perubahan akan terlihat di sini secara langsung.</CardDescription>
                </CardHeader>
                <CardContent>
                  {!mounted || isLoading ? (
                     <div className="p-6 rounded-lg border bg-background space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-10 w-28" />
                                <Skeleton className="h-10 w-28" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border bg-background space-y-4" style={previewStyle}>
                        <h4
                            className="font-bold text-xl animated-gradient-text"
                            style={{ backgroundImage: `linear-gradient(to right, ${currentValues.animatedGradient.colors})` }}
                        >
                          Pratinjau Judul Gradien
                        </h4>
                        <div className="space-y-4 text-foreground">
                            <h4 className="font-bold text-lg">Contoh Komponen</h4>
                            <p className="text-sm text-muted-foreground">Ini adalah contoh teks dengan warna muted.</p>
                            <div className="flex flex-wrap gap-2">
                                <Button style={{backgroundColor: `hsl(var(--primary))`, color: `hsl(var(--primary-foreground))`}}>Tombol Primary</Button>
                                <Button variant="outline">Tombol Outline</Button>
                                <Badge className="bg-accent text-accent-foreground hover:bg-accent/80">Badge Accent</Badge>
                            </div>
                             <Alert className="border-primary/50" style={{borderColor: `hsl(var(--primary) / 0.5)`}}>
                                <Info className="h-4 w-4 text-primary" style={{color: `hsl(var(--primary))`}}/>
                                <AlertTitle className="text-primary" style={{color: `hsl(var(--primary))`}}>Judul Peringatan</AlertTitle>
                                <AlertDescription className="text-primary/90" style={{color: `hsl(var(--primary) / 0.9)`}}>
                                    Ini adalah peringatan untuk menampilkan warna utama.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                  )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
