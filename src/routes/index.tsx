import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TriedIt — Try it. Review it. Get paid." },
      {
        name: "description",
        content:
          "TriedIt connects products that need real feedback with people willing to test them. Submit a structured review, get paid in GEN the moment it's accepted.",
      },
      { property: "og:title", content: "TriedIt — Try it. Review it. Get paid." },
      {
        property: "og:description",
        content:
          "A product-testing and review marketplace on GenLayer. Reviews are evaluated against the campaign's criteria; accepted reviews are paid instantly in GEN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Gold({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-gold">{children}</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

function FlowStep({
  label,
  children,
  tone = "default",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "default" | "gold" | "success";
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div
        className={`mt-1.5 text-sm ${
          tone === "gold"
            ? "font-semibold text-gold"
            : tone === "success"
              ? "font-semibold text-success"
              : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="mx-auto my-1.5 h-5 w-px bg-gradient-to-b from-primary/50 to-brand-magenta/50" />
  );
}

function HeroMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [1, 2, 3, 4].map((i) =>
      setTimeout(() => setStep(i), 260 * i + 260),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const stages = [
    {
      label: "Project",
      body: <span className="font-semibold">Genlayer Portal</span>,
    },
    {
      label: "Requirements",
      body: (
        <span className="text-muted-foreground">
          Review must mention a specific feature you used and whether it worked as
          expected.
        </span>
      ),
    },
    {
      label: "Your review",
      body: (
        <span className="text-muted-foreground">
          “I used the wallet connection flow to fund a test contract — it worked
          smoothly and the transaction confirmed within seconds.”
        </span>
      ),
    },
    {
      label: "Evaluation",
      body: (
        <span className="text-muted-foreground">
          Requirements checked by GenLayer validators
        </span>
      ),
    },
    { label: "Reward", body: "+0.1 GEN", tone: "gold" as const },
  ];

  return (
    <div className="glass-card relative isolate p-6">
      {stages.map((s, i) => (
        <div
          key={s.label}
          style={{
            opacity: step >= i ? 1 : 0,
            transform: step >= i ? "translateY(0)" : "translateY(10px)",
            transition: "opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {i > 0 && <Connector />}
          <FlowStep label={s.label} tone={s.tone ?? "default"}>
            {s.body}
          </FlowStep>
        </div>
      ))}
    </div>
  );
}

const steps = [
  {
    n: "01",
    title: "Pick a project.",
    body: "Browse products and projects looking for testers.",
  },
  {
    n: "02",
    title: "Try it.",
    body: "Use the product and follow the stated testing requirements.",
  },
  {
    n: "03",
    title: "Submit your review.",
    body: "Share what you actually experienced, covering what the campaign asks for.",
  },
  {
    n: "04",
    title: "Get paid.",
    body: "Your review is evaluated by GenLayer's validators against the campaign's criteria. Accepted reviews are paid instantly in GEN.",
  },
];

const marketplace = [
  {
    name: "Genlayer Portal",
    desc: "Test the GenLayer Portal wallet and contract flow",
    reward: "0.1",
    reqs: "1 (must mention a specific feature and whether it worked)",
    real: true,
  },
  {
    name: "Ledger Sync Beta",
    desc: "Try the multi-device sync flow and report what happened",
    reward: "0.08",
    reqs: "2 (setup experience + sync reliability)",
    real: false,
  },
  {
    name: "Nimbus Notes",
    desc: "Use the offline editor for a day and describe the experience",
    reward: "0.05",
    reqs: "2 (a feature you used + whether it worked offline)",
    real: false,
  },
];

function Landing() {
  return (
    <div className="grid-soft min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles size={13} className="text-primary" /> Built on a GenLayer
              Intelligent Contract
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight md:text-6xl">
              Try it. Review it.{" "}
              <span className="text-gradient-brand">Get paid.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              TriedIt connects products that need real feedback with people willing
              to test them. Follow the requirements, share what you actually
              experienced, and get paid the moment your review is accepted — no
              waiting on a human to approve it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/app"
                className="gradient-brand flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgba(224,57,155,0.85)] transition-transform hover:-translate-y-0.5"
              >
                Explore Projects <ArrowRight size={16} />
              </Link>
              <Link
                to="/app"
                search={{ view: "create" }}
                className="rounded-full border border-border bg-white/70 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white"
              >
                Launch a Project
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Structured reviews · Consensus-evaluated · Instant payout in GEN
            </p>
          </div>

          <div className="rise-in" style={{ animationDelay: "120ms" }}>
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <SectionLabel>How TriedIt works</SectionLabel>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight">
            Real products. Real testing. Real feedback.
          </h2>
        </Reveal>

        <div className="mt-12 space-y-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="flex gap-6 rounded-2xl border-b border-border/70 px-1 py-7 transition-colors hover:bg-white/50 md:px-4">
                <span className="text-gradient-brand w-14 shrink-0 text-2xl font-bold">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-muted-foreground">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* For reviewers */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionLabel>For reviewers</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight">
              Your experience is worth something.
            </h2>
            <ul className="mt-7 space-y-3.5 text-muted-foreground">
              {[
                "Discover products looking for testers",
                "Choose projects that interest them",
                "Follow clear, stated review requirements",
                "Submit your own honest, specific review",
                "Get paid instantly in GEN when your review is accepted",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/app"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3"
            >
              Explore projects <ArrowRight size={15} />
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 sm:grid-cols-2">
              {marketplace.map((c) => (
                <div key={c.name} className="glass-card glass-card-hover p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{c.name}</h3>
                    {!c.real && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                        Illustrative
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
                  <p className="mt-4 text-sm">
                    Reward per review: <Gold>{c.reward} GEN</Gold>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Requirements: {c.reqs}
                  </p>
                  <Link
                    to="/app"
                    className="mt-4 block rounded-full border border-border bg-white/70 py-2 text-center text-sm font-medium hover:bg-white"
                  >
                    Try Project
                  </Link>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* For project owners */}
      <section id="for-projects" className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="glass-card p-7">
              <p className="text-sm text-muted-foreground">Project</p>
              <h3 className="text-xl font-semibold">Genlayer Portal</h3>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-muted-foreground">Funded</p>
                  <p className="mt-1">
                    <Gold>5.0 GEN</Gold>
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-muted-foreground">Per accepted review</p>
                  <p className="mt-1">
                    <Gold>0.1 GEN</Gold>
                  </p>
                </div>
                <div className="rounded-xl bg-white/70 p-4">
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="mt-1">
                    <Gold>4.9 GEN</Gold>
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold">Review requirements</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>· Mention a specific feature used</li>
                  <li>· State whether it worked as expected</li>
                </ul>
              </div>
              <div className="mt-6 flex gap-6 text-sm">
                <span className="text-muted-foreground">
                  Submissions: <span className="text-foreground">2</span>
                </span>
                <span className="text-muted-foreground">
                  Accepted: <span className="font-semibold text-success">1</span>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <SectionLabel>For project owners</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight">
              Stop guessing what users think.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Give testers clear instructions. Get structured feedback, paid only
              when it's genuine.
            </p>
            <ul className="mt-7 space-y-3.5 text-muted-foreground">
              {[
                "Create a testing campaign",
                "Define exactly what a genuine review should cover",
                "Fund a reward pool in GEN",
                "Set the reward per accepted review",
                "Receive structured, evaluated feedback — and reclaim whatever's left, anytime",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/app"
              search={{ view: "create" }}
              className="gradient-brand mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Launch a Project <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Evaluation layer */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <SectionLabel>The evaluation layer</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight">
              Reviews with rules behind them.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Project owners define what a useful review should contain. GenLayer's
              validators evaluate submissions against those requirements —
              independently, and they have to agree.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              GenLayer's validators evaluate whether a review shows genuine,
              specific engagement with the stated criteria — independently, with
              consensus required before a review is accepted or a reward is paid.
            </p>
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Learn about GenLayer <ArrowRight size={14} />
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-card p-6">
              <FlowStep label="Project criteria">
                <span className="text-muted-foreground">
                  “Review must mention a specific feature you used and whether it
                  worked as expected.”
                </span>
              </FlowStep>
              <Connector />
              <FlowStep label="Submitted review">
                <span className="text-muted-foreground">
                  The tester's own account of what they experienced
                </span>
              </FlowStep>
              <Connector />
              <FlowStep label="GenLayer validators">
                <span className="text-muted-foreground">
                  Multiple independent checks, must reach consensus
                </span>
              </FlowStep>
              <Connector />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-success/8 p-4 text-sm font-semibold text-success">
                  Accepted
                </div>
                <div className="rounded-2xl bg-danger/8 p-4 text-sm font-semibold text-danger">
                  Rejected
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                with a stated reason
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Reward mechanism */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <SectionLabel>Reward mechanism</SectionLabel>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight">
            Good feedback gets paid, the moment it's accepted.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            "Project owner funds a campaign in GEN and sets a reward per accepted review",
            "Testers submit reviews",
            "Each review is evaluated",
            "Accepted reviews are paid instantly, first-come first-served, until the campaign's budget runs out",
          ].map((t, i) => (
            <Reveal key={t} delay={i * 90}>
              <div className="glass-card glass-card-hover h-full p-6">
                <span className="text-gradient-brand text-sm font-bold">
                  Step {i + 1}
                </span>
                <p className="mt-2 text-sm text-muted-foreground">{t}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="glass-card mt-6 p-6 text-sm">
            <p>
              Example (real data): a <Gold>0.5 GEN</Gold> campaign budget at{" "}
              <Gold>0.1 GEN</Gold> per accepted review pays up to{" "}
              <Gold>5</Gold> reviews before the campaign is exhausted.
            </p>
            <p className="mt-2 text-muted-foreground">
              Each accepted review earns that exact fixed amount, immediately — it
              is not a pool divided among submissions at the end.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Real example campaign */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <SectionLabel>Live on-chain example</SectionLabel>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight">
            A campaign, a review, a payout.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="glass-card glass-card-hover h-full p-7">
              <p className="text-sm text-muted-foreground">Project</p>
              <h3 className="text-2xl font-bold tracking-tight">Genlayer Portal</h3>
              <p className="mt-4 text-sm">
                Reward per review: <Gold>0.1 GEN</Gold>
              </p>
              <p className="mt-5 text-sm font-semibold">Requirements</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>· Mention a specific feature you used</li>
                <li>· State whether it worked as expected</li>
              </ul>
              <Link
                to="/app"
                className="gradient-brand mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
              >
                View Project
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-card h-full p-7">
              <p className="text-sm font-semibold">Submitted review</p>
              <blockquote className="mt-3 rounded-2xl bg-white/70 p-5 text-sm leading-relaxed text-muted-foreground">
                “I used the wallet connection flow to fund a test contract — it
                worked smoothly and the transaction confirmed within seconds.”
              </blockquote>

              <p className="mt-6 text-sm font-semibold">Campaign requirements</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2 text-success">
                  <CheckCircle2 size={16} /> Mentions a specific feature
                </li>
                <li className="flex items-center gap-2 text-success">
                  <CheckCircle2 size={16} /> States whether it worked as expected
                </li>
              </ul>

              <div className="mt-6 rounded-2xl bg-success/8 p-5">
                <p className="font-semibold text-success">Status: Accepted</p>
                <p className="mt-1 text-sm">
                  <Gold>0.1 GEN</Gold> paid
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight">
            Built for useful feedback, not empty ratings.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Structured",
              body: "Every campaign defines exactly what testers should evaluate and answer.",
            },
            {
              title: "Transparent",
              body: "Requirements and reward amounts are visible before anyone tests anything.",
            },
            {
              title: "Evaluated",
              body: "Every submission is checked against the campaign's stated criteria by multiple independent validators before payout.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div className="glass-card glass-card-hover h-full p-7">
                <span className="gradient-brand flex size-10 items-center justify-center rounded-xl text-white">
                  <ShieldCheck size={18} />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal>
          <div className="gradient-brand relative overflow-hidden rounded-[2rem] px-8 py-20 text-center text-white">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Someone needs to try your product.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              And someone out there is ready to give you honest feedback.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/app"
                className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
              >
                Explore Projects
              </Link>
              <Link
                to="/app"
                search={{ view: "create" }}
                className="rounded-full border border-white/50 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Launch a Project
              </Link>
            </div>
            <p className="mt-8 text-sm text-white/75">
              TriedIt — Real experiences. Real rewards.
            </p>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
