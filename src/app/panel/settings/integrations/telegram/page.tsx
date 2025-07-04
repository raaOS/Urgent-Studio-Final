import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, BookOpen, FlaskConical, Route, FileCode2, Terminal, Bot } from "lucide-react";
import TelegramBotStatus from "@/components/panel/telegram-bot-status";

export default function TelegramIntegrationPage() {
  // These are checked on the server during rendering
  const isTokenSet = !!process.env.TELEGRAM_BOT_TOKEN;
  const isOwnerIdSet = !!process.env.OWNER_CHAT_ID;
  const isSecretSet = !!process.env.TELEGRAM_WEBHOOK_SECRET;
  
  const isFullyConfigured = isTokenSet && isOwnerIdSet && isSecretSet;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Integrasi Telegram Bot</h1>
        <p className="text-muted-foreground">Periksa status koneksi dan cara mengkonfigurasi bot Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot />Status Bot Langsung</CardTitle>
          <CardDescription>
            Kartu ini mencoba menghubungi API Telegram secara langsung untuk memastikan token Anda valid dan bot dapat diakses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TelegramBotStatus />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Status Konfigurasi Variabel</CardTitle>
          <CardDescription>
            Sistem memeriksa apakah variabel yang dibutuhkan sudah diatur di environment hosting Anda (misal: Vercel atau file .env lokal).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-md border bg-muted/30">
                <p className="font-medium font-code">TELEGRAM_BOT_TOKEN</p>
                {isTokenSet ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="h-4 w-4 mr-1"/> Terpasang</Badge>
                ) : (
                     <Badge variant="destructive"><AlertTriangle className="h-4 w-4 mr-1"/> Belum Diatur</Badge>
                )}
            </div>
             <div className="flex justify-between items-center p-3 rounded-md border bg-muted/30">
                <p className="font-medium font-code">OWNER_CHAT_ID</p>
                {isOwnerIdSet ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="h-4 w-4 mr-1"/> Terpasang</Badge>
                ) : (
                     <Badge variant="destructive"><AlertTriangle className="h-4 w-4 mr-1"/> Belum Diatur</Badge>
                )}
            </div>
             <div className="flex justify-between items-center p-3 rounded-md border bg-muted/30">
                <p className="font-medium font-code">TELEGRAM_WEBHOOK_SECRET</p>
                {isSecretSet ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="h-4 w-4 mr-1"/> Terpasang</Badge>
                ) : (
                     <Badge variant="destructive"><AlertTriangle className="h-4 w-4 mr-1"/> Belum Diatur</Badge>
                )}
            </div>
        </CardContent>
        <CardFooter>
            {isFullyConfigured ? (
                 <p className="text-sm text-green-700 dark:text-green-500 font-medium">Selamat! Konfigurasi variabel Anda sudah benar.</p>
            ) : (
                <p className="text-sm text-destructive font-medium">Beberapa variabel penting belum diatur. Bot mungkin tidak akan berfungsi.</p>
            )}
        </CardFooter>
      </Card>

      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCode2 className="text-destructive"/>Penting: Di Mana File Logika Bot?</CardTitle>
          <CardDescription>
            Halaman ini hanyalah TAMPILAN (UI). Logika "otak" bot berada di file terpisah.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert>
              <Route className="h-4 w-4" />
              <AlertTitle>Lokasi File Logika (API Route)</AlertTitle>
              <AlertDescription>
                Semua logika untuk membalas pesan, mengirim notifikasi, dan mengelola tombol ada di dalam file:
                <pre className="font-code text-sm bg-muted text-foreground p-2 rounded-md mt-2">src/app/api/telegram-webhook/route.ts</pre>
                Pemisahan antara UI (page.tsx) dan logic (route.ts) adalah praktik standar di Next.js.
              </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
      
      {!isFullyConfigured && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Status Belum Berubah?</AlertTitle>
          <AlertDescription>
            Jika Anda baru saja mengatur variabel di file <strong>.env</strong>, Anda perlu <strong>me-restart server pengembangan</strong> (matikan dengan Ctrl+C lalu jalankan lagi) agar perubahan dapat terbaca.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertTitle>Bagaimana Cara Mengatur Ini di Vercel?</AlertTitle>
        <AlertDescription>
          Semua konfigurasi bot diatur melalui <strong>Environment Variables</strong> di platform hosting Anda (seperti Vercel) atau di file `.env` untuk pengembangan lokal. 
          Halaman ini hanya untuk memeriksa status. Silakan merujuk pada file `README.md` di proyek Anda untuk panduan langkah demi langkah yang super detail.
        </AlertDescription>
      </Alert>
    </div>
  );
}
