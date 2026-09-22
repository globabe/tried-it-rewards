// Confirmed against https://docs.genlayer.com/developers/consensus-v06-migration
// - Studio-dev = chain ID 61997, RPC https://studio-dev.genlayer.com/api.
//   Use `studioDevnet` from genlayer-js/chains - never `studionet`.
// - Every write needs a real FeesDistribution + quoted fee value.
// - Writes that move GEN wait for FINALIZED, not just ACCEPTED.
// - GEN/wei conversion happens ONLY here, explicitly, via genToWei().
import { createClient, createAccount } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

export const CONTRACT_ADDRESS = "0xCB4fa495eCade39ecd216D135254Be1b352C74A2";

export type GenClient = ReturnType<typeof createClient>;

export function makeClient(privateKey: string): GenClient {
  const account = createAccount(privateKey as `0x${string}`);
  return createClient({ chain: studioDevnet, account });
}

export function generatePrivateKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
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

export type Campaign = {
  id?: number | string;
  product_name?: string;
  product_link?: string;
  product_image_url?: string;
  review_criteria?: string;
  reward_per_review?: string | number;
  remaining_budget?: string | number;
  owner?: string;
  is_open?: boolean;
  [key: string]: unknown;
};

export type Verdict = {
  accepted?: boolean;
  reason?: string;
  reward_paid?: string | number;
  [key: string]: unknown;
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

export async function getCampaign(client: GenClient, campaignId: number) {
  return parse<Campaign>(await readOnly(client, "get_campaign", [campaignId]));
}

export async function getCampaignCount(client: GenClient) {
  const raw = await readOnly(client, "get_campaign_count", []);
  return parseInt(String(raw), 10) || 0;
}

export async function closeCampaign(client: GenClient, campaignId: number) {
  return writeAndWait(client, "close_campaign", [campaignId]);
}

export async function submitReview(
  client: GenClient,
  campaignId: number,
  reviewText: string,
) {
  return writeAndWait(client, "submit_review", [campaignId, reviewText]);
}

export async function checkReview(client: GenClient, reviewId: number) {
  return writeAndWait(client, "check_review", [reviewId]);
}

export async function getVerdict(client: GenClient, reviewId: number) {
  return parse<Verdict>(await readOnly(client, "get_verdict", [reviewId]));
}

export async function getReviewCount(client: GenClient) {
  const raw = await readOnly(client, "get_review_count", []);
  return parseInt(String(raw), 10) || 0;
}
