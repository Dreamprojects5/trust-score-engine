import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Github, ArrowRight, Zap } from "lucide-react";
import { connectPhantom, getPhantomProvider } from "@/lib/solana";

interface Props {
  onCalculate: (wallet: string, socialUrl: string) => void;
}

export default function IdentityGateway({ onCalculate }: Props) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [socialUrl, setSocialUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState("");

  const connectWallet = async () => {
    setConnecting(true);
    setWalletError("");
    try {
      const address = await connectPhantom();
      setWalletAddress(address);
    } catch (err: any) {
      if (!getPhantomProvider()) {
        window.open("https://phantom.app/", "_blank");
      }
      setWalletError(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const truncated = walletAddress
    ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-mesh flex flex-col"
    >
      {/* Top bar */}
      {walletAddress && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-8 flex items-center gap-2 glass-card rounded-lg px-4 py-2"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
          <span className="font-mono text-sm text-primary">{truncated}</span>
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center space-y-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs font-mono text-primary neon-border">
              <Zap className="w-3 h-3" />
              SOLANA DEVNET • HACKATHON BUILD
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight tracking-tight"
          >
            Under-collateralized
            <br />
            Solana Lending.
            <br />
            <span className="neon-text">Powered by On-Chain Reputation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            We scan your Solana history, DeFi behavior, and social graph to generate a real-time credit score — no TradFi required.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {!walletAddress ? (
              <div className="space-y-3">
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="neon-glow-btn font-display font-semibold text-lg px-8 py-4 rounded-xl inline-flex items-center gap-3 disabled:opacity-60"
                >
                  <Wallet className="w-5 h-5" />
                  {connecting ? "Connecting..." : "Connect Phantom"}
                </button>
                {walletError && (
                  <p className="text-destructive text-sm font-mono">{walletError}</p>
                )}
                <div>
                  <button
                    onClick={() => onCalculate("DemoWa11etXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", "")}
                    className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Try Demo Mode
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
              >
                <div className="max-w-md mx-auto">
                  <label className="block text-left text-sm font-mono text-muted-foreground mb-2">
                    Boost your credit limit with social proof
                  </label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={socialUrl}
                      onChange={(e) => setSocialUrl(e.target.value)}
                      placeholder="github.com/username or linkedin.com/in/username"
                      className="w-full glass-card neon-border rounded-xl pl-11 pr-4 py-3.5 bg-secondary text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <button
                  onClick={() => onCalculate(walletAddress, socialUrl)}
                  className="neon-glow-btn font-display font-semibold text-lg px-8 py-4 rounded-xl inline-flex items-center gap-3 animate-pulse-neon"
                >
                  Calculate Trust Score
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer grid decoration */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}
