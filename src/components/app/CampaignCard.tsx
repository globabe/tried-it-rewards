import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { weiToGen, type Campaign, type Verdict } from "@/lib/triedit-client";

export function Gold({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-gold">{children}</span>;
}

export function StatusBadge({ closed }: { closed: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
        closed ? "bg-muted text-muted-foreground" : "bg-success/12 text-success"
      }`}
    >
      {closed ? "Closed" : "Open"}
    </span>
  );
}

export function CampaignCard({
  campaign,
  mine = false,
}: {
  campaign: Campaign;
  mine?: boolean;
}) {
  return (
    <Link
      to="/app"
      search={{ campaign: campaign.campaign_id }}
      className="glass-card glass-card-hover block overflow-hidden p-0 text-left"
    >
      <div className="gradient-brand relative flex h-32 w-full items-center justify-center overflow-hidden">
        {campaign.product_image_url ? (
          <img
            src={campaign.product_image_url}
            alt={campaign.product_name}
            className="h-full w-full bg-white/90 object-contain p-6"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        {mine && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-medium text-background">
            Your project
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{campaign.product_name}</h3>
          <StatusBadge closed={campaign.closed} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {campaign.review_criteria}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span>
            Reward <Gold>{weiToGen(campaign.reward_per_review)} GEN</Gold>
          </span>
          <span className="text-muted-foreground">
            Left <Gold>{weiToGen(campaign.remaining_budget)} GEN</Gold>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function VerdictPanel({ verdict, campaign }: { verdict: Verdict; campaign: Campaign | null }) {
  if (verdict.status === "not_checked") {
    return (
      <div className="mt-5 rounded-xl bg-white/70 p-4 text-sm text-muted-foreground">
        Not evaluated yet.
      </div>
    );
  }
  const accepted = verdict.accepted === true;
  return (
    <div className={`mt-5 rounded-xl p-5 ${accepted ? "bg-success/8" : "bg-danger/8"}`}>
      <p className={`flex items-center gap-2 font-semibold ${accepted ? "text-success" : "text-danger"}`}>
        {accepted ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        {accepted ? "Accepted" : "Rejected"}
      </p>
      {verdict.reason && <p className="mt-2 text-sm text-muted-foreground">{verdict.reason}</p>}
      {accepted && (
        <p className="mt-3 text-sm">
          {verdict.paid && campaign ? (
            <>
              Paid <Gold>{weiToGen(campaign.reward_per_review)} GEN</Gold>
            </>
          ) : (
            "Accepted, but the campaign's budget had run out — no payout."
          )}
        </p>
      )}
    </div>
  );
}
