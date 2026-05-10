"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

function isGroupItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navGroups: NavGroup[] = [
  {
    title: "Profile foundations",
    items: [
      {
        name: "Build your profile",
        href: "/dashboard/onboarding",
        icon: (
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Smart Goals",
        href: "/dashboard/profile/goals",
        icon: (
          <path d="M5 19 19 5M9 5h10v10" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Star Stories",
        href: "/dashboard/profile/stories",
        icon: (
          <path d="m12 3 2.5 5 5.5.8-4 3.9 1 5.5L12 15.7 7 18.2l1-5.5-4-3.9L9.5 8 12 3Z" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
    ],
  },
  {
    title: "Application engine",
    items: [
      {
        name: "Job Fit & Scanner",
        href: "/dashboard/scanner",
        icon: (
          <path d="M10.5 4H7a2 2 0 0 0-2 2v3.5m11-5.5H17a2 2 0 0 1 2 2v3.5M16 20h1a2 2 0 0 0 2-2v-3.5M8 20H7a2 2 0 0 1-2-2v-3.5M9.5 9.5a4 4 0 1 0 5 5" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Job packs",
        href: "/dashboard/job-packs",
        icon: (
          <path d="M4 8.5 12 4l8 4.5M4 8.5v7L12 20l8-4.5v-7M12 20v-8" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Application tracker",
        href: "/dashboard/applications",
        icon: (
          <path d="M6 5h12M6 12h12M6 19h12" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Discover jobs",
        href: "/dashboard/jobs",
        icon: (
          <path d="m20 20-3.5-3.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
    ],
  },
  {
    title: "Intelligence studio",
    items: [
      {
        name: "Career copilot",
        href: "/dashboard/copilot",
        icon: (
          <path d="M12 4a6 6 0 0 0-6 6v2.5L4 16v1h16v-1l-2-3.5V10a6 6 0 0 0-6-6Zm-2 14h4" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Generate bullet points",
        href: "/generate/bullets",
        icon: (
          <path d="M7 7h10M7 12h10M7 17h6" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
      {
        name: "Generate cover letter",
        href: "/generate/cover-letter",
        icon: (
          <path d="M4 7.5 12 13l8-5.5M6 19h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" strokeLinecap="round" strokeLinejoin="round" />
        ),
      },
    ],
  },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    navGroups.reduce<Record<string, boolean>>((acc, group, index) => {
      acc[group.title] =
        index === 0 || group.items.some((item) => isGroupItemActive(pathname, item.href));
      return acc;
    }, {})
  );

  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => isGroupItemActive(pathname, item.href))
    );

    if (!activeGroup) {
      return;
    }

    setOpenGroups((current) =>
      current[activeGroup.title]
        ? current
        : {
            ...current,
            [activeGroup.title]: true,
          }
    );
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#E0F2F1]">
      <aside className="w-64 flex-shrink-0 border-r border-black/[0.06] bg-[#E0F2F1] hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-12 w-40 transition-transform duration-300 group-hover:scale-105">
              <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((current) => ({
                    ...current,
                    [group.title]: !current[group.title],
                  }))
                }
                className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs font-semibold uppercase tracking-wider text-[#757575] transition-colors hover:bg-black/[0.04] hover:text-[#1A237E]"
                aria-expanded={openGroups[group.title]}
              >
                <span>{group.title}</span>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-[#757575]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {openGroups[group.title] ? (
                    <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
              <div className={openGroups[group.title] ? "space-y-1" : "hidden"}>
                {group.items.map((item) => {
                  const isActive = isGroupItemActive(pathname, item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#26A69A]/10 text-[#1A237E]"
                          : "text-[#757575] hover:bg-black/[0.04] hover:text-[#1A237E]"
                      }`}
                    >
                      <svg
                        aria-hidden="true"
                        className={`h-4 w-4 ${isActive ? "text-[#26A69A]" : "text-[#757575]"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {item.icon}
                      </svg>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mb-6">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#757575]">
              Account
            </h3>
            <div className="space-y-1">
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/dashboard/profile"
                    ? "bg-[#26A69A]/10 text-[#1A237E]"
                    : "text-[#757575] hover:bg-black/[0.04] hover:text-[#1A237E]"
                }`}
              >
                <svg className="h-4 w-4 text-[#757575]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Update Details
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#757575] hover:bg-black/[0.04] hover:text-[#1A237E] transition-colors"
              >
                <svg className="h-4 w-4 text-[#757575]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>

        {session?.user && (
          <div className="p-4 border-t border-black/[0.06]">
             <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs text-[#757575]">Credits</span>
              <span className="text-xs font-semibold text-[#26A69A]">{session.user.credits}</span>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-[#757575]">Plan</span>
              <span className="text-xs font-semibold capitalize text-[#1A237E]">{session.user.planTier}</span>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#E0F2F1]">
        {children}
      </main>
    </div>
  );
}
