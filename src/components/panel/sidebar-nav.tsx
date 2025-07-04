'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { menuConfig } from '@/lib/menu-config';
import type { MenuItem, MenuGroup } from '@/lib/menu-config';

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="w-full p-2">
      {menuConfig.map((item, index) => (
        <SidebarMenuItem key={index}>
          {'items' in item ? (
            // It's a MenuGroup
            <>
              <SidebarMenuButton
                isActive={item.items.some(sub => pathname.startsWith(sub.href))}
                className="font-semibold text-muted-foreground hover:text-foreground"
              >
                <item.groupIcon className="h-5 w-5" />
                <span className="group-data-[state=collapsed]:hidden">{item.groupLabel}</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.items.map((subItem, subIndex) => (
                  <SidebarMenuSubItem key={subIndex}>
                    <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                      <Link href={subItem.href}>
                        <span className="truncate">{subItem.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </>
          ) : (
            // It's a single MenuItem
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className="font-semibold"
            >
              <Link href={item.href || '#'}>
                <item.icon className="h-5 w-5" />
                <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
