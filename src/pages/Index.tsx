import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import IdentityGateway from "@/components/IdentityGateway";
import TheaterLoading from "@/components/TheaterLoading";
import TrustScoreDashboard from "@/components/TrustScoreDashboard";
import LenderPage from "@/components/LenderPage";
import {
  fetchWalletTransactions,
  fetchRiskBlock,
  MOCK_WALLET_METRICS,
  MOCK_RISK_BLOCK,
  type WalletMetrics,
  type RiskBlockResponse,
} from "@/lib/api";

type Screen = "gateway" | "loading" | "dashboard" | "lender";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("gateway");
  const [walletAddress, setWalletAddress] = useState("");
  const [metrics, setMetrics] = useState<WalletMetrics>(MOCK_WALLET_METRICS);
  const [riskBlock, setRiskBlock] = useState<RiskBlockResponse>(MOCK_RISK_BLOCK);

  const handleCalculate = useCallback(async (wallet: string, _socialUrl: string) => {
    setWalletAddress(wallet);
    setScreen("loading");

    // Try real API, fall back to mocks
    try {
      const m = await fetchWalletTransactions(wallet);
      setMetrics(m);
      const riskLevel = m.riskLevel as "LOW" | "MEDIUM" | "HIGH";
      const r = await fetchRiskBlock(riskLevel);
      setRiskBlock(r);
    } catch {
      // Use mocks — backend not running
      setMetrics(MOCK_WALLET_METRICS);
      setRiskBlock(MOCK_RISK_BLOCK);
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setScreen("dashboard");
  }, []);

  const handleLend = useCallback((wallet: string) => {
    setWalletAddress(wallet);
    setScreen("lender");
  }, []);

  const handleReset = useCallback(() => {
    setScreen("gateway");
  }, []);

  return (
    <AnimatePresence mode="wait">
      {screen === "gateway" && (
        <IdentityGateway key="gateway" onCalculate={handleCalculate} onLend={handleLend} />
      )}
      {screen === "loading" && (
        <TheaterLoading key="loading" onComplete={handleLoadingComplete} />
      )}
      {screen === "dashboard" && (
        <TrustScoreDashboard
          key="dashboard"
          walletAddress={walletAddress}
          metrics={metrics}
          riskBlock={riskBlock}
          onReset={handleReset}
        />
      )}
      {screen === "lender" && (
        <LenderPage key="lender" walletAddress={walletAddress} onBack={handleReset} />
      )}
    </AnimatePresence>
  );
};

export default Index;
