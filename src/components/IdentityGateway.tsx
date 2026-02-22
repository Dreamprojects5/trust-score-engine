import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Github, ArrowRight, Zap, HandCoins, TrendingUp, AlertTriangle, Server, Code, Scale, Calculator, ShieldCheck } from "lucide-react";
import { connectPhantom, getPhantomProvider } from "@/lib/solana";

interface Props {
  onCalculate: (wallet: string, socialUrl: string) => void;
  onLend: (wallet: string) => void;
}

export default function IdentityGateway({ onCalculate, onLend }: Props) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<null | "borrower" | "lender">(null);
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
      // Fallback: if we couldn't read a wallet from Phantom, set a random demo address
      const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let randomAddr = "";
      for (let i = 0; i < 44; i++) {
        randomAddr += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      setWalletAddress(randomAddr);
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
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-24 pb-16">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="text-primary font-display font-bold text-2xl tracking-widest uppercase neon-text mb-2">VouchAI</div>
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
            ) : role === null ? (
              /* Role selection */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <button
                  onClick={() => setRole("borrower")}
                  className="flex-1 glass-card neon-border rounded-2xl p-6 text-left hover:bg-primary/5 transition-all group"
                >
                  <TrendingUp className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display font-bold text-lg mb-1">Become a Borrower</h3>
                  <p className="text-muted-foreground text-sm">
                    Get under-collateralized loans based on your on-chain reputation.
                  </p>
                </button>
                <button
                  onClick={() => onLend(walletAddress)}
                  className="flex-1 glass-card neon-border rounded-2xl p-6 text-left hover:bg-primary/5 transition-all group"
                >
                  <HandCoins className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display font-bold text-lg mb-1">Become a Lender</h3>
                  <p className="text-muted-foreground text-sm">
                    Earn yield by lending your SOL to verified borrowers.
                  </p>
                </button>
              </motion.div>
            ) : (
              /* Borrower flow — social URL + calculate */
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

      {/* --- NEW SECTIONS --- */}
      <div className="w-full max-w-6xl mx-auto px-6 py-24 space-y-32 relative z-10">
        {/* Section 1: The Problem */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Why DeFi Lending is Broken</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Capital Inefficiency and the lack of credit identity are holding back institutional adoption.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <AlertTriangle className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-3">150% Over-collateralization</h3>
              <p className="text-muted-foreground text-sm">
                Current protocols lock up billions in unproductive capital by treating all users as high-risk strangers.
              </p>
            </div>
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <Github className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-3">Identity Blindness</h3>
              <p className="text-muted-foreground text-sm">
                DeFi ignores reputation; a senior Solana developer is evaluated with the same risk as a newly created bot.
              </p>
            </div>
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <Scale className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-3">Regulatory Friction</h3>
              <p className="text-muted-foreground text-sm">
                Lack of compliance with MiCA frameworks prevents institutional capital entry at a European scale.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Enterprise-Grade Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Technical Infrastructure</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Enterprise-Grade Architecture designed for massive scale and speed.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <Server className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-2">Core Backend (Spring Boot & PostgreSQL)</h3>
              <p className="text-muted-foreground text-sm">
                Manages global state, historical data persistence, and risk underwriting registry.
              </p>
            </div>
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <Code className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-2">Web3 Orchestration (Node.js)</h3>
              <p className="text-muted-foreground text-sm">
                Dedicated microservice for transaction building with @solana/web3.js and AI prompt orchestration.
              </p>
            </div>
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <ShieldCheck className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-2">Programmatic Escrow Vault (Rust)</h3>
              <p className="text-muted-foreground text-sm">
                Anchor smart contract solving the Freeze Authority limitation in stablecoins, securing collateral non-custodially.
              </p>
            </div>
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <Zap className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-2">AI Underwriter (Crusoe Inference API)</h3>
              <p className="text-muted-foreground text-sm">
                Real-time inference engine executing risk analysis and EU Travel Rule compliance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Quantitative Risk Model */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Deterministic Risk Model</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A mathematical foundation defining our trusted operations.</p>
          </div>
          <div className="glass-card neon-border rounded-2xl p-8 md:p-12 max-w-4xl mx-auto hover:bg-primary/5 transition-all">
            <Calculator className="w-10 h-10 text-primary mb-6 mx-auto" />
            <div className="text-center mb-8">
              <span className="inline-block bg-primary/10 text-primary border border-primary/30 px-6 py-3 rounded-full font-mono text-xl font-bold tracking-tight">
                C_f = R_b(t) × F_r × M_c
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <span className="text-primary font-bold font-mono text-lg block mb-1">C_f</span>
                <span className="text-muted-foreground text-sm">Final applied commission or interest rate.</span>
              </div>
              <div>
                <span className="text-primary font-bold font-mono text-lg block mb-1">R_b(t)</span>
                <span className="text-muted-foreground text-sm">Temporal base rate (1, 3, 6, or 12 months).</span>
              </div>
              <div>
                <span className="text-primary font-bold font-mono text-lg block mb-1">F_r</span>
                <span className="text-muted-foreground text-sm">Asset volatility factor (e.g., 0.75x for stables vs 1.50x for volatiles).</span>
              </div>
              <div>
                <span className="text-primary font-bold font-mono text-lg block mb-1">M_c</span>
                <span className="text-muted-foreground text-sm">Collateral modifier derived directly from the AI Trust Score.</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Compliance & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold">Compliance & Vision</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built for the institutional standard in Web3.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <ShieldCheck className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-3">Identity Attestation & EU Travel Rule</h3>
              <p className="text-muted-foreground text-sm">
                The engine is designed to comply with MiCA and the EU Travel Rule through 'Identity Attestation', ensuring auditable provenance.
              </p>
            </div>
            <div className="glass-card neon-border rounded-2xl p-6 md:p-8 hover:bg-primary/5 transition-all group">
              <Scale className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold font-display mb-3">Zero-Friction Pseudo-KYC</h3>
              <p className="text-muted-foreground text-sm">
                Using AI to cross-reference GitHub history with on-chain data, enabling wallet approval under strict European AML frameworks.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer grid decoration */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
}
