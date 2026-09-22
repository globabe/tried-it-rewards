import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  STUDIO_DEV_CHAIN_ID,
  connectWallet,
  ensureStudioDevNetwork,
  getChainId,
  getConnectedAddress,
  getProvider,
} from "./wallet";
import { makeReadClient, makeWalletClient, type GenClient } from "./triedit-client";

// Set when the visitor presses Disconnect, so we don't silently reconnect
// on the next page load (browser wallets keep the site authorized).
const DISCONNECTED_KEY = "triedit.disconnected";

type WalletState = {
  address: string;
  chainId: number | null;
  wrongNetwork: boolean;
  connecting: boolean;
  error: string;
  /** Signing client - null until connected on Studio-dev. */
  client: GenClient | null;
  /** Always available, for browsing without a wallet. */
  readClient: GenClient;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const disconnected = localStorage.getItem(DISCONNECTED_KEY) === "1";
    if (!disconnected) {
      getConnectedAddress().then((a) => alive && setAddress(a ?? ""));
    }
    getChainId().then((id) => alive && setChainId(id));

    const provider = getProvider();
    const onAccounts = (accounts: string[]) => {
      if (localStorage.getItem(DISCONNECTED_KEY) === "1") return;
      setAddress(accounts?.[0] ?? "");
    };
    const onChain = (hex: string) => setChainId(parseInt(hex, 16));
    provider?.on?.("accountsChanged", onAccounts);
    provider?.on?.("chainChanged", onChain);
    return () => {
      alive = false;
      provider?.removeListener?.("accountsChanged", onAccounts);
      provider?.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    setError("");
    setConnecting(true);
    try {
      const { address: addr } = await connectWallet();
      localStorage.removeItem(DISCONNECTED_KEY);
      setAddress(addr);
      setChainId(await getChainId());
    } catch (err: any) {
      setError(err?.message ?? "Could not connect your wallet.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    localStorage.setItem(DISCONNECTED_KEY, "1");
    setAddress("");
    setError("");
    // Best effort: MetaMask and some others support revoking the site's access.
    try {
      await getProvider()?.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch {
      /* not supported by this wallet - app-side disconnect is enough */
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    setError("");
    const provider = getProvider();
    if (!provider) return;
    try {
      await ensureStudioDevNetwork(provider);
      setChainId(await getChainId());
    } catch (err: any) {
      setError(err?.message ?? "Could not switch network.");
    }
  }, []);

  const wrongNetwork = Boolean(address) && chainId !== null && chainId !== STUDIO_DEV_CHAIN_ID;

  const client = useMemo(
    () => (address && !wrongNetwork ? makeWalletClient(address) : null),
    [address, wrongNetwork],
  );
  const readClient = useMemo(() => makeReadClient(), []);

  const value: WalletState = {
    address,
    chainId,
    wrongNetwork,
    connecting,
    error,
    client,
    readClient,
    connect,
    disconnect,
    switchNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function shortenAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
