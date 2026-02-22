import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, CheckCircle2 } from "lucide-react";
import { getBalance } from "@/lib/solana";
import { Slider } from "@/components/ui/slider";

interface Props {
  walletAddress: string;
  onBack: () => void;
}

const QUICK_PERCENTS = [0, 25, 50, 75, 100];

export default function LenderPage({ walletAddress, onBack }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [percent, setPercent] = useState(50);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getBalance(walletAddress)
      .then(setBalance)
      .catch(() => setBalance(2.5)); // fallback for demo
  }, [walletAddress]);

  const lendAmount = balance !== null ? (balance * percent) / 100 : 0;

  const handleConfirm = async () => {
    setConfirming(true);
    // Simulate confirmation delay
    await new Promise((r) => setTimeout(r, 1500));
    setConfirming(false);
    setConfirmed(true);
  };

  const truncated = walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-mesh flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 glass-card rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
          <span className="font-mono text-sm text-primary">{truncated}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md w-full"
        >
          {confirmed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card neon-border rounded-2xl p-8 text-center space-y-4"
            >
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-2xl font-display font-bold">Lending Confirmed!</h2>
              <p className="text-muted-foreground font-mono text-sm">
                You've committed <span className="text-primary font-semibold">{lendAmount.toFixed(4)} SOL</span> ({percent}% of your wallet) to the lending pool.
              </p>
              <button
                onClick={onBack}
                className="neon-glow-btn font-display font-semibold px-6 py-3 rounded-xl mt-4"
              >
                Back to Home
              </button>
            </motion.div>
          ) : (
            <div className="glass-card neon-border rounded-2xl p-8 space-y-8">
              <div className="text-center space-y-2">
                <Coins className="w-10 h-10 text-primary mx-auto" />
                <h2 className="text-2xl font-display font-bold">Lend Your SOL</h2>
                <p className="text-muted-foreground text-sm">
                  Choose how much of your wallet you'd like to lend to verified borrowers.
                </p>
              </div>

              {/* Balance display */}
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Wallet Balance</p>
                <p className="text-3xl font-display font-bold text-primary mt-1">
                  {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
                </p>
              </div>

              {/* Percentage slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-mono text-muted-foreground">Lending Percentage</label>
                  <span className="text-lg font-display font-bold text-primary">{percent}%</span>
                </div>

                <Slider
                  value={[percent]}
                  onValueChange={([v]) => setPercent(v)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />

                {/* Quick select buttons */}
                <div className="flex gap-2 justify-center">
                  {QUICK_PERCENTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPercent(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        percent === p
                          ? "bg-primary text-primary-foreground"
                          : "glass-card text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount display */}
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Amount to Lend</p>
                <p className="text-2xl font-display font-bold mt-1">
                  {lendAmount.toFixed(4)} <span className="text-primary">SOL</span>
                </p>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={confirming || percent === 0 || balance === null}
                className="w-full neon-glow-btn font-display font-semibold text-lg px-8 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirming ? "Confirming..." : "Confirm Lending"}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}
