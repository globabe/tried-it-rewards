import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

/** Direct, shareable link to a single campaign. */
export function campaignUrl(campaignId: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://tried-it-rewards.lovable.app";
  return `${origin}/app?campaign=${campaignId}`;
}

function shareText(productName: string) {
  return `I just launched "${productName}" on TriedIt — try it, review it, and get paid in GEN when your review is accepted.`;
}

export function xShareUrl(campaignId: string, productName: string) {
  const params = new URLSearchParams({
    text: shareText(productName),
    url: campaignUrl(campaignId),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

async function nativeShare(campaignId: string, productName: string) {
  const nav = navigator as Navigator & {
    share?: (data: { title: string; text: string; url: string }) => Promise<void>;
  };
  if (!nav.share) return false;
  try {
    await nav.share({
      title: `${productName} on TriedIt`,
      text: shareText(productName),
      url: campaignUrl(campaignId),
    });
    return true;
  } catch {
    return false;
  }
}

/** Compact share control: native share sheet where available, copy link otherwise. */
export function ShareButton({
  campaignId,
  productName,
  className = "",
  label = "Share",
}: {
  campaignId: string;
  productName: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (await nativeShare(campaignId, productName)) return;
    try {
      await navigator.clipboard.writeText(campaignUrl(campaignId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={(e) => void onClick(e)}
      title="Copy a direct link to this project"
      className={`flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-white ${className}`}
    >
      {copied ? <Check size={13} className="text-success" /> : <Share2 size={13} />}
      {copied ? "Link copied" : label}
    </button>
  );
}

/** Copyable link row with a copy button. */
export function CopyLinkRow({ campaignId }: { campaignId: string }) {
  const [copied, setCopied] = useState(false);
  const url = campaignUrl(campaignId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex items-stretch gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-xl border border-border bg-white/80 px-3.5 py-2.5 font-mono text-xs outline-none"
      />
      <button
        onClick={() => void copy()}
        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white/70 px-4 text-sm font-medium hover:bg-white"
      >
        {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
