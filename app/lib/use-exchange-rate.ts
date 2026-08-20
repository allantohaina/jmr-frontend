import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.jmrtextile.com/api";

type ExchangeRateData = {
  base: string;
  rates: Record<string, number>;
  date: string;
  fetched_at: string;
};

type UseExchangeRateResult = {
  rates: Record<string, number> | null;
  date: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useExchangeRate(base = "USD", symbols = "MGA,EUR"): UseExchangeRateResult {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/exchange-rates?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ExchangeRateData = await res.json();
      setRates(data.rates);
      setDate(data.date);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to fetch rates";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [base, symbols]);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  return { rates, date, isLoading, error, refresh: fetchRates };
}
