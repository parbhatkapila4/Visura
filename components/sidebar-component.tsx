"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import {
  Search as SearchIcon,
  Dashboard,
  DocumentAdd,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronDown as ChevronDownIcon,
  AddLarge,
  View,
  Report,
  Folder,
  FolderOpen,
  CloudUpload,
  Security,
  Notification,
  Integration,
  Chat,
  Analytics,
} from "@carbon/icons-react";
import { LogOut } from "lucide-react";
import { clearLogoutLoaderPending, dispatchLogoutLoaderStart } from "@/lib/logout-loader-events";
const svgPaths = {
  p10dcabc0: "M8 11L3 6.00001L3.7 5.30001L8 9.60001L12.3 5.30001L13 6.00001L8 11Z",
  p13593580:
    "M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z",
  p154b5b00:
    "M14.5 13.793L10.724 10.0169C11.6313 8.92758 12.0838 7.53039 11.9872 6.11596C11.8907 4.70154 11.2525 3.37879 10.2055 2.42289C9.15856 1.46699 7.78336 0.951523 6.36601 0.983731C4.94866 1.01594 3.59829 1.59334 2.59581 2.59581C1.59334 3.59829 1.01594 4.94866 0.983731 6.36601C0.951523 7.78336 1.46699 9.15856 2.42289 10.2055C3.37879 11.2525 4.70154 11.8907 6.11596 11.9872C7.53039 12.0838 8.92758 11.6313 10.0169 10.724L13.793 14.5L14.5 13.793ZM2 6.5C2 5.60999 2.26392 4.73996 2.75839 3.99994C3.25286 3.25992 3.95566 2.68314 4.77793 2.34255C5.6002 2.00195 6.505 1.91284 7.37791 2.08647C8.25082 2.2601 9.05265 2.68869 9.68198 3.31802C10.3113 3.94736 10.7399 4.74918 10.9135 5.6221C11.0872 6.49501 10.9981 7.39981 10.6575 8.22208C10.3169 9.04435 9.74009 9.74715 9.00007 10.2416C8.26005 10.7361 7.39002 11 6.5 11C5.30694 10.9987 4.16311 10.5242 3.31949 9.68052C2.47586 8.8369 2.00133 7.69307 2 6.5Z",
  p15853b70:
    "M0.528 0C0.343183 0 0.250774 0 0.180183 0.0359679C0.11809 0.0676061 0.0676061 0.11809 0.0359679 0.180183C0 0.250774 0 0.343183 0 0.528V9.097C0 9.28181 0 9.37422 0.0359678 9.44481C0.0676061 9.50691 0.11809 9.55739 0.180183 9.58903C0.250774 9.625 0.343183 9.625 0.528 9.625L4.972 9.625C5.15682 9.625 5.24923 9.625 5.31982 9.58903C5.38191 9.55739 5.43239 9.50691 5.46403 9.44481C5.5 9.37422 5.5 9.28182 5.5 9.097V6.028C5.5 5.84318 5.5 5.75077 5.53597 5.68018C5.56761 5.61809 5.61809 5.56761 5.68018 5.53597C5.75077 5.5 5.84318 5.5 6.028 5.5L26.972 5.5C27.1568 5.5 27.2492 5.5 27.3198 5.53597C27.3819 5.56761 27.4324 5.61809 27.464 5.68018C27.5 5.75077 27.5 5.84318 27.5 6.028V9.097C27.5 9.28182 27.5 9.37423 27.536 9.44482C27.5676 9.50691 27.6181 9.55739 27.6802 9.58903C27.7508 9.625 27.8432 9.625 28.028 9.625L32.472 9.625C32.6568 9.625 32.7492 9.625 32.8198 9.58903C32.8819 9.55739 32.9324 9.50691 32.964 9.44482C33 9.37423 33 9.28182 33 9.097V0.528C33 0.343183 33 0.250774 32.964 0.180183C32.9324 0.11809 32.8819 0.0676061 32.8198 0.0359679C32.7492 0 32.6568 0 32.472 0H0.528Z",
  p1a3cd600:
    "M8.778 13.75C8.59318 13.75 8.50077 13.75 8.43018 13.714C8.36809 13.6824 8.31761 13.6319 8.28597 13.5698C8.25 13.4992 8.25 13.4068 8.25 13.222V8.778C8.25 8.59318 8.25 8.50077 8.28597 8.43018C8.31761 8.36809 8.36809 8.31761 8.43018 8.28597C8.50077 8.25 8.59318 8.25 8.778 8.25L24.222 8.25C24.4068 8.25 24.4992 8.25 24.5698 8.28597C24.6319 8.31761 24.6824 8.36809 24.714 8.43018C24.75 8.50077 24.75 8.59318 24.75 8.778V13.222C24.75 13.4068 24.75 13.4992 24.714 13.5698C24.6824 13.6319 24.6319 13.6824 24.5698 13.714C24.4992 13.75 24.4068 13.75 24.222 13.75H8.778Z",
  p29bde780:
    "M4 9C4.55228 9 5 8.55228 5 8C5 7.44772 4.55228 7 4 7C3.44772 7 3 7.44772 3 8C3 8.55228 3.44772 9 4 9Z",
  p2b29ce00:
    "M13 15H12V12.5C12 12.1717 11.9353 11.8466 11.8097 11.5433C11.6841 11.24 11.4999 10.9644 11.2678 10.7322C11.0356 10.5001 10.76 10.3159 10.4567 10.1903C10.1534 10.0647 9.8283 10 9.5 10H6.5C5.83696 10 5.20107 10.2634 4.73223 10.7322C4.26339 11.2011 4 11.837 4 12.5V15H3V12.5C3 11.5717 3.36875 10.6815 4.02513 10.0251C4.6815 9.36875 5.57174 9 6.5 9H9.5C10.4283 9 11.3185 9.36875 11.9749 10.0251C12.6313 10.6815 13 11.5717 13 12.5V15Z",
  p35081d00:
    "M0.528 22C0.343183 22 0.250774 22 0.180183 21.964C0.11809 21.9324 0.0676061 21.8819 0.0359679 21.8198C0 21.7492 0 21.6568 0 21.472V12.903C0 12.7182 0 12.6258 0.0359679 12.5552C0.0676061 12.4931 0.11809 12.4426 0.180183 12.411C0.250774 12.375 0.343183 12.375 0.528 12.375H4.972C5.15682 12.375 5.24923 12.375 5.31982 12.411C5.38191 12.4426 5.43239 12.4931 5.46403 12.5552C5.5 12.6258 5.5 12.7182 5.5 12.903V15.972C5.5 16.1568 5.5 16.2492 5.53597 16.3198C5.56761 16.3819 5.61809 16.4324 5.68018 16.464C5.75077 16.5 5.84318 16.5 6.028 16.5L26.972 16.5C27.1568 16.5 27.2492 16.5 27.3198 16.464C27.3819 16.4324 27.4324 16.3819 27.464 16.3198C27.5 16.2492 27.5 16.1568 27.5 15.972V12.903C27.5 12.7182 27.5 12.6258 27.536 12.5552C27.5676 12.4931 27.6181 12.4426 27.6802 12.411C27.7508 12.375 27.8432 12.375 28.028 12.375H32.472C32.6568 12.375 32.7492 12.375 32.8198 12.411C32.8819 12.4426 32.9324 12.4931 32.964 12.5552C33 12.6258 33 12.7182 33 12.903V21.472C33 21.6568 33 21.7492 32.964 21.8198C32.9324 21.8819 32.8819 21.9324 32.8198 21.964C32.7492 22 32.6568 22 32.472 22H0.528Z",
  p3801bf80:
    "M8 2C8.49445 2 8.9778 2.14662 9.38893 2.42133C9.80005 2.69603 10.1205 3.08648 10.3097 3.54329C10.4989 4.00011 10.5484 4.50277 10.452 4.98773C10.3555 5.47268 10.1174 5.91814 9.76777 6.26777C9.41814 6.6174 8.97268 6.8555 8.48773 6.95196C8.00277 7.04843 7.50011 6.99892 7.04329 6.8097C6.58648 6.62048 6.19603 6.30005 5.92133 5.88893C5.64662 5.4778 5.5 4.99445 5.5 4.5C5.5 3.83696 5.76339 3.20107 6.23223 2.73223C6.70107 2.26339 7.33696 2 8 2ZM8 1C7.30777 1 6.63108 1.20527 6.0555 1.58986C5.47993 1.97444 5.03133 2.52107 4.76642 3.16061C4.50152 3.80015 4.4322 4.50388 4.56725 5.18282C4.7023 5.86175 5.03564 6.48539 5.52513 6.97487C6.01461 7.46436 6.63825 7.7977 7.31718 7.93275C7.99612 8.0678 8.69985 7.99849 9.33939 7.73358C9.97893 7.46867 10.5256 7.02007 10.9101 6.4445C11.2947 5.86892 11.5 5.19223 11.5 4.5C11.5 3.57174 11.1313 2.6815 10.4749 2.02513C9.8185 1.36875 8.92826 1 8 1Z",
  p3af0dbf2:
    "M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z",
  p5113400:
    "M14.252 4.06808L8.25195 0.568081C8.17548 0.523469 8.08853 0.499962 8 0.499962C7.91147 0.499962 7.82452 0.523469 7.74805 0.568081L1.74805 4.06808C1.67257 4.11212 1.60994 4.17517 1.56642 4.25095C1.5229 4.32673 1.5 4.41259 1.5 4.49998V11.5C1.5 11.5874 1.5229 11.6732 1.56642 11.749C1.60994 11.8248 1.67257 11.8878 1.74805 11.9319L7.74805 15.4319C7.82452 15.4765 7.91147 15.5 8 15.5C8.08853 15.5 8.17548 15.4765 8.25195 15.4319L14.252 11.9319C14.3274 11.8878 14.3901 11.8248 14.4336 11.749C14.4771 11.6732 14.5 11.5874 14.5 11.5V4.49998C14.5 4.41259 14.4771 4.32673 14.4336 4.25095C14.3901 4.17517 14.3274 4.11212 14.252 4.06808ZM8 1.57883L13.0078 4.49998L8 7.42113L2.9922 4.49998L8 1.57883ZM2.5 5.37058L7.5 8.28708V14.1294L2.5 11.2129В5.37058ZM8.5 14.1294V8.28708L13.5 5.37058V11.2129L8.5 14.1294Z",
  pfa0d600:
    "M6.32 10C6.20799 10 6.15198 10 6.1092 9.9782C6.07157 9.95903 6.04097 9.92843 6.0218 9.8908C6 9.84802 6 9.79201 6 9.68В6.32C6 6.20799 6 6.15198 6.0218 6.1092C6.04097 6.07157 6.07157 6.04097 6.1092 6.0218C6.15198 6 6.20799 6 6.32 6L17.68 6C17.792 6 17.848 6 17.8908 6.0218C17.9284 6.04097 17.959 6.07157 17.9782 6.1092C18 6.15198 18 6.20799 18 6.32V9.68C18 9.79201 18 9.84802 17.9782 9.8908C17.959 9.92843 17.9284 9.95903 17.8908 9.9782C17.848 10 17.792 10 17.68 10H6.32Z",
};

const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

function BrandBadge() {
  return (
    <Link
      href="/"
      prefetch={true}
      scroll={false}
      className="relative shrink-0 w-full block cursor-pointer rounded-lg py-2 transition-colors hover:bg-neutral-800/50"
    >
      <div className="flex items-center p-1 w-full gap-2">
        <img
          src="/Visura-favicon-New.png"
          alt=""
          className="size-8 shrink-0 object-contain"
          width={32}
          height={32}
        />
        <div className="px-2 py-1">
          <div className="font-['Lexend:SemiBold',_sans-serif] text-[16px] text-neutral-50">
            Visura
          </div>
        </div>
      </div>
    </Link>
  );
}

function AvatarCircle() {
  return (
    <div className="relative rounded-full shrink-0 size-8 bg-black">
      <div className="flex items-center justify-center size-8">
        <UserIcon size={16} className="text-neutral-50" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-neutral-800 pointer-events-none"
      />
    </div>
  );
}

function SearchContainer() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative shrink-0 w-full">
      <div className="bg-black h-10 relative rounded-lg flex items-center w-full">
        <div className="flex items-center justify-center shrink-0 px-1">
          <div className="size-8 flex items-center justify-center">
            <SearchIcon size={16} className="text-neutral-50" />
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="flex flex-col justify-center size-full">
            <div className="flex flex-col gap-2 items-start justify-center pr-2 py-1 w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-50 placeholder:text-neutral-400 leading-[20px]"
              />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-lg border border-neutral-800 pointer-events-none"
        />
      </div>
    </div>
  );
}

interface MenuItemT {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  hasDropdown?: boolean;
  isActive?: boolean;
  children?: MenuItemT[];
}
interface MenuSectionT {
  title: string;
  items: MenuItemT[];
}
interface SidebarContent {
  title: string;
  sections: MenuSectionT[];
}

function getSidebarContent(
  activeSection: string,
  pathname: string,
  viewParam: string | null
): SidebarContent {
  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));
  const isAnalyticsView = viewParam === "analytics";

  const dashboard = <Dashboard size={16} className="text-neutral-50" />;
  const view = <View size={16} className="text-neutral-50" />;
  const report = <Report size={16} className="text-neutral-50" />;
  const docAdd = <DocumentAdd size={16} className="text-neutral-50" />;
  const folder = <Folder size={16} className="text-neutral-50" />;
  const folderOpen = <FolderOpen size={16} className="text-neutral-50" />;
  const cloudUpload = <CloudUpload size={16} className="text-neutral-50" />;
  const userIcon = <UserIcon size={16} className="text-neutral-50" />;
  const settingsIcon = <SettingsIcon size={16} className="text-neutral-50" />;
  const integration = <Integration size={16} className="text-neutral-50" />;
  const security = <Security size={16} className="text-neutral-50" />;
  const notification = <Notification size={16} className="text-neutral-50" />;
  const chatIcon = <Chat size={16} className="text-neutral-50" />;
  const analyticsIcon = <Analytics size={16} className="text-neutral-50" />;

  const contentMap: Record<string, SidebarContent> = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Main",
          items: [
            {
              icon: view,
              label: "Overview",
              href: "/dashboard",
              isActive: isActive("/dashboard") && !isAnalyticsView,
            },
            { icon: docAdd, label: "Upload document", href: "/upload" },
            {
              icon: chatIcon,
              label: "Chat with Doc.",
              href: "/chat",
              isActive: pathname.startsWith("/chat"),
            },
            {
              icon: analyticsIcon,
              label: "Analytics Dashboard",
              href: "/dashboard?view=analytics",
              isActive: isAnalyticsView,
            },
          ],
        },
        {
          title: "Documents",
          items: [
            {
              icon: report,
              label: "All summaries",
              href: "/dashboard",
              isActive: isActive("/dashboard") && !isAnalyticsView,
            },
          ],
        },
      ],
    },
    upload: {
      title: "Upload",
      sections: [
        {
          title: "Documents",
          items: [
            {
              icon: cloudUpload,
              label: "Upload new document",
              href: "/upload",
              isActive: isActive("/upload"),
            },
            { icon: dashboard, label: "Back to dashboard", href: "/dashboard" },
          ],
        },
      ],
    },
    workspaces: {
      title: "Workspaces",
      sections: [
        {
          title: "Workspaces",
          items: [
            {
              icon: folderOpen,
              label: "My workspaces",
              href: "/workspaces",
              isActive: isActive("/workspaces"),
            },
            { icon: folder, label: "Shared with me", href: "/workspaces" },
          ],
        },
      ],
    },
    settings: {
      title: "Settings",
      sections: [
        {
          title: "Account",
          items: [
            { icon: userIcon, label: "Profile", href: "/dashboard" },
            { icon: security, label: "Security", href: "/dashboard" },
            { icon: notification, label: "Notifications", href: "/dashboard" },
          ],
        },
        {
          title: "App",
          items: [
            { icon: settingsIcon, label: "Preferences", href: "/dashboard" },
            { icon: integration, label: "Integrations", href: "/dashboard" },
          ],
        },
      ],
    },
  };

  return contentMap[activeSection] ?? contentMap.dashboard;
}

const ICON_NAV_ITEMS: { id: string; href: string; icon: React.ReactNode; label: string }[] = [
  { id: "dashboard", href: "/dashboard", icon: <Dashboard size={16} />, label: "Dashboard" },
  { id: "upload", href: "/upload", icon: <AddLarge size={16} />, label: "Upload" },
  { id: "workspaces", href: "/workspaces", icon: <FolderOpen size={16} />, label: "Workspaces" },
];

function IconNavigation({ activeSection }: { activeSection: string }) {
  const { user } = useUser();
  const userImageUrl = user?.imageUrl ?? "";

  return (
    <aside className="bg-black flex flex-col gap-2 items-center p-4 w-16 h-full border-r border-neutral-800 rounded-l-2xl shrink-0 overflow-hidden">
      <Link
        href="/"
        prefetch={true}
        scroll={false}
        className="mb-2 size-10 flex items-center justify-center rounded-full overflow-hidden border border-neutral-700 hover:bg-neutral-800 transition-colors shrink-0"
      >
        {userImageUrl ? (
          <Image
            src={userImageUrl}
            alt={user?.firstName ? `${user.firstName}'s profile` : "Profile"}
            width={40}
            height={40}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-neutral-800">
            <UserIcon size={20} className="text-neutral-50" />
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-2 w-full items-center">
        {ICON_NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            prefetch={true}
            scroll={false}
            className={`flex items-center justify-center rounded-lg size-10 min-w-10 transition-colors duration-500 ${
              activeSection === item.id
                ? "bg-neutral-800 text-neutral-50"
                : "hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300"
            }`}
            style={{ transitionTimingFunction: softSpringEasing }}
            title={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </div>

      <div className="flex-1" />
    </aside>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center h-10">
        <div className="px-2 py-1">
          <div className="font-['Lexend:SemiBold',_sans-serif] text-[18px] text-neutral-50 leading-[27px]">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSidebar({
  activeSection,
  pathname,
  viewParam,
}: {
  activeSection: string;
  pathname: string;
  viewParam: string | null;
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { signOut } = useClerk();
  const content = getSidebarContent(activeSection, pathname, viewParam);

  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      dispatchLogoutLoaderStart();
      await signOut({ redirectUrl: `${window.location.origin}/` });
    } catch {
      clearLogoutLoaderPending();
    }
  };

  return (
    <aside className="bg-black flex flex-col gap-4 items-start p-4 rounded-r-2xl h-full w-80 shrink-0 overflow-hidden">
      <BrandBadge />
      <SectionTitle title={content.title} />
      <SearchContainer />

      <div className="flex flex-col w-full flex-1 min-h-0 overflow-hidden gap-4 items-start">
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
          />
        ))}
      </div>

      <div className="w-full mt-auto pt-2 border-t border-neutral-800 shrink-0 flex flex-col items-stretch relative z-10 overflow-visible pb-1">
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full h-10 rounded-lg px-4 flex items-center gap-3 font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700/50 transition-all duration-200"
        >
          <LogOut
            size={16}
            className="shrink-0 text-neutral-500 group-hover:text-neutral-50 transition-colors"
            aria-hidden
          />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

function MenuItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: MenuItemT;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (item.hasDropdown && onToggle) {
      e.preventDefault();
      onToggle();
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-center shrink-0">{item.icon}</div>
      <div className="flex-1 relative overflow-hidden ml-3">
        <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-50 leading-[20px] truncate">
          {item.label}
        </div>
      </div>
      {item.hasDropdown && (
        <div className="flex items-center justify-center shrink-0 ml-2">
          <ChevronDownIcon
            size={16}
            className="text-neutral-50 transition-transform duration-500"
            style={{
              transitionTimingFunction: softSpringEasing,
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>
      )}
    </>
  );

  const baseClass = `rounded-lg cursor-pointer transition-all duration-500 flex items-center relative w-full h-10 px-4 py-2 ${
    item.isActive ? "bg-neutral-800" : "hover:bg-neutral-800"
  }`;

  return (
    <div className="relative shrink-0 w-full">
      {item.href && !item.hasDropdown ? (
        <Link
          href={item.href}
          scroll={false}
          prefetch={true}
          className={baseClass}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          {content}
        </Link>
      ) : (
        <div
          className={baseClass}
          style={{ transitionTimingFunction: softSpringEasing }}
          onClick={handleClick}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function SubMenuItem({ item }: { item: MenuItemT }) {
  const inner = (
    <div className="flex-1 min-w-0">
      <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-300 leading-[18px] truncate">
        {item.label}
      </div>
    </div>
  );
  return (
    <div className="w-full pl-9 pr-1 py-[1px]">
      {item.href ? (
        <Link
          href={item.href}
          scroll={false}
          prefetch={true}
          className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-neutral-800 flex items-center px-3 py-1"
        >
          {inner}
        </Link>
      ) : (
        <div className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-neutral-800 flex items-center px-3 py-1">
          {inner}
        </div>
      )}
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
}: {
  section: MenuSectionT;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
}) {
  return (
    <div className="flex flex-col w-full">
      <div className="relative shrink-0 w-full overflow-hidden h-10">
        <div className="flex items-center h-10 px-4">
          <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-400">
            {section.title}
          </div>
        </div>
      </div>

      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`;
        const isExpanded = expandedItems.has(itemKey);
        return (
          <div key={itemKey} className="w-full flex flex-col">
            <MenuItem
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
            />
            {isExpanded && item.children && (
              <div className="flex flex-col gap-1 mb-2">
                {item.children.map((child, childIndex) => (
                  <SubMenuItem key={`${itemKey}-${childIndex}`} item={child} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getActiveSectionFromPathname(pathname: string): string {
  if (!pathname) return "dashboard";
  if (pathname.startsWith("/upload")) return "upload";
  if (pathname.startsWith("/workspaces")) return "workspaces";
  if (pathname.startsWith("/account")) return "settings";
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/summaries") ||
    pathname.startsWith("/chatbot") ||
    pathname.startsWith("/chat")
  )
    return "dashboard";
  return "dashboard";
}

const SIDEBAR_PREFETCH_ROUTES = ["/", "/dashboard", "/upload", "/workspaces"];

function TwoLevelSidebar({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view");
  const activeSection = useMemo(() => getActiveSectionFromPathname(pathname), [pathname]);

  useEffect(() => {
    SIDEBAR_PREFETCH_ROUTES.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <div
      className={`sticky top-0 h-screen shrink-0 overflow-hidden ${className ?? "flex flex-row"}`}
    >
      <IconNavigation activeSection={activeSection} />
      <DetailSidebar activeSection={activeSection} pathname={pathname} viewParam={viewParam} />
    </div>
  );
}

export function Frame760() {
  return (
    <div className="bg-[#1a1a1a] min-h-screen flex items-center justify-center p-4">
      <TwoLevelSidebar />
    </div>
  );
}

export function SidebarWithContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a]">
      <TwoLevelSidebar className="flex flex-row shrink-0" />
      <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </div>
  );
}

export default Frame760;
