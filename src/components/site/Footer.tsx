import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/40 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo size={40} />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Try it. Review it. Get paid. Real experiences. Real rewards.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">Product</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/app" className="hover:text-foreground">
                Explore Projects
              </Link>
            </li>
            <li>
              <Link to="/" hash="how-it-works" className="hover:text-foreground">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/" hash="for-projects" className="hover:text-foreground">
                For Projects
              </Link>
            </li>
            <li>
              <Link to="/" hash="about" className="hover:text-foreground">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold">Resources</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a
                href="https://docs.genlayer.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                Docs
              </a>
            </li>
            <li>
              <Link to="/" hash="about" className="hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/" hash="about" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
          </ul>
          <p className="mt-5 mb-3 font-semibold">Social</p>
          <div className="flex gap-4 text-muted-foreground">
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
              X
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
              Discord
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/60 px-5 py-6 text-center text-xs text-muted-foreground">
        TriedIt — Real experiences. Real rewards.
      </div>
    </footer>
  );
}
