# TriedIt Review Hub

im also attaching TriedIt logo that you will use.   Build TriedIt

TriedIt is a product-testing and review marketplace built on a GenLayer Intelligent Contract. A project owner funds a campaign with GEN and states exactly what a genuine review should cover. Reviewers try the product and submit their own structured review. GenLayer's LLM leader/validator consensus evaluates each review against the stated criteria — accepted reviews get paid a fixed reward immediately (first-come, first-served) until the campaign's budget runs out.

Core loop: Try it. Review it. Get paid.

Deployed contract address: 0xCB4fa495eCade39ecd216D135254Be1b352C74A2 Network: GenLayer Studio-dev (chain ID 61997, RPC https://studio-dev.genlayer.com/api)

Contract methods:

create_campaign(product_name, product_link, product_image_url, review_criteria, reward_per_review: u256) -> campaign_id — payable, funds the campaign

get_campaign(campaign_id) -> campaign JSON (free view)

get_campaign_count() -> string count (free view — loop 0 to count-1 to list all campaigns; there's no on-chain array to fetch directly)

close_campaign(campaign_id) — owner-only, refunds whatever's left

submit_review(campaign_id, review_text) -> review_id

check_review(review_id) -> verdict JSON — triggers judgment, pays out on accept if budget allows

get_verdict(review_id) -> verdict JSON (free view)

get_review_count() -> string count (free view, same loop pattern)

THE ONE RULE THAT WILL BREAK THIS APP IF IGNORED

GEN uses 18 decimals, same as ETH/wei. We hit a real, confirmed bug building this: Studio's own UI auto-converts a plain GEN number typed into the dedicated "value" field into wei, but does NOT do this for any other numeric argument (like reward_per_review) — those are taken literally as wei. Typing the same "human" number into both fields produces wildly different real amounts, and typing a wei-sized number into the auto-converting value field compounds the conversion into an astronomical, meaningless amount (this genuinely happened in testing and drained a test wallet).

The fix for this app: never rely on any implicit conversion, anywhere, in the frontend. Every place a human enters a GEN amount, convert it to wei explicitly using the genToWei() helper in the integration code below, and pass the resulting wei value everywhere — both to the write call's value field AND to the reward_per_review argument. Show users plain GEN numbers in the UI (e.g. "0.1 GEN"); do the wei math only right before sending the transaction.

All amounts on this site are in GEN, never USD. The contract only ever moves GEN. Don't invent dollar figures anywhere in the copy or mockups.

Payout mechanism — be precise about this, it's not a pool split. Each accepted review earns the exact reward_per_review amount set by the project owner, paid out immediately, first-come-first-served, until the campaign's budget is exhausted. It is NOT a total pool divided evenly among however many reviews get accepted at the end — don't write copy implying an "average reward" or a final proportional split.

Don't overclaim what evaluation proves. GenLayer's validators judge whether the submitted review text shows genuine, specific engagement with the stated criteria — they do not independently verify that the person physically used the product (there's no usage-tracking mechanism). Say "evaluated against the campaign's criteria," not "verified you used it" or similar language implying proof of usage.

Brand

Name: TriedIt Primary tagline: Try it. Review it. Get paid. Secondary line: Real experiences. Real rewards.

Use the TriedIt logo (provided separately) as the visual brand reference — a purple-to-magenta gradient mark. Build the entire visual system around it.

Visual direction

Premium, modern SaaS/Web3 aesthetic — clean, trustworthy, spacious, editorial rather than crypto-template. This is a full swap from a generic "AI app" look:

Color tokens (derived from the logo):

#FAF8FF — near-white background with a faint lavender tint

#171426 — near-black navy for text

Card surfaces: translucent white (rgba(255,255,255,0.6)) with backdrop blur and a hairline border (rgba(255,255,255,0.4)) — glassmorphism used only on cards/panels, not the whole page

Primary accent: gradient from #6B3FA0 (purple) to #E0399B (magenta), matching the logo — used for primary buttons, the hero visual, and key highlights

Accepted/success state: #1F9D6B, a clean confident emerald — ONLY for accepted-review states

Rejected state: #D6483C, a clean coral-red — ONLY for rejected states

Reward/money highlight: #B8862E, a warm gold — ONLY for actual GEN amounts (reward badges, remaining budget, payout confirmations), kept visually distinct from the brand purple so money is always unambiguous wherever it appears

Type: Inter or Geist throughout — clean grotesk, no serif. Bold weights for headlines, regular/medium for body.

Style: Generous whitespace, rounded cards with soft shadows, subtle hover elevation, polished micro-interactions, smooth scroll, gentle entrance animations. Avoid: neon, excessive gradients, coin/token imagery, generic stock photography, walls of text, overusing rounded pill shapes, turning every section into an identical card grid.

Navigation

Sticky navbar with subtle background blur on scroll.

Left: TriedIt logo

Center/left links: Explore Projects · How It Works · For Projects · About

Right: Connect Wallet, and a primary CTA button: Launch a Project

Hero section

Headline: Try it. Review it. Get paid.

Subheadline: TriedIt connects products that need real feedback with people willing to test them. Follow the requirements, share what you actually experienced, and get paid the moment your review is accepted — no waiting on a human to approve it.

Primary CTA: Explore Projects Secondary CTA: Launch a Project

Trust line below the buttons: Structured reviews · Consensus-evaluated · Instant payout in GEN

Hero visual: a floating app-interface mockup beside the hero text, showing the real workflow with real data from actual testing — not a fictional example:

PROJECT
"Genlayer Portal"

  |
  v

REQUIREMENTS
Review must mention a specific feature you used
and whether it worked as expected.

  |
  v

YOUR REVIEW
"I used the wallet connection flow to fund a test
contract - it worked smoothly and the transaction
confirmed within seconds."

  |
  v

EVALUATION
Requirements checked by GenLayer validators

  |
  v

REWARD
+0.1 GEN


Animate this subtly on load (fade/step through the stages), not continuously looping.

How TriedIt Works

Heading: Real products. Real testing. Real feedback.

Four numbered steps (this is a genuinely sequential process, so numbering fits):

01 — Pick a project. Browse products and projects looking for testers.

02 — Try it. Use the product and follow the stated testing requirements.

03 — Submit your review. Share what you actually experienced, covering what the campaign asks for.

04 — Get paid. Your review is evaluated by GenLayer's validators against the campaign's criteria. Accepted reviews are paid instantly in GEN.

Subtle scroll-triggered animation through the four steps.

For Reviewers

Heading: Your experience is worth something.

Reviewers can:

Discover products looking for testers

Choose projects that interest them

Follow clear, stated review requirements

Submit their own honest, specific review

Get paid instantly in GEN when their review is accepted

Marketplace mockup with campaign cards. Use the real deployed campaign as one card, plus 2-3 plausible additional examples clearly built in the same style (mark any non-real card as illustrative if needed):

Genlayer Portal
Test the GenLayer Portal wallet and contract flow

Reward per review: 0.1 GEN
Requirements: 1 (must mention a specific feature and whether it worked)

[ Try Project ]


Button: Try Project

For Project Owners

Heading: Stop guessing what users think. Subheading: Give testers clear instructions. Get structured feedback, paid only when it's genuine.

Project owners can:

Create a testing campaign

Define exactly what a genuine review should cover

Fund a reward pool in GEN

Set the reward per accepted review

Receive structured, evaluated feedback — and reclaim whatever's left, anytime

CTA: Launch a Project

Dashboard mockup:

Project: Genlayer Portal
Funded: 5.0 GEN
Reward per accepted review: 0.1 GEN
Remaining budget: 4.9 GEN

Review Requirements:
- Mention a specific feature used
- State whether it worked as expected

Submissions: 2
Accepted: 1


The Evaluation Layer

Heading: Reviews with rules behind them. Subheading: Project owners define what a useful review should contain. GenLayer's validators evaluate submissions against those requirements — independently, and they have to agree.

Visual flow:

PROJECT CRITERIA
"Review must mention a specific feature you used
and whether it worked as expected."

  |
  v

SUBMITTED REVIEW

  |
  v

GENLAYER VALIDATORS
(multiple independent checks, must reach consensus)

  |
  v

ACCEPTED or REJECTED, with a stated reason


Small explanation directly beneath: GenLayer's validators evaluate whether a review shows genuine, specific engagement with the stated criteria — independently, with consensus required before a review is accepted or a reward is paid. Avoid any wording implying GenLayer independently proves the reviewer physically used the product; it evaluates the review's content against the criteria.

Small link: "Learn about GenLayer"

Reward mechanism

Heading: Good feedback gets paid, the moment it's accepted.

Visual:

Project owner funds a campaign in GEN
and sets a reward per accepted review

  |
  v

Testers submit reviews

  |
  v

Each review is evaluated

  |
  v

Accepted reviews are paid instantly,
first-come first-served, until the
campaign's budget runs out


Example (real data): 0.5 GEN campaign budget, 0.1 GEN per accepted review — up to 5 reviews can be paid before the campaign is exhausted. Make clear this is a fixed amount per accepted review, not a pool split proportionally among all submissions.

Example campaign (real data, not a mockup)

Large interactive campaign card using the actual tested campaign:

Project: Genlayer Portal
Reward per review: 0.1 GEN
Requirements:
  - Mention a specific feature you used
  - State whether it worked as expected

[ View Project ]


Beside it, the actual submitted review and result:

"I used the wallet connection flow to fund a test contract - it worked smoothly and the transaction confirmed within seconds."

Evaluation panel:

Campaign requirements
[check] Mentions a specific feature
[check] States whether it worked as expected

Status: Accepted - 0.1 GEN paid


This is real, not a demo — no need to caveat it as illustrative.

Trust section

Heading: Built for useful feedback, not empty ratings.

Three feature cards:

Structured — Every campaign defines exactly what testers should evaluate and answer.

Transparent — Requirements and reward amounts are visible before anyone tests anything.

Evaluated — Every submission is checked against the campaign's stated criteria by multiple independent validators before payout.

Final CTA

Large section, subtle purple-to-magenta gradient background.

Headline: Someone needs to try your product. Subheadline: And someone out there is ready to give you honest feedback.

Buttons: Explore Projects / Launch a Project

Small line underneath: TriedIt — Real experiences. Real rewards.

Footer

TriedIt logo, tagline "Try it. Review it. Get paid."

Links: Explore Projects · How It Works · For Projects · About · Docs · Terms · Privacy Social: X · Discord · GitHub

UX details

Responsive across desktop/tablet/mobile. Smooth scrolling, subtle entrance animations, polished button hover states, subtle card hover elevation. The hero visual should animate gently on load, not loop continuously. Editorial and spacious — avoid making every section an identical card grid.

App page (/app) structure

Wallet connection at the top, above everything else.

Browse view: grid of campaign cards (product image, name, reward per review in GEN, remaining budget in GEN, open/closed status) — built by looping get_campaign_count() and calling get_campaign(id) for each; there's no stored list to fetch directly.

Campaign detail view: full criteria text, product link, a review submission box, and (if the visitor is the campaign owner) a "close campaign" button.

Create campaign view: form for product name/link/image URL, review criteria, reward per review (GEN), total funding amount (GEN) — convert both to wei per the rule above before submitting.

After submitting a review, show a "checking..." state while check_review runs (slower — it's the LLM judgment step), then show the verdict clearly, with the reward amount in the gold accent color if paid.

Integration code

triedit-client.js

// Confirmed against https://docs.genlayer.com/developers/consensus-v06-migration
// and against real testing of this exact contract:
// - Studio-dev = chain ID 61997, RPC https://studio-dev.genlayer.com/api.
//   Use `studioDevnet` from genlayer-js/chains - never `studionet`
//   (that's stable Studio, chain ID 61999, a different deployment).
// - Every write needs a real FeesDistribution + quoted fee value from
//   a current estimate, submitted as fees: { distribution, feeValue }.
// - For any write that moves GEN (create_campaign, check_review,
//   close_campaign), wait for FINALIZED specifically, not just
//   ACCEPTED - value transfers are only guaranteed to have executed
//   once a transaction is FINALIZED.
// - GEN/wei conversion is done ENTIRELY in this file, explicitly, with
//   genToWei(). Never rely on any UI or SDK auto-conversion - we
//   confirmed firsthand that Studio's UI value field silently
//   auto-converts a typed GEN number while other numeric arguments do
//   not, and mixing the two produces wildly wrong amounts.

import { createClient, createAccount } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const CONTRACT_ADDRESS = "0xCB4fa495eCade39ecd216D135254Be1b352C74A2";

let _client = null;

export function getClient(privateKey) {
  if (_client) return _client;
  const account = createAccount(privateKey);
  _client = createClient({ chain: studioDevnet, account });
  return _client;
}

/**
 * Convert a human GEN amount (number or string, e.g. 0.1) to wei as a
 * BigInt, using string-based decimal scaling to avoid floating-point
 * precision loss. This is the ONLY place GEN-to-wei conversion should
 * happen in the whole app.
 */
export function genToWei(genAmount) {
  const [whole, frac = ""] = String(genAmount).split(".");
  const fracPadded = (frac + "0".repeat(18)).slice(0, 18);
  return BigInt(whole || "0") * 10n ** 18n + BigInt(fracPadded || "0");
}

/** Convert wei (BigInt or numeric string) back to a display GEN string. */
export function weiToGen(weiAmount) {
  const wei = BigInt(weiAmount);
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

async function writeAndWait(client, functionName, args, value = 0n) {
  const estimate = await client.estimateTransactionFees({
    leaderTimeunitsAllocation: 100n,
    validatorTimeunitsAllocation: 200n,
    rotations: [0n],
  });

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    value,
    fees: {
      distribution: estimate.distribution,
      feeValue: estimate.feeValue,
    },
  });

  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    retries: 60,
    interval: 2000,
  });

  const executionStatus =
    receipt?.data?.execution_result ?? receipt?.execution_result;
  if (executionStatus && executionStatus !== "FINISHED_WITH_RETURN") {
    throw new Error(
      `Transaction ${hash} did not finish successfully: ${executionStatus}`
    );
  }

  return { hash, receipt };
}

function readOnly(client, functionName, args = []) {
  return client.readContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    stateStatus: "accepted",
  });
}

// ---------- Public API ----------

export async function createCampaign(client, opts) {
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
    budgetWei
  );
}

export async function getCampaign(client, campaignId) {
  const raw = await readOnly(client, "get_campaign", [campaignId]);
  return JSON.parse(raw);
}

export async function getCampaignCount(client) {
  const raw = await readOnly(client, "get_campaign_count", []);
  return parseInt(raw, 10);
}

export async function closeCampaign(client, campaignId) {
  return writeAndWait(client, "close_campaign", [campaignId]);
}

export async function submitReview(client, campaignId, reviewText) {
  return writeAndWait(client, "submit_review", [campaignId, reviewText]);
}

export async function checkReview(client, reviewId) {
  return writeAndWait(client, "check_review", [reviewId]);
}

export async function getVerdict(client, reviewId) {
  const raw = await readOnly(client, "get_verdict", [reviewId]);
  return JSON.parse(raw);
}

export async function getReviewCount(client) {
  const raw = await readOnly(client, "get_review_count", []);
  return parseInt(raw, 10);
}


Build the React pages (landing + /app browse/detail/create views) around these functions per the structure above - restructure freely, but keep every GEN amount passing through genToWei/weiToGen and never re-introduce a manual wei-typed input field anywhere in the UI.

Reference: Consensus v0.6 migration notes

Studio-dev is chain ID 61997, RPC https://studio-dev.genlayer.com/api. Use studioDevnet from genlayer-js/chains - never studionet (chain ID 61999, a different deployment).

Every write needs a FeesDistribution + quoted fee value from client.estimateTransactionFees(...), submitted as fees: { distribution, feeValue }.

Any write that moves GEN must be confirmed at FINALIZED, not just ACCEPTED, before trusting the result.

Full doc: https://docs.genlayer.com/developers/consensus-v06-migration

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b63acb75-517e-4ac2-a76d-1f867e81c340).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
