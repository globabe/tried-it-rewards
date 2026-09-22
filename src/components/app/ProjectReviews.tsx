import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareText, RefreshCw } from "lucide-react";
import { VerdictPanel } from "@/components/app/CampaignCard";
import { getReviewsForCampaign, type Campaign, type Review } from "@/lib/triedit-client";
import { shortenAddress, useWallet } from "@/lib/wallet-context";

export function summarizeReviews(reviews: Review[]) {
  let accepted = 0;
  let rejected = 0;
  let pending = 0;
  for (const r of reviews) {
    if (r.verdict?.status === "not_checked") pending++;
    else if (r.verdict?.accepted) accepted++;
    else rejected++;
  }
  return { total: reviews.length, accepted, rejected, pending };
}

/** Shown on the project page only when the connected wallet owns the project. */
export function ProjectReviews({ campaign }: { campaign: Campaign }) {
  const { readClient } = useWallet();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getReviewsForCampaign(readClient, campaign.campaign_id);
      setReviews(list.reverse());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [readClient, campaign.campaign_id]);

  useEffect(() => {
    void load();
  }, [load]);

  const s = reviews ? summarizeReviews(reviews) : null;

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Reviews on this project</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {s && s.total > 0
              ? `${s.total} review${s.total === 1 ? "" : "s"} · ${s.accepted} accepted · ${s.rejected} rejected${
                  s.pending ? ` · ${s.pending} awaiting evaluation` : ""
                }`
              : "Feedback from testers, with each verdict from GenLayer's validators."}
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-4 py-2 text-sm hover:bg-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="glass-card mb-4 p-5 text-sm text-danger">{error}</div>}

      {loading && !reviews ? (
        <div className="glass-card flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Loading reviews…
        </div>
      ) : reviews && reviews.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <MessageSquareText size={22} />
          No reviews yet. They'll show up here as testers submit them.
        </div>
      ) : reviews ? (
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <article key={r.review_id} className="glass-card p-6">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{shortenAddress(r.reviewer)}</span>
                <span>{r.review_id.replace("review_", "Review #")}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{r.review_text}</p>
              <VerdictPanel verdict={r.verdict} campaign={campaign} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
