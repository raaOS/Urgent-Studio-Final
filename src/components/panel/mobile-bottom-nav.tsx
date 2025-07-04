'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { menuConfig } from '@/lib/menu-config';
import type { MenuItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Flatten the menu config to get a single list of all items
  const allItems: MenuItem[] = menuConfig.flatMap(groupOrItem =>
    'items' in groupOrItem ? groupOrItem.items : [groupOrItem]
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex w-full overflow-x-auto px-2">
        <nav className="flex flex-nowrap gap-1">
          {allItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 w-20 flex-shrink-0 text-center rounded-lg my-2',
                  'transition-colors duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
