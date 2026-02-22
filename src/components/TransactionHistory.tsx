import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Loader2, XCircle, ExternalLink, History } from "lucide-react";
import { fetchTransactionHistory, MOCK_TRANSACTION_HISTORY, type TransactionRecord } from "@/lib/api";
import { NETWORK } from "@/lib/solana";

interface Props {
  walletAddress: string;
}

export default function TransactionHistory({ walletAddress }: Props) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTransactionHistory(walletAddress)
      .then(setTransactions)
      .catch(() => setTransactions(MOCK_TRANSACTION_HISTORY))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  const statusIcon = (status: TransactionRecord["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-accent animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const statusLabel = (status: TransactionRecord["status"]) => {
    switch (status) {
      case "completed":
        return "text-primary";
      case "pending":
        return "text-accent";
      case "failed":
        return "text-destructive";
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="p-5 border-b border-border flex items-center gap-2">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Transaction History
        </h3>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm font-mono">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          No transactions yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Collateral", "Pledge %", "Amount", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-mono text-xs text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-primary">
                    {tx.collateral}
                  </td>
                  <td className="px-5 py-3 font-mono">{tx.percentage}%</td>
                  <td className="px-5 py-3 font-mono neon-text">{tx.amount.toFixed(4)} SOL</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 font-mono text-xs capitalize ${statusLabel(tx.status)}`}>
                      {statusIcon(tx.status)}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {tx.txSignature && (
                      <a
                        href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=${NETWORK}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
