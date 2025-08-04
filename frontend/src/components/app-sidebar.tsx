"use client";

import {
  ChevronUp,
  Frame,
  LogOut,
  Settings,
  HelpCircle,
  User2,
  Folder,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Main navigation items
const navigationItems = [
  {
    title: "Trang chủ",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Quản lý dự án",
    url: "/projects",
    icon: Folder,
  },
];

const adminNavigationItems = [
  {
    title: "Quản lý tài khoản",
    url: "/admin/users",
    icon: User2,
  },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const menuItems = user?.is_superuser
    ? [...navigationItems, ...adminNavigationItems]
    : navigationItems;

  return (
    <TooltipProvider>
      <Sidebar variant="inset" collapsible="icon" className="border-r-0">
        <SidebarHeader className="border-b border-gray-100 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                className="hover:bg-transparent"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/" className="flex items-center gap-3">
                      <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gray-900 text-white">
                        <Frame className="size-5" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-gray-900">
                          Labelling Tool
                        </span>
                        <span className="truncate text-xs text-gray-600">
                          Tool dùng để tạo dữ liệu cho dự án
                        </span>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {!open && !isMobile && (
                    <TooltipContent side="right" align="center">
                      <p>Labelling Tool - Tool dùng để tạo dữ liệu cho dự án</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className={cn("py-6", open ? "px-4" : "px-2")}>
          {/* Main Navigation */}
          <SidebarGroup className="space-y-2">
            {open && (
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                CHỨC NĂNG CHÍNH
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url === "/reports" &&
                      pathname?.startsWith("/reports"));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-200 hover:bg-blue-50",
                              open
                                ? "h-12 rounded-xl"
                                : "h-10 w-10 rounded-lg justify-center",
                              isActive
                                ? "bg-blue-100 text-blue-700 font-medium shadow-sm border border-blue-200"
                                : "text-gray-700 hover:text-gray-900",
                            )}
                          >
                            <Link
                              href={item.url}
                              className={cn(
                                "flex items-center",
                                open ? "gap-3 px-3" : "justify-center",
                              )}
                            >
                              <item.icon
                                size={open ? 20 : 18}
                                className={cn(
                                  isActive
                                    ? "text-blue-600"
                                    : item.title === "Trợ lý AI"
                                      ? "text-blue-500"
                                      : item.title === "Quản lý Email"
                                        ? "text-green-500"
                                        : item.title === "Báo cáo"
                                          ? "text-green-500"
                                          : item.title === "Tài hóa đơn"
                                            ? "text-purple-500"
                                            : item.title === "Quy trình"
                                              ? "text-orange-500"
                                              : item.title ===
                                                  "Quản lý tài liệu"
                                                ? "text-blue-900"
                                                : item.title ===
                                                    "Quản lý hóa đơn"
                                                  ? "text-red-500"
                                                  : "text-gray-500",
                                )}
                              />
                              {open && (
                                <span className="font-medium">
                                  {item.title}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {!open && !isMobile && (
                          <TooltipContent side="right" align="center">
                            <p>{item.title}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tax Notifications Section - Only show when open
                    {open && (
                        <SidebarGroup className="mt-8">
                            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                                THÔNG BÁO THUẾ
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <Bell
                                                            size={16}
                                                            className="text-orange-600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-orange-900 mb-1">
                                                        Sắp đến hạn
                                                    </div>
                                                    <div className="text-sm text-gray-700 mb-2">
                                                        Nộp thuế VAT tháng 12
                                                    </div>
                                                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-xs font-medium text-orange-800">
                                                        Còn 3 ngày
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )} */}
        </SidebarContent>

        <SidebarFooter
          className={cn(
            "border-t border-gray-100 pt-4",
            open ? "px-4" : "px-2",
          )}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size={open ? "lg" : "default"}
                        className={cn(
                          "data-[state=open]:bg-gray-50 data-[state=open]:text-gray-900 hover:bg-gray-50",
                          open
                            ? "h-14 rounded-xl"
                            : "h-10 w-10 rounded-lg justify-center",
                        )}
                      >
                        {open ? (
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={user?.avatar_url || ""}
                                alt={user?.full_name || user?.email || "User"}
                                referrerPolicy="no-referrer"
                              />
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-medium text-gray-900">
                                {user?.full_name || user?.email || "User"}
                              </span>
                              <span className="truncate text-xs text-gray-500">
                                {user?.email || "No email"}
                              </span>
                            </div>
                            <ChevronUp className="ml-auto h-4 w-4 text-gray-400" />
                          </div>
                        ) : (
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={user?.avatar_url || ""}
                              alt={user?.full_name || user?.email || "User"}
                              referrerPolicy="no-referrer"
                            />
                          </Avatar>
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {!open && !isMobile && (
                    <TooltipContent side="right" align="center">
                      <p>{user?.full_name || user?.email || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "No email"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support" className="flex items-center">
                      <HelpCircle />
                      Hỗ trợ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
