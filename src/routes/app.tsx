import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import {
  checkReview,
  closeCampaign,
  createCampaign,
  getCampaign,
  getCampaignCount,
  getReviewCount,
  getVerdict,
  makeWalletClient,
  submitReview,
  weiToGen,
  type Campaign,
  type GenClient,
  type Verdict,
} from "@/lib/triedit-client";
import {
  STUDIO_DEV_CHAIN_ID,
  connectWallet,
  ensureStudioDevNetwork,
  getChainId,
  getConnectedAddress,
  getProvider,
} from "@/lib/wallet";

type View = "browse" | "create";

export const Route = createFileRoute("/app")({
  validateSearch: (search: Record<string, unknown>): { view?: View | undefined } => ({
    view: search["view"] === "create" ? ("create" as View) : undefined,
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

function shorten(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Gold({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-gold">{children}</span>;
}

function AppPage() {
  const search = Route.useSearch();
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string>("");
  const [view, setView] = useState<View>(search.view === "create" ? "create" : "browse");
  const [selected, setSelected] = useState<number | null>(null);

  // Pick up an already-authorized account + react to wallet changes.
  useEffect(() => {
    let alive = true;
    getConnectedAddress().then((addr) => alive && setAddress(addr ?? ""));
    getChainId().then((id) => alive && setChainId(id));

    const provider = getProvider();
    const onAccounts = (accounts: string[]) => setAddress(accounts?.[0] ?? "");
    const onChain = (hex: string) => setChainId(parseInt(hex, 16));
    provider?.on?.("accountsChanged", onAccounts);
    provider?.on?.("chainChanged", onChain);
    return () => {
      alive = false;
      provider?.removeListener?.("accountsChanged", onAccounts);
      provider?.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const wrongNetwork = Boolean(address) && chainId !== null && chainId !== STUDIO_DEV_CHAIN_ID;

  const client: GenClient | null = useMemo(
    () => (address && !wrongNetwork ? makeWalletClient(address) : null),
    [address, wrongNetwork],
  );

  const handleConnect = async () => {
    setWalletError("");
    setConnecting(true);
    try {
      const { address: addr } = await connectWallet();
      setAddress(addr);
      setChainId(await getChainId());
    } catch (err: any) {
      setWalletError(err?.message ?? "Could not connect your wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setWalletError("");
    const provider = getProvider();
    if (!provider) return;
    try {
      await ensureStudioDevNetwork(provider);
      setChainId(await getChainId());
    } catch (err: any) {
      setWalletError(err?.message ?? "Could not switch network.");
    }
  };

  return (
    <div className="grid-soft min-h-screen">
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        {/* Wallet */}
        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="gradient-brand flex size-10 items-center justify-center rounded-xl text-white">
                <Wallet size={18} />
              </span>
              <div>
                <p className="font-semibold">
                  {address
                    ? wrongNetwork
                      ? "Wrong network"
                      : "Wallet connected"
                    : "Connect your wallet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address
                    ? wrongNetwork
                      ? `${shorten(address)} · switch to GenLayer Studio-dev (chain ${STUDIO_DEV_CHAIN_ID}) to continue`
                      : `${shorten(address)} · GenLayer Studio-dev (chain ${STUDIO_DEV_CHAIN_ID})`
                    : "Use MetaMask, Rabby or any EVM wallet on GenLayer Studio-dev."}
                </p>
                {walletError ? (
                  <p className="mt-1 text-sm text-danger">{walletError}</p>
                ) : null}
              </div>
            </div>

            {address ? (
              wrongNetwork ? (
                <button
                  onClick={handleSwitchNetwork}
                  className="gradient-brand rounded-full px-5 py-2 text-sm font-semibold text-white"
                >
                  Switch to Studio-dev
                </button>
              ) : (
                <span className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium">
                  {shorten(address)}
                </span>
              )
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="gradient-brand flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {connecting ? <Loader2 size={15} className="animate-spin" /> : null}
                Connect Wallet
              </button>
            )}
          </div>
        </section>

        {/* View switch */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setView("browse");
                setSelected(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                view === "browse"
                  ? "gradient-brand text-white"
                  : "border border-border bg-white/60"
              }`}
            >
              Browse campaigns
            </button>
            <button
              onClick={() => setView("create")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
                view === "create"
                  ? "gradient-brand text-white"
                  : "border border-border bg-white/60"
              }`}
            >
              <Plus size={15} /> Launch a project
            </button>
          </div>
        </div>

        <div className="mt-6">
          {view === "create" ? (
            <CreateCampaign client={client} onCreated={() => setView("browse")} />
          ) : selected === null ? (
            <Browse client={client} onOpen={(id) => setSelected(id)} />
          ) : (
            <CampaignDetail
              client={client}
              campaignId={selected}
              address={address}
              onBack={() => setSelected(null)}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function useCampaigns(client: GenClient | null) {
  const [campaigns, setCampaigns] = useState<(Campaign & { id: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const count = await getCampaignCount(client);
      const list: (Campaign & { id: number })[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const c = await getCampaign(client, i);
          list.push({ ...c, id: i });
        } catch {
          /* skip unreadable campaign */
        }
      }
      setCampaigns(list.reverse());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  return { campaigns, loading, error, reload: load };
}

function isOpen(c: Campaign) {
  if (typeof c.is_open === "boolean") return c.is_open;
  const status = String((c as any).status ?? "").toLowerCase();
  if (status) return status === "open" || status === "active";
  return true;
}

function CampaignCard({
  campaign,
  onOpen,
}: {
  campaign: Campaign & { id: number };
  onOpen: () => void;
}) {
  const open = isOpen(campaign);
  return (
    <button
      onClick={onOpen}
      className="glass-card glass-card-hover overflow-hidden p-0 text-left"
    >
      <div className="gradient-brand h-32 w-full overflow-hidden">
        {campaign.product_image_url ? (
          <img
            src={String(campaign.product_image_url)}
            alt={String(campaign.product_name ?? "Product")}
            className="h-32 w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">
            {String(campaign.product_name ?? `Campaign #${campaign.id}`)}
          </h3>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              open
                ? "bg-success/12 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {open ? "Open" : "Closed"}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {String(campaign.review_criteria ?? "")}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>
            Reward <Gold>{weiToGen(String(campaign.reward_per_review ?? 0))} GEN</Gold>
          </span>
          <span className="text-muted-foreground">
            Remaining{" "}
            <Gold>
              {weiToGen(String((campaign as any).remaining_budget ?? (campaign as any).budget ?? 0))}{" "}
              GEN
            </Gold>
          </span>
        </div>
      </div>
    </button>
  );
}

function Browse({
  client,
  onOpen,
}: {
  client: GenClient | null;
  onOpen: (id: number) => void;
}) {
  const { campaigns, loading, error, reload } = useCampaigns(client);

  if (!client) {
    return (
      <div className="glass-card p-10 text-center text-muted-foreground">
        Connect a wallet above to load live campaigns from the TriedIt contract.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Open campaigns</h2>
        <button
          onClick={() => void reload()}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm hover:bg-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="glass-card border-danger/30 p-5 text-sm text-danger">{error}</div>
      )}

      {loading && campaigns.length === 0 ? (
        <div className="glass-card flex items-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Loading campaigns…
        </div>
      ) : campaigns.length === 0 && !error ? (
        <div className="glass-card p-10 text-center text-muted-foreground">
          No campaigns yet. Launch the first one.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} onOpen={() => onOpen(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignDetail({
  client,
  campaignId,
  address,
  onBack,
}: {
  client: GenClient | null;
  campaignId: number;
  address: string;
  onBack: () => void;
}) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [stage, setStage] = useState<"idle" | "submitting" | "checking" | "done">("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const load = useCallback(async () => {
    if (!client) return;
    try {
      setCampaign(await getCampaign(client, campaignId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [client, campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  const owner = String((campaign as any)?.owner ?? "").toLowerCase();
  const isOwner = !!address && owner === address.toLowerCase();

  const onSubmit = async () => {
    if (!client || !reviewText.trim()) return;
    setError(null);
    setVerdict(null);
    setStage("submitting");
    try {
      await submitReview(client, campaignId, reviewText.trim());
      const count = await getReviewCount(client);
      const reviewId = count - 1;
      setStage("checking");
      await checkReview(client, reviewId);
      const v = await getVerdict(client, reviewId);
      setVerdict(v);
      setStage("done");
      void load();
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

  const accepted = verdict?.accepted === true;

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
          <h2 className="text-2xl font-bold tracking-tight">
            {String(campaign?.product_name ?? `Campaign #${campaignId}`)}
          </h2>
          {campaign?.product_link && (
            <a
              href={String(campaign.product_link)}
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
                <Gold>{weiToGen(String(campaign?.reward_per_review ?? 0))} GEN</Gold>
              </p>
            </div>
            <div className="rounded-xl bg-white/60 p-4">
              <p className="text-muted-foreground">Remaining budget</p>
              <p className="mt-1 text-lg">
                <Gold>
                  {weiToGen(
                    String(
                      (campaign as any)?.remaining_budget ?? (campaign as any)?.budget ?? 0,
                    ),
                  )}{" "}
                  GEN
                </Gold>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold">Review requirements</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {String(campaign?.review_criteria ?? "—")}
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => void onClose()}
              disabled={closing}
              className="mt-7 rounded-full border border-danger/40 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/8 disabled:opacity-60"
            >
              {closing ? "Closing…" : "Close campaign & refund remaining"}
            </button>
          )}
        </section>

        <section className="glass-card p-7">
          <h3 className="text-lg font-semibold">Submit your review</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cover what the campaign asks for. Your review is evaluated against the
            campaign's criteria by GenLayer's validators.
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
            disabled={!client || stage === "submitting" || stage === "checking" || !reviewText.trim()}
            className="gradient-brand mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {stage === "submitting" && <Loader2 size={16} className="animate-spin" />}
            {stage === "submitting" ? "Submitting review…" : "Submit review"}
          </button>

          {stage === "checking" && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/70 p-4 text-sm">
              <Loader2 size={16} className="animate-spin text-primary" />
              Checking… validators are evaluating your review against the criteria.
              This step takes a little longer.
            </div>
          )}

          {stage === "done" && verdict && (
            <div
              className={`mt-5 rounded-xl p-5 ${
                accepted ? "bg-success/8" : "bg-danger/8"
              }`}
            >
              <p
                className={`flex items-center gap-2 font-semibold ${
                  accepted ? "text-success" : "text-danger"
                }`}
              >
                {accepted ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {accepted ? "Accepted" : "Rejected"}
              </p>
              {verdict.reason && (
                <p className="mt-2 text-sm text-muted-foreground">{String(verdict.reason)}</p>
              )}
              {accepted && (
                <p className="mt-3 text-sm">
                  Paid{" "}
                  <Gold>
                    {weiToGen(
                      String(
                        verdict.reward_paid ?? campaign?.reward_per_review ?? 0,
                      ),
                    )}{" "}
                    GEN
                  </Gold>
                </p>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </section>
      </div>
    </div>
  );
}

function CreateCampaign({
  client,
  onCreated,
}: {
  client: GenClient | null;
  onCreated: () => void;
}) {
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
  const [hash, setHash] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
    setHash(null);
    try {
      const res = await createCampaign(client, form);
      setHash(res.hash as string);
      setTimeout(onCreated, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border border-border bg-white/80 p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/40";

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
            <Gold>{form.rewardPerReviewGen} GEN</Gold> each, first-come first-served,
            until the budget runs out.
          </p>
        )}

        <button
          onClick={() => void submit()}
          disabled={!client || busy || !form.productName || !form.reviewCriteria}
          className="gradient-brand flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Funding campaign…" : "Fund & launch campaign"}
        </button>

        {!client && (
          <p className="text-sm text-muted-foreground">
            Connect a wallet above to launch a campaign.
          </p>
        )}
        {hash && (
          <p className="text-sm text-success">Campaign created. Tx {shorten(hash)}</p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Amounts are entered in GEN and converted once, explicitly, before the
        transaction is sent. <Link to="/" hash="about" className="underline">How evaluation works</Link>
      </p>
    </div>
  );
}
