# TriedIt

**Try it. Review it. Get paid.**

TriedIt is a product-testing and review marketplace built on a GenLayer
Intelligent Contract. A project owner funds a campaign with GEN and
states exactly what a genuine review should cover. Reviewers try the
product and submit their own review. GenLayer's LLM leader/validator
consensus evaluates each submission against the stated criteria —
accepted reviews are paid instantly, first-come-first-served, until the
campaign's budget runs out.

**Live app:** https://tried-it-rewards.lovable.app
**Deployed contract:** `0x986E3E616Bda3ae0aaD457Ed9e0986DD6C6311B4`
**Network:** GenLayer Studio-dev (chain ID `61997`)

---

## The problem

Product feedback is usually either unstructured (generic star ratings
that don't say anything useful) or unpaid (asking people to test
something for free gets you silence). TriedIt lets a project owner
define *exactly* what a useful review should cover, back it with a real
reward, and have every submission checked against those criteria
automatically — no manual moderation queue, no guessing whether a
review is genuine.

## How it works

1. **A project owner launches a campaign** — product name, a link to
   try it, and a plain-language description of what a genuine review
   should mention. They fund it with GEN, which is held in escrow by
   the contract.
2. **Reviewers try the product and submit their own review.** No one
   reviews on someone else's behalf.
3. **GenLayer's validators evaluate the review independently** against
   the campaign's stated criteria and must reach consensus before a
   verdict is final.
4. **Accepted reviews are paid instantly** in GEN, straight from the
   campaign's escrowed budget. Rejected reviews get a stated reason and
   the reviewer can try again with a better one.

## What GenLayer actually does here

This isn't LLM-as-a-gimmick — GenLayer's consensus mechanism is doing
real, load-bearing work in two places:

- **Judgment consensus:** every review is judged independently by
  multiple validators running different models; a verdict only finalizes
  when they agree. This is a genuine safeguard against one biased or
  hallucinating model deciding a payout.
- **Fact-checking against real evidence:** where a campaign provides a
  fetchable reference page, the contract retrieves the actual page
  content at judgment time (via GenLayer's non-deterministic web access)
  and checks specific claims in the review against it — catching reviews
  that name plausible-sounding but fabricated details.

## Key design decisions (and why)

- **Fixed reward per accepted review, not a pooled split.** Every
  accepted review earns the exact amount the owner set, paid
  immediately. This keeps the incentive simple and immediate rather than
  making reviewers wait for a campaign to end to find out if they were
  paid.
- **A wallet is only locked out of a campaign once it's actually been
  paid.** A rejected review doesn't burn your one shot — you can read
  the reason and submit a better review. Only an actual payout prevents
  a second submission, since that's the only thing that needs
  protecting against (double payout).
- **A separate, optional "evidence link" field**, hidden from reviewers,
  lets an owner point fact-checking at a static reference page (like a
  GitHub README) when the product's own live link is a JS-rendered app
  that doesn't fetch usefully. The product link itself always stays the
  real, clickable link reviewers use to try the product.
- **GEN/wei handling is centralized and explicit.** All GEN-to-wei
  conversion happens in one place in the client code — this was a real
  bug we hit and fixed during development (see Known Limitations).

## Tech stack

- **Contract:** Python, GenLayer Intelligent Contracts (GenVM,
  Consensus v0.6)
- **Frontend:** React, built with [Lovable](https://lovable.dev)
- **Chain integration:** genlayer-js

## Known limitations & roadmap

Being upfront about what isn't fully solved yet:

- **Fact-checking works best against static, server-rendered pages.**
  JS-heavy single-page apps don't always fetch reliably for evidence
  checking — the contract falls back gracefully to judging on stated
  criteria alone when a fetch is unavailable or looks unreliable, rather
  than guessing.
- **Sybil resistance is partial.** The contract prevents a single wallet
  from being paid twice on the same campaign, but nothing stops someone
  from funding multiple separate wallets. Full protection would need
  something like reviewer staking or reputation, which isn't built yet.
- **No true privacy for review content.** Review text is stored on
  chain; the app only *displays* it selectively (e.g. to the campaign
  owner), which isn't the same as it being actually private.

## Development

This project was built with [Lovable](https://lovable.dev). To work on
it locally:

```
git clone <this-repository-url>
cd tried-it-rewards
npm i
npm run dev
```

Continue developing in the [Lovable editor](https://lovable.dev/projects/b63acb75-517e-4ac2-a76d-1f867e81c340)
— changes made there sync straight back to this repository.

---


