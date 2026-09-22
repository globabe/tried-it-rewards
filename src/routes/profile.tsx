import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareText, Plus, RefreshCw, Wallet } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CampaignCard, Gold, VerdictPanel } from "@/components/app/CampaignCard";
import { summarizeReviews } from "@/components/app/ProjectReviews";
import { useCampaignList } from "@/hooks/use-campaigns";
import {
  getVerdict,
  listAllReviews,
  loadMyReviews,
  weiToGen,
  type MyReview,
  type Review,
  type Verdict,
} from "@/lib/triedit-client";
import { shortenAddress, useWallet } from "@/lib/wallet-context";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — TriedIt" },
      {
        name: "description",
        content: "See the projects you've launched on TriedIt and the reviews you've submitted.",
      },
      { property: "og:title", content: "My profile — TriedIt" },
      {
        property: "og:description",
        content: "Your launched TriedIt projects, remaining budgets in GEN, and review verdicts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { address, connect, connecting, disconnect } = useWallet();

  return (
    <div className="grid-soft min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        {!address ? (
          <section className="glass-card mx-auto max-w-lg p-10 text-center">
            <span className="gradient-brand mx-auto flex size-12 items-center justify-center rounded-2xl text-white">
              <Wallet size={20} />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">Connect to see your profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your profile shows the projects you've launched and the reviews you've submitted.
            </p>
            <button
              onClick={() => void connect()}
              disabled={connecting}
              className="gradient-brand mx-auto mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {connecting && <Loader2 size={15} className="animate-spin" />}
              Connect Wallet
            </button>
          </section>
        ) : (
          <>
            <section className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">My profile</p>
                <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                  {shortenAddress(address)}
                </h1>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/app"
                  search={{ view: "create" }}
                  className="gradient-brand flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus size={15} /> Launch a project
                </Link>
                <button
                  onClick={() => void disconnect()}
                  className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/70 hover:text-foreground"
                >
                  Disconnect
                </button>
              </div>
            </section>
            <MyProjects address={address} />
            <MyReviews address={address} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function MyProjects({ address }: { address: string }) {
  const { readClient } = useWallet();
  const { campaigns, loading, error, reload } = useCampaignList();
  const mine = campaigns.filter((c) => c.owner.toLowerCase() === address.toLowerCase());
  const open = mine.filter((c) => !c.closed);

  const [reviews, setReviews] = useState<Review[] | null>(null);
  const loadReviews = useCallback(async () => {
    try {
      setReviews(await listAllReviews(readClient));
    } catch {
      setReviews([]);
    }
  }, [readClient]);
  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const sum = (vals: string[]) => vals.reduce((a, v) => a + BigInt(v || "0"), 0n);
  const funded = sum(open.map((c) => c.total_budget));
  const remaining = sum(open.map((c) => c.remaining_budget));
  const paidOut = funded - remaining;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Projects I launched</h2>
        <button
          onClick={() => {
            void reload();
            void loadReviews();
          }}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm hover:bg-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {mine.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Open projects" value={<span className="font-semibold">{open.length}</span>} />
          <Stat label="Paid to testers (open projects)" value={<Gold>{weiToGen(paidOut)} GEN</Gold>} />
          <Stat label="Budget left (open projects)" value={<Gold>{weiToGen(remaining)} GEN</Gold>} />
        </div>
      )}

      {error && <div className="glass-card mb-4 p-5 text-sm text-danger">{error}</div>}

      {loading && campaigns.length === 0 ? (
        <div className="glass-card flex items-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Loading your projects…
        </div>
      ) : mine.length === 0 ? (
        <div className="glass-card p-10 text-center text-muted-foreground">
          You haven't launched a project from this wallet yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((c) => (
            <div key={c.campaign_id} className="flex flex-col gap-2">
              <CampaignCard campaign={c} />
              <FeedbackSummary
                campaignId={c.campaign_id}
                reviews={reviews ? reviews.filter((r) => r.campaign_id === c.campaign_id) : null}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FeedbackSummary({ campaignId, reviews }: { campaignId: string; reviews: Review[] | null }) {
  if (!reviews) {
    return (
      <p className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
        <Loader2 size={12} className="animate-spin" /> Loading feedback…
      </p>
    );
  }
  const s = summarizeReviews(reviews);
  return (
    <Link
      to="/app"
      search={{ campaign: campaignId }}
      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-white/60 px-4 py-2.5 text-sm hover:bg-white"
    >
      <span className="flex items-center gap-1.5">
        <MessageSquareText size={14} className="text-muted-foreground" />
        {s.total === 0 ? (
          <span className="text-muted-foreground">No reviews yet</span>
        ) : (
          <span>
            <span className="font-semibold">{s.total}</span> review{s.total === 1 ? "" : "s"}
            <span className="text-muted-foreground">
              {" "}
              · <span className="text-success">{s.accepted} accepted</span> ·{" "}
              <span className="text-danger">{s.rejected} rejected</span>
              {s.pending ? ` · ${s.pending} awaiting` : ""}
            </span>
          </span>
        )}
      </span>
      {s.total > 0 && <span className="text-xs font-medium text-primary">Read</span>}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl">{value}</p>
    </div>
  );
}

function MyReviews({ address }: { address: string }) {
  const { readClient } = useWallet();
  const { campaigns } = useCampaignList();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});

  useEffect(() => {
    const list = loadMyReviews(address);
    setReviews(list);
    list.forEach((r) => {
      getVerdict(readClient, r.reviewId)
        .then((v) => setVerdicts((prev) => ({ ...prev, [r.reviewId]: v })))
        .catch(() => {});
    });
  }, [address, readClient]);

  return (
    <section className="mt-14">
      <h2 className="text-xl font-semibold">Reviews I submitted</h2>
      <p className="mt-1 text-sm text-muted-foreground">Reviews submitted from this browser.</p>
      {reviews.length === 0 ? (
        <div className="glass-card mt-5 p-10 text-center text-muted-foreground">
          No reviews yet.{" "}
          <Link to="/app" className="text-primary hover:underline">
            Find a project to try
          </Link>
          .
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {reviews.map((r) => {
            const campaign = campaigns.find((c) => c.campaign_id === r.campaignId) ?? null;
            const v = verdicts[r.reviewId];
            return (
              <article key={r.reviewId} className="glass-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    to="/app"
                    search={{ campaign: r.campaignId }}
                    className="font-semibold hover:underline"
                  >
                    {r.productName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">"{r.text}"</p>
                {v ? (
                  <VerdictPanel verdict={v} campaign={campaign} />
                ) : (
                  <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" /> Loading verdict…
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

