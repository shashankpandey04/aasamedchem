"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/app/actions";
import type { SessionPayload } from "@/lib/session";

type Props = { session: SessionPayload | null };

type NavLink = { href: string; label: string };

const USER_LINKS: NavLink[] = [
  { href: "/user", label: "Dashboard" },
  { href: "/order", label: "Place order" },
  { href: "/orders", label: "My orders" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/order", label: "New order" },
];

export function NavbarClient({ session }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Don't render the navbar on auth pages
  if (!session) return null;

  const links = session.role === "admin" ? ADMIN_LINKS : USER_LINKS;

  function NavLink({ href, label }: NavLink) {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={
          active
            ? "text-sm font-medium text-slate-950"
            : "text-sm font-medium text-slate-500 transition hover:text-slate-950"
        }
      >
        {label}
        {active && (
          <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-slate-950 align-middle" />
        )}
      </Link>
    );
  }
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href={session.role === "admin" ? "/admin" : "/user"}
          className="text-sm font-semibold tracking-tight text-slate-950"
        >
          AasaMedChem
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        {/* Desktop: user info + sign out */}
        <div className="hidden items-center gap-4 sm:flex">
          <span className="text-sm text-slate-500">
            {session.name}
            <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
              {session.role}
            </span>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Mobile: hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 sm:hidden"
        >
          {open ? (
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M1 3.75A.75.75 0 0 1 1.75 3h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 3.75ZM1 8a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 8Zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1-.75-.75Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="mb-2 px-3 text-xs text-slate-400">
              Signed in as{" "}
              <span className="font-medium text-slate-600">{session.name}</span>
              <span className="ml-1.5 capitalize">({session.role})</span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
