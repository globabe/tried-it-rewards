import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CampaignCard, Gold, StatusBadge, VerdictPanel } from "@/components/app/CampaignCard";
import { ProjectReviews } from "@/components/app/ProjectReviews";
import { useCampaignList } from "@/hooks/use-campaigns";
import {
  campaignKey,
  checkReview,
  closeCampaign,
  createCampaign,
  getCampaign,
  getCampaignCount,
  getReviewCount,
  getReviewsForCampaign,
  getVerdict,
  reviewKey,
  saveMyReview,
  submitReview,
  weiToGen,
  type Campaign,
  type Review,
  type Verdict,
} from "@/lib/triedit-client";
import { STUDIO_DEV_CHAIN_ID } from "@/lib/wallet";
import { shortenAddress, useWallet } from "@/lib/wallet-context";

type AppSearch = { view?: "create" | undefined; campaign?: string | undefined };

export const Route = createFileRoute("/app")({
  validateSearch: (search: Record<string, unknown>): AppSearch => ({
    view: search["view"] === "create" ? "create" : undefined,
    campaign:
      typeof search["campaign"] === "string" && /^campaign_\d+$/.test(search["campaign"])
        ? search["campaign"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "TriedIt App — Browse testing campaigns and get paid in GEN" },
      {
        name: "description",
        content:
          "Connect a wallet, browse live TriedIt campaigns, submit a structured review, and get paid in GEN when it's accepted.",
      },
      { property: "og:title", content: "TriedIt App — Try it. Review it. Get paid." },
      {
        property: "og:description",
        content:
          "Browse product-testing campaigns funded in GEN, submit a review, and get paid the moment it's accepted.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/app" });
  const view = search.view === "create" ? "create" : "browse";

  return (
    <div className="grid-soft min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <WalletPanel />

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate({ search: {} })}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              view === "browse" ? "gradient-brand text-white" : "border border-border bg-white/60"
            }`}
          >
            Browse campaigns
          </button>
          <button
            onClick={() => navigate({ search: { view: "create" } })}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
              view === "create" ? "gradient-brand text-white" : "border border-border bg-white/60"
            }`}
          >
            <Plus size={15} /> Launch a project
          </button>
        </div>

        <div className="mt-6">
          {view === "create" ? (
            <CreateCampaign
              onCreated={(id) =>
                id ? navigate({ search: { campaign: id } }) : navigate({ to: "/profile" })
              }
            />
          ) : search.campaign ? (
            <CampaignDetail
              campaignId={search.campaign}
              onBack={() => navigate({ search: {} })}
            />
          ) : (
            <Browse />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function WalletPanel() {
  const { address, wrongNetwork, connecting, error, connect, disconnect, switchNetwork } =
    useWallet();

  return (
    <section className="glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="gradient-brand flex size-10 items-center justify-center rounded-xl text-white">
            <Wallet size={18} />
          </span>
          <div>
            <p className="font-semibold">
              {address ? (wrongNetwork ? "Wrong network" : "Wallet connected") : "Connect your wallet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {address
                ? wrongNetwork
                  ? `${shortenAddress(address)} · switch to GenLayer Studio-dev (chain ${STUDIO_DEV_CHAIN_ID}) to continue`
                  : `${shortenAddress(address)} · GenLayer Studio-dev (chain ${STUDIO_DEV_CHAIN_ID})`
                : "Use MetaMask, Rabby or any EVM wallet on GenLayer Studio-dev. You can browse without one."}
            </p>
            {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
          </div>
        </div>

        {address ? (
          <div className="flex flex-wrap items-center gap-2">
            {wrongNetwork ? (
              <button
                onClick={() => void switchNetwork()}
                className="gradient-brand rounded-full px-5 py-2 text-sm font-semibold text-white"
              >
                Switch to Studio-dev
              </button>
            ) : (
              <Link
                to="/profile"
                className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium hover:bg-white"
              >
                My profile
              </Link>
            )}
            <button
              onClick={() => void disconnect()}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/70 hover:text-foreground"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => void connect()}
            disabled={connecting}
            className="gradient-brand flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {connecting ? <Loader2 size={15} className="animate-spin" /> : null}
            Connect Wallet
          </button>
        )}
      </div>
    </section>
  );
}

function Browse() {
  const { address } = useWallet();
  const { campaigns, loading, error, reload } = useCampaignList();
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const me = address.toLowerCase();

  const shown = campaigns.filter((c) => (filter === "open" ? !c.closed : c.closed));
  const openCount = campaigns.filter((c) => !c.closed).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border bg-white/60 p-1 text-sm">
          {(["open", "closed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 font-medium capitalize transition-colors ${
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "open" ? `Open (${openCount})` : `Closed (${campaigns.length - openCount})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => void reload()}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm hover:bg-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="glass-card mb-4 p-5 text-sm text-danger">{error}</div>}

      {loading && campaigns.length === 0 ? (
        <div className="glass-card flex items-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Loading campaigns from the contract…
        </div>
      ) : shown.length === 0 && !error ? (
        <div className="glass-card p-10 text-center text-muted-foreground">
          {filter === "open" ? "No open campaigns right now. Launch the first one." : "No closed campaigns."}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <CampaignCard key={c.campaign_id} campaign={c} mine={!!me && c.owner.toLowerCase() === me} />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignDetail({ campaignId, onBack }: { campaignId: string; onBack: () => void }) {
  const { address, client, readClient } = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [stage, setStage] = useState<"idle" | "submitting" | "checking" | "done">("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  const load = useCallback(async () => {
    try {
      setCampaign(await getCampaign(readClient, campaignId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [readClient, campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  // One review per wallet: look for a review this wallet already left here.
  const loadMine = useCallback(async () => {
    if (!address) {
      setMyReview(null);
      return;
    }
    setCheckingExisting(true);
    try {
      const list = await getReviewsForCampaign(readClient, campaignId);
      setMyReview(
        list.find((r) => r.reviewer?.toLowerCase() === address.toLowerCase()) ?? null,
      );
    } catch {
      /* non-fatal: the contract is the final guard */
    } finally {
      setCheckingExisting(false);
    }
  }, [readClient, campaignId, address]);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  const isOwner = !!address && !!campaign && campaign.owner.toLowerCase() === address.toLowerCase();

  const onSubmit = async () => {
    if (!client || !campaign || !reviewText.trim() || myReview) return;
    setError(null);
    setVerdict(null);
    setStage("submitting");
    try {
      const text = reviewText.trim();
      await submitReview(client, campaignId, text);
      const reviewId = reviewKey((await getReviewCount(readClient)) - 1);
      saveMyReview(address, {
        reviewId,
        campaignId,
        productName: campaign.product_name,
        text,
        submittedAt: Date.now(),
      });
      setStage("checking");
      await checkReview(client, reviewId);
      setVerdict(await getVerdict(readClient, reviewId));
      setStage("done");
      void load();
      void loadMine();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStage("idle");
    }
  };

  const onClose = async () => {
    if (!client) return;
    setClosing(true);
    setError(null);
    try {
      await closeCampaign(client, campaignId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setClosing(false);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} /> Back to campaigns
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="glass-card p-7">
          {!campaign && !error ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={18} /> Loading campaign…
            </div>
          ) : campaign ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{campaign.product_name}</h2>
                <StatusBadge closed={campaign.closed} />
              </div>
              {campaign.product_link && (
                <a
                  href={campaign.product_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Visit product <ExternalLink size={14} />
                </a>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-white/60 p-4">
                  <p className="text-muted-foreground">Reward per accepted review</p>
                  <p className="mt-1 text-lg">
                    <Gold>{weiToGen(campaign.reward_per_review)} GEN</Gold>
                  </p>
                </div>
                <div className="rounded-xl bg-white/60 p-4">
                  <p className="text-muted-foreground">Remaining budget</p>
                  <p className="mt-1 text-lg">
                    <Gold>{weiToGen(campaign.remaining_budget)} GEN</Gold>
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold">Review requirements</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {campaign.review_criteria}
                </p>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Launched by {isOwner ? "you" : shortenAddress(campaign.owner)} · funded{" "}
                <Gold>{weiToGen(campaign.total_budget)} GEN</Gold>
              </p>
            </>
          ) : null}
        </section>

        <section className="glass-card p-7">
          {isOwner && campaign ? (
            <>
              <h3 className="text-lg font-semibold">You launched this project</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Testers submit reviews here. Each accepted review is paid{" "}
                <Gold>{weiToGen(campaign.reward_per_review)} GEN</Gold> from your budget,
                first-come first-served, until it runs out.
              </p>
              {!campaign.closed ? (
                <>
                  <p className="mt-5 text-sm">
                    Closing refunds the remaining{" "}
                    <Gold>{weiToGen(campaign.remaining_budget)} GEN</Gold> to your wallet and stops new
                    reviews.
                  </p>
                  <button
                    onClick={() => void onClose()}
                    disabled={closing || !client}
                    className="mt-4 flex items-center gap-2 rounded-full border border-danger/40 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/8 disabled:opacity-60"
                  >
                    {closing && <Loader2 size={15} className="animate-spin" />}
                    {closing ? "Closing…" : "Close campaign & refund remaining"}
                  </button>
                </>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  This campaign is closed. Any remaining budget was refunded.
                </p>
              )}
            </>
          ) : campaign?.closed ? (
            <>
              <h3 className="text-lg font-semibold">This campaign is closed</h3>
              <p className="mt-1 text-sm text-muted-foreground">It's no longer accepting reviews.</p>
            </>
          ) : myReview && stage !== "done" ? (
            <>
              <h3 className="text-lg font-semibold">You already reviewed this project</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                One review per wallet, so the rewards spread across different testers.
              </p>
              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white/70 p-4 text-sm">
                {myReview.review_text}
              </p>
              {campaign && <VerdictPanel verdict={myReview.verdict} campaign={campaign} />}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">Submit your review</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                One review per wallet. Cover what the campaign asks for — your review is evaluated
                against the campaign's criteria by GenLayer's validators.
              </p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={7}
                placeholder="Describe what you actually experienced…"
                className="mt-4 w-full rounded-xl border border-border bg-white/80 p-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button
                onClick={() => void onSubmit()}
                disabled={
                  !client ||
                  checkingExisting ||
                  stage === "submitting" ||
                  stage === "checking" ||
                  !reviewText.trim()
                }
                className="gradient-brand mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {stage === "submitting" && <Loader2 size={16} className="animate-spin" />}
                {stage === "submitting" ? "Submitting review…" : "Submit review"}
              </button>
              {!client && (
                <p className="mt-3 text-sm text-muted-foreground">Connect your wallet to submit a review.</p>
              )}

              {stage === "checking" && (
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/70 p-4 text-sm">
                  <Loader2 size={16} className="shrink-0 animate-spin text-primary" />
                  Checking… validators are evaluating your review against the criteria. This step takes
                  a little longer.
                </div>
              )}

              {stage === "done" && verdict && <VerdictPanel verdict={verdict} campaign={campaign} />}
            </>
          )}

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </section>
      </div>

      {isOwner && campaign && <ProjectReviews campaign={campaign} />}
    </div>
  );
}

function CreateCampaign({ onCreated }: { onCreated: (campaignId: string | null) => void }) {
  const { client, readClient, address } = useWallet();
  const [form, setForm] = useState({
    productName: "",
    productLink: "",
    productImageUrl: "",
    reviewCriteria: "",
    rewardPerReviewGen: "0.1",
    totalBudgetGen: "0.5",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const maxReviews = (() => {
    const r = Number(form.rewardPerReviewGen);
    const b = Number(form.totalBudgetGen);
    if (!r || !b || r <= 0) return null;
    return Math.floor(b / r);
  })();

  const submit = async () => {
    if (!client) return;
    setBusy(true);
    setError(null);
    try {
      await createCampaign(client, form);
      setDone(true);
      // Find the campaign we just created so we can open it.
      let newId: string | null = null;
      try {
        const count = await getCampaignCount(readClient);
        for (let i = count - 1; i >= Math.max(0, count - 5); i--) {
          const c = await getCampaign(readClient, campaignKey(i));
          if (c.owner.toLowerCase() === address.toLowerCase()) {
            newId = c.campaign_id;
            break;
          }
        }
      } catch {
        /* fall back to profile */
      }
      setTimeout(() => onCreated(newId), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-xl border border-border bg-white/80 p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="glass-card mx-auto max-w-2xl p-7">
      <h2 className="text-2xl font-bold tracking-tight">Launch a project</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Fund a campaign in GEN and state exactly what a genuine review should cover.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Product name</label>
          <input className={`${field} mt-1.5`} value={form.productName} onChange={set("productName")} placeholder="Genlayer Portal" />
        </div>
        <div>
          <label className="text-sm font-medium">Product link</label>
          <input className={`${field} mt-1.5`} value={form.productLink} onChange={set("productLink")} placeholder="https://…" />
        </div>
        <div>
          <label className="text-sm font-medium">Product image URL</label>
          <input className={`${field} mt-1.5`} value={form.productImageUrl} onChange={set("productImageUrl")} placeholder="https://…/image.png" />
        </div>
        <div>
          <label className="text-sm font-medium">Review criteria</label>
          <textarea
            rows={4}
            className={`${field} mt-1.5`}
            value={form.reviewCriteria}
            onChange={set("reviewCriteria")}
            placeholder="Review must mention a specific feature you used and whether it worked as expected."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Reward per accepted review (GEN)</label>
            <input className={`${field} mt-1.5`} value={form.rewardPerReviewGen} onChange={set("rewardPerReviewGen")} inputMode="decimal" />
          </div>
          <div>
            <label className="text-sm font-medium">Total funding (GEN)</label>
            <input className={`${field} mt-1.5`} value={form.totalBudgetGen} onChange={set("totalBudgetGen")} inputMode="decimal" />
          </div>
        </div>

        {maxReviews !== null && (
          <p className="text-sm text-muted-foreground">
            Pays up to <Gold>{maxReviews}</Gold> accepted reviews at{" "}
            <Gold>{form.rewardPerReviewGen} GEN</Gold> each, first-come first-served, until the budget
            runs out.
          </p>
        )}

        <button
          onClick={() => void submit()}
          disabled={!client || busy || done || !form.productName || !form.reviewCriteria}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Funding campaign…" : done ? "Campaign launched" : "Fund & launch campaign"}
        </button>

        {!client && (
          <p className="text-sm text-muted-foreground">Connect your wallet above to launch a campaign.</p>
        )}
        {done && <p className="text-sm text-success">Campaign launched. Opening it now…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Amounts are entered in GEN and converted once, explicitly, before the transaction is sent.
      </p>
    </div>
  );
}
