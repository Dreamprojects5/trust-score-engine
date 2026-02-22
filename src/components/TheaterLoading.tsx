import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Terminal } from "lucide-react";

interface Step {
  label: string;
  duration: number;
}

const STEPS: Step[] = [
  { label: "Connecting to Helius RPC endpoint...", duration: 1200 },
  { label: "Fetching Helius Transaction History...", duration: 1500 },
  { label: "Parsing SPL token transfer signatures...", duration: 1300 },
  { label: "Scanning for MarginFi/Kamino Liquidations...", duration: 1800 },
  { label: "Analyzing DeFi protocol interactions...", duration: 1400 },
  { label: "Cross-referencing GitHub commit history...", duration: 1600 },
  { label: "Qwen3-235B AI Underwriting in progress...", duration: 2500 },
  { label: "Generating reputation vector embedding...", duration: 1200 },
];

interface Props {
  onComplete: () => void;
}

export default function TheaterLoading({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-mesh flex items-center justify-center px-6"
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Terminal header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Terminal className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm text-primary">
            trustscore_engine v2.1.0
          </span>
          <span className="animate-blink font-mono text-primary">█</span>
        </motion.div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="terminal-bg rounded-xl overflow-hidden"
        >
          {/* Terminal bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-primary/70" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">
              ~/trustscore — analyzing wallet
            </span>
          </div>

          {/* Steps */}
          <div className="p-6 space-y-3 font-mono text-sm min-h-[320px]">
            <AnimatePresence>
              {STEPS.map((step, i) => {
                const isCompleted = completedSteps.includes(i);
                const isActive = currentStep === i && !isCompleted;
                const isVisible = i <= currentStep;

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
                    ) : null}
                    <span
                      className={
                        isCompleted
                          ? "text-primary/80"
                          : isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-5">
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${(completedSteps.length / STEPS.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  boxShadow: "0 0 12px hsl(142 72% 50% / 0.6)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
