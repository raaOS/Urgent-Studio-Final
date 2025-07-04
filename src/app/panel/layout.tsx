'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarNav } from '@/components/panel/sidebar-nav';
import { MobileBottomNav } from '@/components/panel/mobile-bottom-nav';
import type { User } from '@/lib/types';
import { getUsers } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchOwner() {
      setIsLoading(true);
      try {
        const allUsers = await getUsers();
        // The panel will display the 'Owner' user by default.
        const owner = allUsers.find(u => u.role === 'Owner');
        if (owner) {
          setUser(owner);
        } else if (allUsers && allUsers.length > 0) {
          setUser(allUsers[0]);
        }
      } catch (error) {
        console.error('Failed to load user for layout', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOwner();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold font-headline text-sidebar-foreground group-data-[state=collapsed]:hidden">Urgent Studio</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-0">
             <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            {isLoading ? (
              <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5 group-data-[state=collapsed]:hidden">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start w-full p-2 h-auto">
                      <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar"/>
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-left group-data-[state=collapsed]:hidden">
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                      </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/panel/settings/account">Pengaturan Akun</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1">
              {/* Mungkin tambahkan breadcrumbs di sini nanti */}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-muted/40 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
