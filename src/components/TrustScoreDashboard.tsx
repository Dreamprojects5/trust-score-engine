import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Coins, AlertTriangle, ArrowLeft, Send } from "lucide-react";
import type { WalletMetrics, RiskBlockResponse } from "@/lib/api";
import SendTransaction from "@/components/SendTransaction";

interface Props {
  walletAddress: string;
  metrics: WalletMetrics;
  riskBlock: RiskBlockResponse;
  onReset: () => void;
}

export default function TrustScoreDashboard({ walletAddress, metrics, riskBlock, onReset }: Props) {
  const [sendOpen, setSendOpen] = useState(false);

  const riskColor =
    metrics.riskLevel === "LOW"
      ? "text-primary"
      : metrics.riskLevel === "MEDIUM"
      ? "text-accent"
      : "text-destructive";

  const scoreValue =
    metrics.riskLevel === "LOW" ? 92 : metrics.riskLevel === "MEDIUM" ? 71 : 38;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-mesh px-6 py-10"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSendOpen(true)}
              className="neon-glow-btn font-display font-semibold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send SOL
            </button>
            <div className="flex items-center gap-2 glass-card rounded-lg px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
              <span className="font-mono text-xs text-primary">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Score hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card neon-border rounded-2xl p-8 text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center neon-border">
                <span className="text-5xl font-display font-bold neon-text">{scoreValue}</span>
              </div>
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1.5">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold">On-Chain Trust Score</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Based on {metrics.transactionCount} on-chain transactions analyzed by Qwen3-235B
          </p>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              label: "Risk Level",
              value: metrics.riskLevel,
              valueClass: riskColor,
            },
            {
              icon: Coins,
              label: "Block Tier",
              value: riskBlock.blockName,
              valueClass: "text-primary",
            },
            {
              icon: AlertTriangle,
              label: "Factor Range",
              value: riskBlock.factorRange,
              valueClass: "text-neon-purple",
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              className="glass-card rounded-xl p-5 space-y-3"
            >
              <card.icon className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className={`text-xl font-display font-bold ${card.valueClass}`}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Eligible assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card rounded-xl p-6 space-y-3"
        >
          <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Eligible Assets
          </h3>
          <div className="flex flex-wrap gap-2">
            {riskBlock.eligibleAssets.split(", ").map((asset) => (
              <span
                key={asset}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-mono text-sm neon-border"
              >
                {asset}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{riskBlock.note}</p>
        </motion.div>

        {/* Collateral returns table */}
        {riskBlock.returns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="p-5 border-b border-border">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Projected Returns by Collateral
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Collateral", "1M", "3M", "6M", "12M"].map((h) => (
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
                  {riskBlock.returns.map((row) => (
                    <tr key={row.collateral} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-primary">
                        {row.collateral}
                      </td>
                      <td className="px-5 py-3 font-mono">{row.oneMonth}</td>
                      <td className="px-5 py-3 font-mono">{row.threeMonth}</td>
                      <td className="px-5 py-3 font-mono">{row.sixMonth}</td>
                      <td className="px-5 py-3 font-mono neon-text">{row.twelveMonth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <SendTransaction
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        walletAddress={walletAddress}
      />
    </motion.div>
  );
}
