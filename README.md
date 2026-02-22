# VouchAI

**Under-collateralized Solana Lending. Powered by On-Chain Reputation.**

VouchAI is a decentralized lending protocol on the Solana blockchain that leverages AI-driven on-chain reputation analysis to offer under-collateralized loans. By scanning your Solana history, DeFi behavior, and social graph, VouchAI generates a real-time credit score, bridging the gap between TradFi risk assessment and Web3 accessibility without relying on traditional credit bureaus.

## 🚀 The Problem We Solve
DeFi lending is currently broken due to:
- **150% Over-collateralization**: Current protocols lock up billions in unproductive capital by treating all users as high-risk strangers.
- **Identity Blindness**: DeFi ignores reputation; a senior Solana developer is evaluated with the same risk as a newly created bot.
- **Regulatory Friction**: Lack of compliance with MiCA frameworks prevents institutional capital entry at a European scale.

## 🏗️ Technical Infrastructure
VouchAI employs an Enterprise-Grade Architecture designed for massive scale and speed:
- **Core Backend**: Spring Boot & PostgreSQL manages global state, historical data persistence, and risk underwriting registry.
- **Web3 Orchestration**: Node.js microservice dedicated to transaction building with `@solana/web3.js` and AI prompt orchestration.
- **Programmatic Escrow Vault**: Rust (Anchor) smart contract solving the Freeze Authority limitation in stablecoins, securing collateral non-custodially.
- **AI Underwriter**: Crusoe Inference API serves as the real-time inference engine executing risk analysis and EU Travel Rule compliance.

## 🧮 Deterministic Risk Model
Our trusted operations are defined by a mathematical foundation:

`C_f = R_b(t) × F_r × M_c`

- **C_f**: Final applied commission or interest rate.
- **R_b(t)**: Temporal base rate (1, 3, 6, or 12 months).
- **F_r**: Asset volatility factor (e.g., 0.75x for stables vs 1.50x for volatiles).
- **M_c**: Collateral modifier derived directly from the AI Trust Score.

## 🛡️ Compliance & Vision
Built for the institutional standard in Web3:
- **Identity Attestation & EU Travel Rule**: The engine is designed to comply with MiCA and the EU Travel Rule through 'Identity Attestation', ensuring auditable provenance.
- **Zero-Friction Pseudo-KYC**: Using AI to cross-reference GitHub history with on-chain data, enabling wallet approval under strict European AML frameworks.

## 💻 Running Locally

### Prerequisites
- Node.js & npm / pnpm / yarn

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## 🏆 Hackathon
This interface was built as part of a Hackathon on the Solana Devnet, intended to demonstrate the UI/UX flows and logical architecture for next-generation decentralized capital markets.
