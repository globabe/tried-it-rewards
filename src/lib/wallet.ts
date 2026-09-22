// Browser wallet (MetaMask / Rabby / any EIP-1193 injected wallet) connection
// for GenLayer Studio-dev. No private keys are ever handled by this app.

export const STUDIO_DEV_CHAIN_ID = 61997;
export const STUDIO_DEV_CHAIN_ID_HEX = "0xf22d"; // 61997
export const STUDIO_DEV_RPC = "https://studio-dev.genlayer.com/api";

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
  providers?: Eip1193Provider[];
  isMetaMask?: boolean;
};

export function getProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as any).ethereum as Eip1193Provider | undefined;
  if (!eth) return null;
  // Multiple wallets injected: prefer MetaMask, otherwise the first one.
  if (eth.providers?.length) {
    return eth.providers.find((p) => p.isMetaMask) ?? eth.providers[0]!;
  }
  return eth;
}

const CHAIN_PARAMS = {
  chainId: STUDIO_DEV_CHAIN_ID_HEX,
  chainName: "GenLayer Studio-dev",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: [STUDIO_DEV_RPC],
};

/** Ask the wallet to switch to GenLayer Studio-dev, adding it if unknown. */
export async function ensureStudioDevNetwork(provider: Eip1193Provider) {
  const current: string = await provider.request({ method: "eth_chainId" });
  if (current?.toLowerCase() === STUDIO_DEV_CHAIN_ID_HEX) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: STUDIO_DEV_CHAIN_ID_HEX }],
    });
  } catch (err: any) {
    // 4902 = chain not added to the wallet yet.
    if (err?.code === 4902 || err?.data?.originalError?.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [CHAIN_PARAMS],
      });
    } else {
      throw err;
    }
  }
}

/** Prompt the wallet for accounts + the right network. Returns the address. */
export async function connectWallet(): Promise<{
  address: `0x${string}`;
  provider: Eip1193Provider;
}> {
  const provider = getProvider();
  if (!provider) {
    throw new Error(
      "No browser wallet detected. Install MetaMask (or another EVM wallet) and try again.",
    );
  }
  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.length) throw new Error("No account was shared by your wallet.");
  await ensureStudioDevNetwork(provider);
  return { address: accounts[0] as `0x${string}`, provider };
}

/** Silent check for an already-authorized account (no popup). */
export async function getConnectedAddress(): Promise<`0x${string}` | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const accounts: string[] = await provider.request({ method: "eth_accounts" });
    return (accounts?.[0] as `0x${string}`) ?? null;
  } catch {
    return null;
  }
}

export async function getChainId(): Promise<number | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const id: string = await provider.request({ method: "eth_chainId" });
    return parseInt(id, 16);
  } catch {
    return null;
  }
}
