import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, LogOut, Menu, User, X } from "lucide-react";
import { BrandLogo } from "./Brand";
import { shortenAddress, useWallet } from "@/lib/wallet-context";

const links = [
  { label: "Explore Projects", to: "/app" as const },
  { label: "How It Works", to: "/" as const, hash: "how-it-works" },
  { label: "For Projects", to: "/" as const, hash: "for-projects" },
  { label: "About", to: "/" as const, hash: "about" },
];

function WalletButton() {
  const { address, wrongNetwork, connecting, connect, disconnect, switchNetwork } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!address) {
    return (
      <button
        onClick={() => void connect()}
        disabled={connecting}
        className="flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium transition-colors hover:bg-white disabled:opacity-60"
      >
        {connecting && <Loader2 size={14} className="animate-spin" />}
        Connect Wallet
      </button>
    );
  }

  if (wrongNetwork) {
    return (
      <button
        onClick={() => void switchNetwork()}
        className="rounded-full border border-danger/40 bg-white/70 px-4 py-2 text-sm font-medium text-danger hover:bg-white"
      >
        Switch to Studio-dev
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-white/70 py-1.5 pl-2 pr-3 text-sm font-medium transition-colors hover:bg-white"
      >
        <span className="size-2 rounded-full bg-success" aria-hidden />
        <span className="font-mono">{shortenAddress(address)}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="glass-card absolute right-0 mt-2 w-52 p-1.5 shadow-lg">
          <p className="px-3 py-2 text-xs text-muted-foreground">Connected · Studio-dev</p>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/80"
          >
            <User size={15} /> My profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              void disconnect();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-white/80"
          >
            <LogOut size={15} /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { address, connect, disconnect } = useWallet();

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
          <WalletButton />
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
            {address && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 hover:bg-white/70"
              >
                My profile
              </Link>
            )}
          </nav>
          <div className="flex flex-col gap-2">
            {address ? (
              <button
                onClick={() => {
                  setOpen(false);
                  void disconnect();
                }}
                className="rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-medium"
              >
                Disconnect {shortenAddress(address)}
              </button>
            ) : (
              <button
                onClick={() => void connect()}
                className="rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}
            <Link
              to="/app"
              search={{ view: "create" }}
              onClick={() => setOpen(false)}
              className="gradient-brand block rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Launch a Project
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
