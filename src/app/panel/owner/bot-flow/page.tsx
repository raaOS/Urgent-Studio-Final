'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowDown, Bot, User as UserIcon, Shield, Check, X, FileImage, Milestone, Home, ShoppingCart, CreditCard, Send, Pencil, Calendar, Ban, AlertTriangle, MessageSquare, SendToBack, ListChecks } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PopoverMessage = ({ from, children, isBotMessage = false }: { from: 'Bot' | 'Pembeli' | 'Owner'; children: React.ReactNode; isBotMessage?: boolean }) => {
    const fromColor = from === 'Bot' ? 'text-primary' : from === 'Pembeli' ? 'text-green-600' : 'text-amber-600';
    return (
        <div className={cn("flex gap-3 items-start text-left p-1", isBotMessage ? "flex-col items-start" : "")}>
            <div className={cn(`flex items-center gap-1.5 text-sm font-bold shrink-0 ${fromColor}`)}>
                {from === 'Bot' ? <Bot className="h-4 w-4"/> : <UserIcon className="h-4 w-4"/>}
                <span>{from}:</span>
            </div>
            <div className="text-sm text-popover-foreground space-y-2">{children}</div>
        </div>
    );
}

const FlowStep = ({ actor, title, description, badgeText, badgeVariant = "secondary", icon, tooltipContent }: {
  actor: 'Pembeli' | 'Bot' | 'Owner' | 'Sistem' | 'Desainer';
  title: string;
  description: string;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  tooltipContent?: React.ReactNode;
}) => {
  const actorColor = {
    'Pembeli': 'bg-sky-100 border-sky-300 text-sky-800',
    'Bot': 'bg-slate-100 border-slate-300 text-slate-800',
    'Sistem': 'bg-slate-100 border-slate-300 text-slate-800',
    'Owner': 'bg-amber-100 border-amber-300 text-amber-800',
    'Desainer': 'bg-indigo-100 border-indigo-300 text-indigo-800',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`flex flex-col items-center justify-center p-2 rounded-full border-2 ${actorColor[actor]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-bold text-lg">{title}</p>
          {badgeText && (
             <Popover>
              <PopoverTrigger asChild>
                <Badge variant={badgeVariant} className="cursor-pointer">{badgeText}</Badge>
              </PopoverTrigger>
              {tooltipContent && <PopoverContent side="bottom" align="start" className="w-auto max-w-md text-base leading-relaxed">{tooltipContent}</PopoverContent>}
            </Popover>
          )}
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const FlowArrow = () => (
  <div className="flex justify-start items-center h-12 ml-4">
    <ArrowDown className="h-6 w-6 text-muted-foreground/30" />
  </div>
);

export default function SystemFlowsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Peta Alur Kerja Sistem</h1>
        <p className="text-muted-foreground">Acuan strategis untuk alur pesanan di website dan interaksi bot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Kolom 1: Alur Website */}
        <Card>
          <CardHeader>
            <CardTitle>Alur Pesanan Website</CardTitle>
            <CardDescription>Dari kunjungan awal hingga checkout selesai.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FlowStep 
              actor="Pembeli" 
              title="Kunjungi &amp; Pilih Tier" 
              description="Pengguna membuka website dan memilih salah satu dari tiga tier budget (Kaki Lima, UMKM, E-Commerce)."
              icon={<Home className="h-6 w-6"/>}
            />
            <FlowArrow />
            <FlowStep 
              actor="Pembeli" 
              title="Pilih Produk &amp; Isi Brief" 
              description="Pengguna memilih produk, lalu mengisi brief desain di dalam dialog modal yang muncul."
              icon={<ShoppingCart className="h-6 w-6"/>}
            />
            <FlowArrow />
            <FlowStep 
              actor="Sistem" 
              title="Validasi Brief oleh AI" 
              description="Sistem AI secara otomatis memeriksa apakah brief sesuai dengan tier budget yang dipilih sebelum masuk keranjang."
              badgeText="AI-Powered"
              badgeVariant="default"
              icon={<Bot className="h-6 w-6"/>}
              tooltipContent={
                 <PopoverMessage from="Bot">
                    <p>"Brief Anda menyebutkan 'gaya minimalis', yang termasuk eksplorasi konsep. Untuk melanjutkan dengan tier Kaki Lima, mohon sederhanakan brief Anda."</p>
                 </PopoverMessage>
              }
            />
            <FlowArrow />
            <FlowStep 
              actor="Pembeli" 
              title="Checkout &amp; Isi Data" 
              description="Pengguna mengisi nama, kontak, dan dapat menerapkan kupon diskon di halaman checkout."
              icon={<CreditCard className="h-6 w-6"/>}
            />
             <FlowArrow />
            <FlowStep 
              actor="Pembeli" 
              title="Selesaikan &amp; Konfirmasi" 
              description="Pesanan dibuat, dan pengguna melihat halaman sukses dengan instruksi untuk melakukan pembayaran dan konfirmasi di Telegram."
              icon={<Send className="h-6 w-6"/>}
            />
          </CardContent>
        </Card>
        
        {/* Kolom 2: Alur Bot Telegram */}
        <Card className="lg:sticky top-24">
          <CardHeader>
            <CardTitle>Alur Lengkap Bot Telegram</CardTitle>
            <CardDescription>Dari konfirmasi awal hingga pesanan selesai, termasuk skenario revisi dan pembatalan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FlowStep 
              actor="Pembeli" 
              title="Mulai Konfirmasi" 
              description="Mengirim perintah /start [kode-order] atau tombol dari website ke bot."
              icon={<UserIcon className="h-6 w-6"/>}
            />
            <FlowArrow />
            <FlowStep 
              actor="Bot" 
              title="Verifikasi &amp; Balas" 
              description="Menyapa pembeli, menampilkan ringkasan pesanan, dan memberikan instruksi pembayaran."
              badgeText="Status: Menunggu Pembayaran"
              badgeVariant="outline"
              icon={<Bot className="h-6 w-6"/>}
               tooltipContent={
                <PopoverMessage from="Bot">
                    <p>*Pesanan Diterima: ORD-12345* Terima kasih, Kak! Berikut rincian pesanan Anda: ... Silakan lakukan pembayaran ke BCA: 123456789 a.n. Urgent Studio dan kirim bukti transfer ke sini.</p>
                </PopoverMessage>
              }
            />
            <FlowArrow />
            <FlowStep 
              actor="Pembeli" 
              title="Kirim Bukti Transfer" 
              description="Mengirim screenshot atau foto bukti pembayaran ke bot."
              icon={<FileImage className="h-6 w-6"/>}
            />
            <FlowArrow />
            <FlowStep 
              actor="Bot" 
              title="Notifikasi Owner" 
              description="Meneruskan bukti transfer ke Owner dengan tombol 'Konfirmasi' dan 'Tolak'."
              badgeText="Status: Menunggu Konfirmasi"
              badgeVariant="outline"
              icon={<Bot className="h-6 w-6"/>}
            />
            <FlowArrow />
             <FlowStep 
              actor="Owner" 
              title="Verifikasi Manual" 
              description="Owner memeriksa pembayaran dan menekan salah satu tombol yang diberikan bot."
              icon={<Shield className="h-6 w-6"/>}
            />
            <FlowArrow />
             
            <div className="p-4 border-l-4 border-slate-500 bg-slate-500/10 rounded-r-lg">
                <p className="font-bold text-center text-slate-700 mb-4">-- PERCABANGAN SETELAH VERIFIKASI --</p>
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/30">
                      <FlowStep 
                        actor="Bot" 
                        title="Pembayaran Dikonfirmasi" 
                        description="Memberi tahu pembeli bahwa pembayaran sukses dan pesanan masuk antrian."
                        badgeText="Status: Menunggu Antrian"
                        badgeVariant="default"
                        icon={<Check className="h-6 w-6"/>}
                      />
                    </div>
                     <div className="p-4 border rounded-lg bg-red-500/10 border-red-500/30">
                      <FlowStep 
                        actor="Bot" 
                        title="Pembayaran Ditolak" 
                        description="Memberi tahu pembeli bahwa ada masalah dan memintanya mengirim ulang bukti."
                        badgeText="Status: Menunggu Pembayaran"
                        badgeVariant="destructive"
                        icon={<X className="h-6 w-6"/>}
                      />
                    </div>
                </div>
            </div>

            <FlowArrow />
            <FlowStep 
              actor="Desainer"
              title="1. Proses Desain"
              description="Desainer mengerjakan brief, lalu mengubah status di panel menjadi 'Menunggu Pengiriman Draf'."
              icon={<Milestone className="h-6 w-6"/>}
              badgeText="Status: Dalam Pengerjaan"
              badgeVariant="outline"
            />
             <FlowArrow />
            <FlowStep 
              actor="Desainer"
              title="2. Kirim Hasil via Panel"
              description="Desainer memasukkan file_id gambar dan menekan tombol 'Kirim ke Klien' di panel admin."
              icon={<SendToBack className="h-6 w-6"/>}
              badgeText="Status: Menunggu Pengiriman Draf"
              badgeVariant="outline"
            />

            <FlowArrow />
            <FlowStep 
              actor="Bot"
              title="Kirim Draf ke Pelanggan"
              description="Bot secara otomatis mengirimkan pratinjau desain ke pelanggan dengan tombol interaktif."
              badgeText="Status: Menunggu Respon Klien - R1"
              badgeVariant="outline"
              icon={<Bot className="h-6 w-6"/>}
              tooltipContent={
                 <PopoverMessage from="Bot">
                    <p>(Mengirim gambar) Halo Kak, ini draf pertama untuk desain Anda. Silakan diperiksa ya.</p>
                    <div className='flex gap-2 mt-2 flex-wrap'>
                        <Button size="sm" className="pointer-events-none">[✅ Setuju & Selesai]</Button>
                        <Button size="sm" variant="outline" className="pointer-events-none">[✍️ Minta Revisi]</Button>
                        <Button size="sm" variant="destructive" className="pointer-events-none">[❌ Batalkan Pesanan]</Button>
                    </div>
                 </PopoverMessage>
              }
            />
            <FlowArrow />

             <div className="p-4 border-l-4 border-slate-500 bg-slate-500/10 rounded-r-lg">
                <p className="font-bold text-center text-slate-700 mb-4">-- PERCABANGAN RESPON PELANGGAN --</p>
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/30">
                      <FlowStep 
                        actor="Bot" 
                        title="Skenario: Disetujui" 
                        description="Pelanggan menyetujui hasil. Pesanan selesai dan bot mengirimkan file final."
                        badgeText="Status: Selesai"
                        badgeVariant="default"
                        icon={<Check className="h-6 w-6"/>}
                      />
                    </div>
                    <div className="p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
                      <FlowStep 
                        actor="Bot" 
                        title="Skenario: Minta Revisi (Logika Anti Lingkaran Setan)" 
                        description="Bot tidak meminta teks, tapi memandu klien untuk memilih ACC/Revisi untuk setiap item."
                        badgeText="Status: Revisi 1 -> Revisi 2"
                        badgeVariant="destructive"
                        icon={<Pencil className="h-6 w-6"/>}
                        tooltipContent={
                          <div className="space-y-4">
                              <PopoverMessage from="Pembeli"><p>(Mengklik tombol [✍️ Minta Revisi])</p></PopoverMessage>
                              
                              <PopoverMessage from="Bot" isBotMessage>
                                 <p className="font-bold">Baik. Mari kita ulas setiap item satu per satu.</p>
                                 <p>Anda harus memilih <strong className="uppercase">ACC</strong> atau <strong className="uppercase">Revisi</strong> untuk setiap item. Item yang di-ACC tidak bisa direvisi lagi di putaran selanjutnya.</p>
                              </PopoverMessage>
                              
                              <Separator/>
                          
                              <PopoverMessage from="Bot" isBotMessage>
                                 <p>Item 1: <span className="font-semibold">*Logo Perusahaan*</span>. Apa yang ingin Anda lakukan?</p>
                                 <div className="flex gap-2"><Button size="sm" className="pointer-events-none">[✅ ACC Logo]</Button><Button variant="outline" size="sm" className="pointer-events-none">[✍️ Revisi Logo]</Button></div>
                              </PopoverMessage>
                              
                              <PopoverMessage from="Pembeli"><p>(Mengklik tombol [✅ ACC Logo])</p></PopoverMessage>
                          
                              <Separator/>
                              
                              <PopoverMessage from="Bot" isBotMessage>
                                 <p>Item 2: <span className="font-semibold">*Spanduk Promo*</span>. Apa yang ingin Anda lakukan?</p>
                                 <div className="flex gap-2"><Button size="sm" className="pointer-events-none">[✅ ACC Spanduk]</Button><Button variant="outline" size="sm" className="pointer-events-none">[✍️ Revisi Spanduk]</Button></div>
                              </PopoverMessage>
                              
                              <PopoverMessage from="Pembeli"><p>(Mengklik tombol [✍️ Revisi Spanduk])</p></PopoverMessage>
                          
                              <Separator/>
                          
                              <PopoverMessage from="Bot" isBotMessage>
                                 <p>Item 3: <span className="font-semibold">*Kartu Nama*</span>. Apa yang ingin Anda lakukan?</p>
                                 <div className="flex gap-2"><Button size="sm" className="pointer-events-none">[✅ ACC Kartu Nama]</Button><Button variant="outline" size="sm" className="pointer-events-none">[✍️ Revisi Kartu Nama]</Button></div>
                              </PopoverMessage>
                              
                              <PopoverMessage from="Pembeli"><p>(Mengklik tombol [✅ ACC Kartu Nama])</p></PopoverMessage>
                          
                              <Separator className="border-primary my-4 border-2" />
                              
                              <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
                                  <PopoverMessage from="Bot" isBotMessage>
                                        <p className="font-bold text-lg text-primary">Konfirmasi Pilihan Anda</p>
                                        <p>Baik, sebelum kita lanjut. Mari kita pastikan pilihan Anda sudah benar:</p>
                                        <div className="space-y-2 mt-2">
                                          <p className="font-semibold text-amber-700">✍️ Akan Direvisi:</p>
                                          <ul className="list-disc pl-6 text-sm">
                                              <li>Spanduk Promo</li>
                                          </ul>
                                          <p className="font-semibold text-green-700">✅ Telah Disetujui (Final):</p>
                                          <ul className="list-disc pl-6 text-sm">
                                              <li>Logo Perusahaan</li>
                                              <li>Kartu Nama</li>
                                          </ul>
                                        </div>
                                        <p className="mt-3 font-semibold">Apakah daftar ini sudah benar? Anda tidak bisa mengubah item yang sudah di-ACC.</p>
                                        <div className="flex gap-2 mt-2"><Button size="sm" className="pointer-events-none">[✅ Ya, Benar & Lanjutkan]</Button><Button variant="destructive" size="sm" className="pointer-events-none">[❌ Ulangi Pilihan]</Button></div>
                                  </PopoverMessage>
                              </div>

                              {/* --- START: Percabangan Setelah Konfirmasi --- */}
                              <div className="mt-4 p-3 border-l-4 border-green-500 bg-green-500/10 rounded-r-lg space-y-4">
                                <p className="font-bold text-center text-green-700">Jalur 1: Pilihan Benar & Lanjutkan</p>
                                <PopoverMessage from="Pembeli"><p>(Mengklik tombol <Button size="sm" className="h-auto p-1 pointer-events-none">[✅ Ya, Benar & Lanjutkan]</Button>)</p></PopoverMessage>
                                <Separator/>
                                <PopoverMessage from="Bot">
                                   <p className="font-bold text-lg text-destructive">❗️ *PERHATIAN, INI PENTING* ❗️</p>
                                   <p className="font-semibold">Jatah revisi Anda berlaku per <span className="uppercase">putaran</span>, bukan per item.</p>
                                   <p>Harap tuliskan <strong className="uppercase">semua poin revisi</strong> untuk item yang telah Anda tandai dalam <strong className="uppercase">satu pesan sekaligus</strong>.</p>
                                   <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                                     <p className="font-bold text-destructive">PENTING:</p>
                                     <p>Item yang tidak Anda sebutkan dalam pesan revisi ini akan <strong className="uppercase">otomatis kami anggap disetujui (ACC)</strong> dan <strong className="uppercase">tidak dapat direvisi lagi</strong> di putaran berikutnya.</p>
                                   </div>
                                </PopoverMessage>
                              </div>
                              
                              <div className="mt-4 p-3 border-l-4 border-red-500 bg-red-500/10 rounded-r-lg space-y-4">
                                <p className="font-bold text-center text-red-700">Jalur 2: Ulangi Pilihan</p>
                                  <PopoverMessage from="Pembeli">
                                    <p>(Mengklik tombol <Button variant="destructive" size="sm" className="h-auto p-1 pointer-events-none">[❌ Ulangi Pilihan]</Button>)</p>
                                  </PopoverMessage>
                                  <Separator/>
                                  <PopoverMessage from="Bot" isBotMessage>
                                      <p>Baik, mari kita ulangi pemilihan dari awal.</p>
                                      <p>Item 1: <span className="font-semibold">*Logo Perusahaan*</span>. Apa yang ingin Anda lakukan?</p>
                                      <div className="flex gap-2"><Button size="sm" className="pointer-events-none">[✅ ACC Logo]</Button><Button variant="outline" size="sm" className="pointer-events-none">[✍️ Revisi Logo]</Button></div>
                                  </PopoverMessage>
                              </div>
                              {/* --- END: Percabangan Setelah Konfirmasi --- */}
                          </div>
                        }
                      />
                    </div>
                     <div className="p-4 border rounded-lg bg-indigo-500/10 border-indigo-500/30">
                      <FlowStep 
                        actor="Bot" 
                        title="Skenario: Batas Revisi & Jadwal G-Meet" 
                        description="Setelah 2x revisi, bot menyerahkan ke admin untuk penjadwalan G-Meet secara manual."
                        badgeText="Status: G-Meet Terjadwal"
                        badgeVariant="default"
                        icon={<Calendar className="h-6 w-6"/>}
                        tooltipContent={
                           <div className="space-y-4">
                               <PopoverMessage from="Bot"><p>Batas revisi via teks telah habis. Admin kami akan segera menghubungi Anda secara pribadi di chat ini untuk mengatur jadwal sesi revisi via Google Meet. Mohon ditunggu.</p></PopoverMessage>
                               <Separator/>
                               <PopoverMessage from="Owner">
                                   <p className="font-bold">Notifikasi untuk Owner:</p>
                                   <p>❗️ *Perlu Penjadwalan G-Meet*</p>
                                   <p>Pesanan *ORD-12345* (Customer Name) telah mencapai batas revisi. Harap segera hubungi pelanggan untuk mengatur jadwal G-Meet.</p>
                               </PopoverMessage>
                           </div>
                        }
                      />
                    </div>
                    {/* ALUR PEMBATALAN */}
                    <div className="p-4 border-l-4 border-red-500 bg-red-500/10 rounded-r-lg space-y-6">
                        <p className="font-semibold text-center text-red-800 flex items-center justify-center gap-2"><Ban className="h-5 w-5"/> ALUR PEMBATALAN & REFUND</p>
                        
                        <div className="space-y-4">
                            <h4 className="font-bold text-center text-sm uppercase tracking-wider text-red-700/80">SEBELUM Desain Dikirim</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FlowStep 
                                  actor="Bot" 
                                  title="Kasus: Pembayaran LUNAS" 
                                  description="Potongan 10% biaya administrasi dari total tagihan."
                                  badgeText="Status: Dibatalkan (Refund Pra-Lunas)"
                                  badgeVariant="destructive"
                                  icon={<MessageSquare className="h-6 w-6"/>}
                                  tooltipContent={
                                  <PopoverMessage from="Bot">
                                      <p>Kami telah menerima permintaan pembatalan Anda. Sesuai kebijakan, pembatalan pra-desain dikenakan *biaya administrasi 10%* dari total tagihan. Admin akan menghubungi Anda untuk proses refund sebesar *Rp90.000* (Contoh order Rp100rb).</p>
                                  </PopoverMessage>
                                  }
                              />
                               <FlowStep 
                                  actor="Bot" 
                                  title="Kasus: Pembayaran DP 50%" 
                                  description="Potongan 10% biaya administrasi dari total tagihan."
                                  badgeText="Status: Dibatalkan (Refund Pra-DP)"
                                  badgeVariant="destructive"
                                  icon={<MessageSquare className="h-6 w-6"/>}
                                  tooltipContent={
                                  <PopoverMessage from="Bot">
                                      <p>Kami telah menerima permintaan pembatalan Anda. Sesuai kebijakan, pembatalan pra-desain dikenakan *biaya administrasi 10% dari total tagihan*. Admin akan menghubungi Anda untuk proses refund sebesar *Rp40.000* dari DP Anda (Contoh order Rp100rb, DP Rp50rb).</p>
                                  </PopoverMessage>
                                  }
                              />
                            </div>
                        </div>

                        <Separator className="bg-red-500/20" />
                        
                        <div className="space-y-4">
                            <h4 className="font-bold text-center text-sm uppercase tracking-wider text-red-700/80">SETELAH Desain Dikirim</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FlowStep 
                                  actor="Bot" 
                                  title="Kasus: Pembayaran LUNAS" 
                                  description="Potongan 50% biaya pengerjaan dari total tagihan."
                                  badgeText="Status: Dibatalkan (Refund Pasca-Lunas)"
                                  badgeVariant="destructive"
                                  icon={<MessageSquare className="h-6 w-6"/>}
                                  tooltipContent={
                                  <PopoverMessage from="Bot">
                                      <p>Permintaan pembatalan diterima. Karena desain telah dikirim, dikenakan *potongan biaya pengerjaan 50%* dari total tagihan. Admin akan menghubungi Anda untuk proses refund sebesar *Rp50.000* (Contoh order Rp100rb).</p>
                                  </PopoverMessage>
                                  }
                              />
                                  <FlowStep 
                                  actor="Bot" 
                                  title="Kasus: Pembayaran DP 50%" 
                                  description="Potongan 50% biaya pengerjaan dari DP yang dibayarkan."
                                  badgeText="Status: Dibatalkan (Refund Pasca-DP)"
                                  badgeVariant="destructive"
                                  icon={<MessageSquare className="h-6 w-6"/>}
                                  tooltipContent={
                                  <PopoverMessage from="Bot">
                                      <p>Permintaan pembatalan diterima. Karena desain telah dikirim, dikenakan *potongan biaya pengerjaan 50% dari DP yang Anda bayar*. DP Anda sebagian hangus. Admin akan menghubungi Anda untuk proses refund sebesar *Rp25.000* (Contoh order Rp100rb, DP Rp50rb).</p>
                                  </PopoverMessage>
                                  }
                              />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
             <FlowArrow />
             <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-lg">
                <p className="font-bold text-center text-yellow-700 mb-4 flex items-center justify-center gap-2"><AlertTriangle/> PENANGANAN CELAH & KASUS KHUSUS</p>
                <div className="space-y-4">
                    <FlowStep 
                        actor="Bot" 
                        title="Menolak Input Teks Acak (Penjaga Alur)" 
                        description="Jika klien mengetik teks saat bot sedang menunggu pilihan tombol (ACC/Revisi), bot akan menolak input dan mengarahkan kembali ke tombol."
                        icon={<Shield className="h-6 w-6"/>}
                        tooltipContent={
                            <div className="space-y-2">
                                <PopoverMessage from="Bot"><p>Item 1: *Logo Perusahaan*. Apa yang ingin Anda lakukan? [✅ ACC] [✍️ Revisi]</p></PopoverMessage>
                                <PopoverMessage from="Pembeli"><p>warnanya ganti biru dong</p></PopoverMessage>
                                <PopoverMessage from="Bot"><p>Untuk melanjutkan, mohon gunakan tombol pilihan (ACC/Revisi) yang telah kami kirimkan di atas ya.</p></PopoverMessage>
                            </div>
                        }
                      />
                    <FlowStep 
                        actor="Bot" 
                        title="Jalan Buntu G-Meet" 
                        description="Setelah klien memilih jadwal G-Meet, status berubah menjadi 'G-Meet Terjadwal' & notifikasi terkirim ke desainer & owner."
                        badgeText="Status: G-Meet Terjadwal"
                        badgeVariant="default"
                        icon={<Calendar className="h-6 w-6"/>}
                      />
                    <FlowStep 
                        actor="Bot" 
                        title="Menolak Revisi via Teks (Penjaga Alur)" 
                        description="Jika klien mengirim pesan teks saat status 'G-Meet Terjadwal', bot akan menolaknya dan mengarahkan kembali ke pemilihan jadwal."
                        icon={<Bot className="h-6 w-6"/>}
                        tooltipContent={
                            <div className="space-y-2">
                                <PopoverMessage from="Pembeli"><p>Tolong revisi lagi dong, warnanya kurang pas.</p></PopoverMessage>
                                <PopoverMessage from="Bot"><p>Mohon maaf, jatah revisi melalui teks sudah habis. Admin kami akan menghubungi Anda untuk penjadwalan. Mohon ditunggu ya.</p></PopoverMessage>
                           </div>
                        }
                      />
                </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
