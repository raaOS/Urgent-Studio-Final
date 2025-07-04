import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Folder, Video, Sheet, Calendar, CheckCircle2 } from "lucide-react";

const IntegrationCard = ({ icon, title, description, connected }: { icon: React.ReactNode, title: string, description: string, connected: boolean }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="text-primary">{icon}</div>
                <div>
                    <CardTitle className="flex items-center gap-2">{title} 
                        {connected ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Terhubung
                            </Badge>
                        ) : (
                            <Badge variant="destructive">Terputus</Badge>
                        )}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {connected ? (
                <div className="flex gap-2">
                     <Button variant="outline">Pengaturan</Button>
                     <Button variant="destructive">Putuskan</Button>
                </div>
            ) : (
                 <Button>Hubungkan Akun</Button>
            )}
        </CardContent>
    </Card>
);


export default function GoogleIntegrationPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Integrasi Google</h1>
        <p className="text-muted-foreground">Hubungkan layanan Google Anda untuk mengotomatiskan alur kerja.</p>
      </div>
      
      <Tabs defaultValue="drive">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="drive"><Folder className="mr-2 h-4 w-4"/>Drive</TabsTrigger>
          <TabsTrigger value="meet"><Video className="mr-2 h-4 w-4"/>Meet</TabsTrigger>
          <TabsTrigger value="sheet"><Sheet className="mr-2 h-4 w-4"/>Sheet</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="mr-2 h-4 w-4"/>Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="drive" className="mt-4">
            <IntegrationCard
                icon={<Folder size={32} />}
                title="Google Drive"
                description="Buat dan bagikan folder proyek secara otomatis dengan klien."
                connected={true}
            />
        </TabsContent>
        <TabsContent value="meet" className="mt-4">
            <IntegrationCard
                icon={<Video size={32} />}
                title="Google Meet"
                description="Jadwalkan panggilan video untuk revisi dan pertemuan dengan klien."
                connected={false}
            />
        </TabsContent>
        <TabsContent value="sheet" className="mt-4">
             <IntegrationCard
                icon={<Sheet size={32} />}
                title="Google Sheets"
                description="Ekspor data pesanan dan laporan keuangan secara otomatis."
                connected={true}
            />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
             <IntegrationCard
                icon={<Calendar size={32} />}
                title="Google Calendar"
                description="Blokir jadwal desainer untuk proyek baru dan pertemuan."
                connected={true}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
