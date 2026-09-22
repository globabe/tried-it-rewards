// Confirmed against https://docs.genlayer.com/developers/consensus-v06-migration
// - Studio-dev = chain ID 61997, RPC https://studio-dev.genlayer.com/api.
//   Use `studioDevnet` from genlayer-js/chains - never `studionet`.
// - Every write needs a real FeesDistribution + quoted fee value.
// - Writes that move GEN wait for FINALIZED, not just ACCEPTED.
// - GEN/wei conversion happens ONLY here, explicitly, via genToWei().
import { createClient } from "genlayer-js";
import { getProvider } from "./wallet";
import { studioDevnet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export { studioDevnet };

export const CONTRACT_ADDRESS = "0xf57457DbF1828229627b3F73aCC4C54C3FcA7BC8";

export type GenClient = ReturnType<typeof createClient>;

/**
 * Signing client backed by the visitor's browser wallet (MetaMask, Rabby, ...).
 * The wallet holds the key and signs every transaction - the app never sees it.
 */
export function makeWalletClient(address: string): GenClient {
  const provider = getProvider();
  if (!provider) throw new Error("No browser wallet detected.");
  return createClient({
    chain: studioDevnet,
    account: address as `0x${string}`,
    provider,
  } as any);
}

/** Read-only client - lets anyone browse campaigns before connecting. */
export function makeReadClient(): GenClient {
  return createClient({ chain: studioDevnet } as any);
}

/** Human GEN amount -> wei BigInt. The only GEN->wei conversion in the app. */
export function genToWei(genAmount: string | number): bigint {
  const [whole, frac = ""] = String(genAmount).trim().split(".");
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  return BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
}

/** wei -> display GEN string. */
export function weiToGen(weiAmount: bigint | string | number): string {
  const wei = BigInt(weiAmount ?? 0);
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n)
    .toString()
    .padStart(18, "0")
    .replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

async function writeAndWait(
  client: GenClient,
  functionName: string,
  args: unknown[],
  value: bigint = 0n,
) {
  const estimate = await (client as any).estimateTransactionFees({
    leaderTimeunitsAllocation: 100n,
    validatorTimeunitsAllocation: 200n,
    rotations: [0n],
  });

  const hash = await (client as any).writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    value,
    fees: { distribution: estimate.distribution, feeValue: estimate.feeValue },
  });

  const receipt: any = await (client as any).waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    retries: 60,
    interval: 2000,
  });

  const executionStatus =
    receipt?.data?.execution_result ?? receipt?.execution_result;
  if (executionStatus && executionStatus !== "FINISHED_WITH_RETURN") {
    throw new Error(
      `Transaction ${hash} did not finish successfully: ${executionStatus}`,
    );
  }

  return { hash, receipt };
}

function readOnly(client: GenClient, functionName: string, args: unknown[] = []) {
  return (client as any).readContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    stateStatus: "accepted",
  });
}

// The contract keys everything by string IDs: "campaign_0", "campaign_1", ...
// and "review_0", "review_1", ... (confirmed from the deployed source).
export const campaignKey = (n: number) => `campaign_${n}`;
export const reviewKey = (n: number) => `review_${n}`;

export type Campaign = {
  campaign_id: string;
  owner: string;
  product_name: string;
  product_link: string;
  product_image_url: string;
  review_criteria: string;
  reward_per_review: string; // wei
  total_budget: string; // wei
  remaining_budget: string; // wei
  closed: boolean;
};

export type Verdict = {
  accepted?: boolean;
  reason?: string;
  paid?: boolean;
  status?: "not_checked";
};

function parse<T>(raw: unknown): T {
  return typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);
}

export async function createCampaign(
  client: GenClient,
  opts: {
    productName: string;
    productLink: string;
    productImageUrl: string;
    reviewCriteria: string;
    rewardPerReviewGen: string;
    totalBudgetGen: string;
  },
) {
  const rewardWei = genToWei(opts.rewardPerReviewGen);
  const budgetWei = genToWei(opts.totalBudgetGen);

  return writeAndWait(
    client,
    "create_campaign",
    [
      opts.productName,
      opts.productLink,
      opts.productImageUrl,
      opts.reviewCriteria,
      rewardWei,
    ],
    budgetWei,
  );
}

export async function getCampaign(client: GenClient, campaignId: string) {
  return parse<Campaign>(await readOnly(client, "get_campaign", [campaignId]));
}

export async function getCampaignCount(client: GenClient) {
  const raw = await readOnly(client, "get_campaign_count", []);
  return parseInt(String(raw), 10) || 0;
}

/** No on-chain array: loop 0..count-1 and read each campaign. */
export async function listCampaigns(client: GenClient): Promise<Campaign[]> {
  const count = await getCampaignCount(client);
  const results = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      getCampaign(client, campaignKey(i)).catch(() => null),
    ),
  );
  return results.filter((c): c is Campaign => c !== null).reverse();
}

export async function closeCampaign(client: GenClient, campaignId: string) {
  return writeAndWait(client, "close_campaign", [campaignId]);
}

export async function submitReview(
  client: GenClient,
  campaignId: string,
  reviewText: string,
) {
  return writeAndWait(client, "submit_review", [campaignId, reviewText]);
}

export async function checkReview(client: GenClient, reviewId: string) {
  return writeAndWait(client, "check_review", [reviewId]);
}

export async function getVerdict(client: GenClient, reviewId: string) {
  return parse<Verdict>(await readOnly(client, "get_verdict", [reviewId]));
}

export async function getReviewCount(client: GenClient) {
  const raw = await readOnly(client, "get_review_count", []);
  return parseInt(String(raw), 10) || 0;
}

export type Review = {
  review_id: string;
  campaign_id: string;
  reviewer: string;
  review_text: string;
  verdict: Verdict;
};

/** Full review record: text, campaign, reviewer address and verdict. */
export async function getReview(client: GenClient, reviewId: string) {
  return parse<Review>(await readOnly(client, "get_review", [reviewId]));
}

/** Every review on the contract (loops 0..count-1, no on-chain array). */
export async function listAllReviews(client: GenClient): Promise<Review[]> {
  const count = await getReviewCount(client);
  const results = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      getReview(client, reviewKey(i)).catch(() => null),
    ),
  );
  return results.filter((r): r is Review => r !== null);
}

/**
 * Every review for one campaign. There's no on-chain index by campaign,
 * so this scans all reviews and filters - O(total reviews). Fine at
 * current scale; worth revisiting if review volume grows.
 */
export async function getReviewsForCampaign(client: GenClient, campaignId: string) {
  const all = await listAllReviews(client);
  return all.filter((r) => r.campaign_id === campaignId);
}

// ---------- Reviews submitted from this browser ----------
// The contract has no "reviews by reviewer" lookup, so we remember the
// review IDs a wallet submitted here and read their verdicts from chain.
export type MyReview = {
  reviewId: string;
  campaignId: string;
  productName: string;
  text: string;
  submittedAt: number;
};

const myReviewsKey = (address: string) => `triedit.reviews.${address.toLowerCase()}`;

export function loadMyReviews(address: string): MyReview[] {
  if (typeof window === "undefined" || !address) return [];
  try {
    return JSON.parse(localStorage.getItem(myReviewsKey(address)) ?? "[]");
  } catch {
    return [];
  }
}

export function saveMyReview(address: string, review: MyReview) {
  const list = loadMyReviews(address).filter((r) => r.reviewId !== review.reviewId);
  list.unshift(review);
  localStorage.setItem(myReviewsKey(address), JSON.stringify(list));
}
