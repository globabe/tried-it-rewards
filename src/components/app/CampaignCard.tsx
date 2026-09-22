import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { weiToGen, type Campaign } from "@/lib/triedit-client";

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
