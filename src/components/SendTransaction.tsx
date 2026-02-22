import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendSol, NETWORK } from "@/lib/solana";

interface Props {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
}

type Status = "idle" | "sending" | "success" | "error";

export default function SendTransaction({ open, onClose, walletAddress }: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [txSignature, setTxSignature] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setRecipient("");
    setAmount("");
    setStatus("idle");
    setTxSignature("");
    setErrorMsg("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!recipient || !amount) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg("Enter a valid amount");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const sig = await sendSol(recipient, amountNum);
      setTxSignature(sig);
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err?.message || "Transaction failed");
      setStatus("error");
    }
  };

  const explorerUrl = txSignature
    ? `https://explorer.solana.com/tx/${txSignature}?cluster=${NETWORK}`
    : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative glass-card neon-border rounded-2xl p-6 w-full max-w-md space-y-5 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Send SOL
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-muted-foreground">
              Network: <span className="text-primary uppercase">{NETWORK}</span> • From: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center py-4"
              >
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <p className="font-display font-semibold text-lg">Transaction Sent!</p>
                <p className="text-sm text-muted-foreground">
                  {amount} SOL sent successfully
                </p>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-mono"
                >
                  View on Solana Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div>
                  <button
                    onClick={handleClose}
                    className="neon-glow-btn font-display font-semibold px-6 py-2.5 rounded-xl mt-2"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter Solana wallet address"
                    disabled={status === "sending"}
                    className="w-full glass-card neon-border rounded-xl px-4 py-3 bg-secondary text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                    Amount (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={status === "sending"}
                    className="w-full glass-card neon-border rounded-xl px-4 py-3 bg-secondary text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>

                {/* Error */}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-destructive text-sm font-mono"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </motion.div>
                )}

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={status === "sending" || !recipient || !amount}
                  className="w-full neon-glow-btn font-display font-semibold px-6 py-3.5 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming on-chain...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Transaction
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
