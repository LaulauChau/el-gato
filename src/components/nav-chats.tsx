"use client";

import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { deleteChat } from "@/lib/actions";
import type { Chat } from "@/lib/db/schemas";

export function NavChats({ chats }: { chats: Chat[] }) {
  const { isMobile } = useSidebar();

  if (chats.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {chats.map((chat) => (
          <SidebarMenuItem key={chat.id}>
            <SidebarMenuButton
              render={
                <Link href={`/chat/${chat.id}`}>
                  <span>{chat.title}</span>
                </Link>
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction showOnHover>
                    <IconDotsVertical />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                }
              />
              <DropdownMenuContent
                className="w-48"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => void deleteChat({ id: chat.id })}>
                  <IconTrash className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
