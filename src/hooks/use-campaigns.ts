import { useCallback, useEffect, useState } from "react";
import { listCampaigns, type Campaign } from "@/lib/triedit-client";
import { useWallet } from "@/lib/wallet-context";

export function useCampaignList() {
  const { readClient } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await listCampaigns(readClient));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [readClient]);

  useEffect(() => {
    void load();
  }, [load]);

  return { campaigns, loading, error, reload: load };
}
