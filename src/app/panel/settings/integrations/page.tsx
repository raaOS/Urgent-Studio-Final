import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe, Bot, ArrowRight } from "lucide-react";

const IntegrationLinkCard = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
    <Card className="hover:border-primary/50 hover:shadow-md transition-all">
        <CardHeader>
             <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-primary">{icon}</div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                </div>
                <Button asChild variant="outline" size="icon">
                    <Link href={href}>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </CardHeader>
    </Card>
);

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
       <div>
        <h1 className="text-3xl font-bold font-headline">Integrasi</h1>
        <p className="text-muted-foreground">Hubungkan layanan eksternal untuk mengotomatiskan alur kerja Anda.</p>
      </div>
      
      <div className="space-y-6">
        <IntegrationLinkCard
            icon={<Globe size={32} />}
            title="Layanan Google"
            description="Hubungkan Google Drive, Meet, Sheet, dan Calendar."
            href="/panel/settings/integrations/google"
        />
         <IntegrationLinkCard
            icon={<Bot size={32} />}
            title="Telegram Bot"
            description="Kelola notifikasi otomatis dan interaksi dengan klien."
            href="/panel/settings/integrations/telegram"
        />
      </div>
    </div>
  );
}
