import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./Brand";

const CONTRACT_ADDRESS = "0xf57457DbF1828229627b3F73aCC4C54C3FcA7BC8";

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-white/40 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr]">
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
          </ul>
          <p className="mt-5 mb-3 font-semibold">Resources</p>
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
              <a
                href="https://github.com/globabe/tried-it-rewards"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/60 px-5 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
          <p className="text-xs text-muted-foreground">
            TriedIt — Real experiences. Real rewards.
          </p>
          <a
            href={`https://studio-dev.genlayer.com/api#/accounts/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-muted-foreground break-all hover:text-foreground"
          >
            Contract: {CONTRACT_ADDRESS}
          </a>
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GenLayer Intelligent Contracts
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
