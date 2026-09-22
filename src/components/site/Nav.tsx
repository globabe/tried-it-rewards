import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./Brand";

const links = [
  { label: "Explore Projects", to: "/app" as const },
  { label: "How It Works", to: "/" as const, hash: "how-it-works" },
  { label: "For Projects", to: "/" as const, hash: "for-projects" },
  { label: "About", to: "/" as const, hash: "about" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/50 bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="shrink-0">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              {...("hash" in l ? { hash: (l as { hash: string }).hash } : {})}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/app"
            className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium transition-colors hover:bg-white"
          >
            Connect Wallet
          </Link>
          <Link
            to="/app"
            search={{ view: "create" }}
            className="gradient-brand rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(224,57,155,0.8)] transition-transform hover:-translate-y-0.5"
          >
            Launch a Project
          </Link>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border bg-white/70 p-2 lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/50 bg-background/95 px-5 pb-5 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1 py-3 text-sm font-medium">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                {...("hash" in l ? { hash: (l as { hash: string }).hash } : {})}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 hover:bg-white/70"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/app"
            search={{ view: "create" }}
            onClick={() => setOpen(false)}
            className="gradient-brand block rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Launch a Project
          </Link>
        </div>
      )}
    </header>
  );
}
