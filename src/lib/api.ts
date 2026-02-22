const API_BASE = "http://localhost:8082";

export interface WalletMetrics {
  transactionCount: number;
  riskLevel: string;
}

export interface TransactionRecord {
  id: string;
  date: string;
  collateral: string;
  percentage: number;
  amount: number;
  status: "completed" | "pending" | "failed";
  txSignature?: string;
}

export interface RiskBlockResponse {
  blockName: string;
  factorRange: string;
  eligibleAssets: string;
  note: string;
  returns: CollateralReturn[];
}

export interface CollateralReturn {
  collateral: string;
  oneMonth: string;
  threeMonth: string;
  sixMonth: string;
  twelveMonth: string;
}

export async function fetchWalletTransactions(address: string): Promise<WalletMetrics> {
  const res = await fetch(`${API_BASE}/api/wallet/${address}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch wallet data");
  return res.json();
}

export async function fetchRiskBlock(profile: "LOW" | "MEDIUM" | "HIGH"): Promise<RiskBlockResponse> {
  const res = await fetch(`${API_BASE}/api/risk/${profile}`);
  if (!res.ok) throw new Error("Failed to fetch risk data");
  return res.json();
}

export async function fetchTransactionHistory(address: string): Promise<TransactionRecord[]> {
  const res = await fetch(`http://localhost:8082/api/wallet/orders?address=${address}`);
  if (!res.ok) throw new Error("Failed to fetch transaction history");
  const data = await res.json();
  const raw = data.transactions || data;
  if (!Array.isArray(raw)) return [];
  return normalizeRecords(raw);
}

export async function fetchWalletOrders(address: string): Promise<TransactionRecord[]> {
  const res = await fetch(`http://localhost:8082/api/wallet/orders?address=${address}`);
  if (!res.ok) throw new Error("Failed to fetch wallet orders");
  const data = await res.json();
  const result = data.orders || data.transactions || data;
  if (!Array.isArray(result)) return [];
  return normalizeRecords(result);
}

// Normalize backend records to the client TransactionRecord shape
function normalizeRecords(items: any[]): TransactionRecord[] {
  return items.map((it) => {
    // backend may use `createdAt`, `fromWalletAddress`, `interestRate`, `riskProfile`
    const date = it.date || it.createdAt || null;
    const collateral = it.collateral || "SOL";
    const percentage = (it.percentage ?? it.interestRate ?? 0) as number;
    const amount = typeof it.amount === "number" ? it.amount : parseFloat(it.amount || "0");
    const status = (it.status as any) || (amount > 0 ? "completed" : "pending");
    return {
      id: it.id?.toString?.() ?? String(Math.random()),
      date,
      collateral,
      percentage,
      amount,
      status,
      txSignature: it.txSignature,
    } as TransactionRecord;
  });
}

export async function postWalletTransactions(requestData: { fromWallet: string; amount: string; riskProfile: string; interestRate: number; }): Promise<TransactionRecord[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    // Convert amount to lamports (integer)
    const amountNum = parseFloat(requestData.amount);
    const amountLamports = Math.floor(amountNum * 1e9);
    
    const res = await fetch(`/build-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...requestData,
        amount: amountLamports.toString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error('Failed to fetch wallet transactions');
    const data = await res.json();
    return data.transactions || data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return MOCK_TRANSACTION_HISTORY;
    }
    throw err;
  }
}

// Mock fallbacks for demo when backend is unavailable
export const MOCK_WALLET_METRICS: WalletMetrics = {
  transactionCount: 847,
  riskLevel: "MEDIUM",
};

export const MOCK_RISK_BLOCK: RiskBlockResponse = {
  blockName: "Tier B — Growth",
  factorRange: "0.45 – 0.70",
  eligibleAssets: "SOL, mSOL, JitoSOL, USDC",
  note: "Eligible for under-collateralized lending up to 1.8x with active DeFi history.",
  returns: [
    { collateral: "SOL", oneMonth: "2.1%", threeMonth: "6.8%", sixMonth: "14.2%", twelveMonth: "31.5%" },
    { collateral: "mSOL", oneMonth: "2.8%", threeMonth: "8.1%", sixMonth: "17.0%", twelveMonth: "36.2%" },
    { collateral: "USDC", oneMonth: "1.2%", threeMonth: "3.6%", sixMonth: "7.4%", twelveMonth: "15.1%" },
  ],
};

export const MOCK_TRANSACTION_HISTORY: TransactionRecord[] = [
  { id: "1", date: "2026-02-20T14:32:00Z", collateral: "SOL", percentage: 25, amount: 2.5, status: "completed", txSignature: "5xG...abc" },
  { id: "2", date: "2026-02-19T09:15:00Z", collateral: "mSOL", percentage: 50, amount: 5.0, status: "completed", txSignature: "3kR...def" },
  { id: "3", date: "2026-02-18T16:45:00Z", collateral: "USDC", percentage: 10, amount: 1.0, status: "pending" },
  { id: "4", date: "2026-02-17T11:20:00Z", collateral: "SOL", percentage: 75, amount: 7.5, status: "failed" },
  { id: "5", date: "2026-02-16T10:00:00Z", collateral: "USDC", percentage: 20, amount: 2.0, status: "completed" },
];
