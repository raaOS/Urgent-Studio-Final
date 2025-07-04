
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface BotInfo {
  username: string;
  firstName: string;
  id: number;
}

export default function TelegramBotStatus() {
  const [botInfo, setBotInfo] = React.useState<BotInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchBotInfo() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/bot-info');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengambil informasi bot.');
        }
        setBotInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBotInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-4 text-destructive p-4 rounded-md border border-destructive bg-destructive/10">
        <AlertCircle className="h-8 w-8" />
        <div>
            <p className="font-semibold">Koneksi Gagal</p>
            <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (botInfo) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-md border border-green-500 bg-green-500/10">
        <Avatar className="h-12 w-12">
            {/* Telegram doesn't provide profile pics via API, so we use a fallback */}
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {botInfo.firstName.charAt(0)}
            </AvatarFallback>
        </Avatar>
        <div>
            <p className="font-bold text-lg">{botInfo.firstName}</p>
            <p className="text-muted-foreground">@{botInfo.username}</p>
        </div>
        <Badge className="ml-auto bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4 mr-1.5"/>
            Terhubung
        </Badge>
      </div>
    );
  }

  return null;
}
