import express from "express";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import { DateTime } from "luxon";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:8081",   // React app origin
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.options("*", cors());

/* ------------------ CONFIG ------------------ */
// YOUR PHANTOM ADDRESS (Recipient)
const RECIPIENT_WALLET = new PublicKey("EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf");

const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "35c6b453-6a5c-4a3a-9694-87893116d997";
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const CRUSOE_API_KEY = process.env.CRUSOE_API_KEY;
const CRUSOE_API_URL = process.env.CRUSOE_API_URL || "https://hackeurope.crusoecloud.com/v1/chat/completions";
const CRUSOE_MODEL = process.env.CRUSOE_MODEL || "NVFP4/Qwen3-235B-A22B-Instruct-2507-FP4";

/* ------------------ HELPER FUNCTIONS FOR WEB2 REPUTATION ------------------ */

async function getGithubData(username) {
  if (!username) return null;

  try {
    const url = `https://api.github.com/users/${username}`;
    const headers = { "User-Agent": "Solana-Service" };
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status === 200) {
      const data = response.data;
      const createdAt = DateTime.fromISO(data.created_at);
      const now = DateTime.now();
      const accountAgeYears = now.diff(createdAt, "years").years;

      return {
        username: username,
        account_age_years: Math.round(accountAgeYears * 100) / 100,
        public_repos: data.public_repos,
        followers: data.followers,
      };
    }
    return null;
  } catch (err) {
    console.error(`GitHub API Error: ${err.message}`);
    return null;
  }
}

async function getStackOverflowData(userId) {
  if (!userId) return null;

  try {
    const url = `https://api.stackexchange.com/2.3/users/${userId}?site=stackoverflow`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.status === 200) {
      const items = response.data.items || [];
      if (items.length > 0) {
        const user = items[0];
        return {
          user_id: userId,
          reputation: user.reputation,
          badge_counts: user.badge_counts,
        };
      }
    }
    return null;
  } catch (err) {
    console.error(`StackOverflow API Error: ${err.message}`);
    return null;
  }
}

async function checkHeliusReputation(walletAddress) {
  if (!walletAddress) {
    return {
      is_web3_verified: false,
      sol_balance: 0,
      nft_count: 0,
    };
  }

  try {
    const balancePayload = {
      jsonrpc: "2.0",
      id: "1",
      method: "getBalance",
      params: [walletAddress],
    };

    const assetsPayload = {
      jsonrpc: "2.0",
      id: "2",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: walletAddress,
        page: 1,
        limit: 10,
        displayOptions: { showFungible: false },
      },
    };

    const [balanceResp, assetsResp] = await Promise.all([
      axios.post(HELIUS_URL, balancePayload, { timeout: 10000 }),
      axios.post(HELIUS_URL, assetsPayload, { timeout: 10000 }),
    ]);

    let solBalance = 0;
    let nftCount = 0;

    if (balanceResp.status === 200) {
      solBalance = (balanceResp.data.result?.value || 0) / Math.pow(10, 9);
    }

    if (assetsResp.status === 200) {
      nftCount = assetsResp.data.result?.total || 0;
    }

    const isVerified = solBalance > 0 && nftCount > 0;

    return {
      is_web3_verified: isVerified,
      sol_balance: Math.round(solBalance * 10000) / 10000,
      nft_count: nftCount,
      trust_signal: isVerified ? "Verified Web3 Human" : "Low Web3 Activity",
    };
  } catch (err) {
    console.error(`Helius API Error: ${err.message}`);
    return {
      is_web3_verified: false,
      error: err.message,
    };
  }
}

/* ------------------ CRUSOE UNDERWRITING API INTEGRATION ------------------ */

async function callCrusoeUnderwritingAPI(web2Web3Profile, collateralAsset) {
  if (!CRUSOE_API_KEY) {
    throw new Error("CRUSOE_API_KEY is not configured in .env file");
  }

  try {
    const systemPrompt = `CRITICAL COMPLIANCE & UNDERWRITING DIRECTIVE:
You are the Chief Risk Officer for an Asset-Backed B2B Lending Platform on Solana.
You will receive the user's raw Web3 On-Chain Data (Helius) and Web2 Identity Data (GitHub/LinkedIn/StackOverflow), plus their requested Collateral Asset.

STEP 1: CALCULATE THE TRUST SCORE (Range: 300 - 850)
You must calculate the user's Trust Score. Start at a Base Score of 500 and apply these exact adjustments based on the raw input data:
- Web3 Liquidation Penalty: If the wallet has ANY history of DeFi liquidations (e.g., MarginFi, Kamino), subtract 200 points.
- Web3 Age & Volume: Add up to 100 points for wallets older than 1 year with consistent transaction volume.
- Web2 Verified Identity: Add 100 points for a verified LinkedIn profile with >100 connections or a StackOverflow account with >500 reputation.
- Web2 Developer Proof: Add 100 points for a GitHub account older than 2 years with active, green contribution commits in the last 6 months.
- Empty Profile Penalty: If Web2 data is missing or empty, subtract 100 points (High Sybil/Bot risk).
Sum these to find the Final Trust Score (Cap at 850, Floor at 300).

STEP 2: CLASSIFY THE ASSET VOLATILITY
Categorize the collateral:
- BLOCK I (Low Volatility): Global ETFs, Sovereign AAA Bonds, Large Cap Blue Chips.
- BLOCK II (Medium Volatility): Growth Equities (Tech), Sectoral ETFs, Mid-Caps.
- BLOCK III (High Volatility): Crypto Assets (BTC/ETH, SOL), Emerging Equities, Small Caps.

STEP 3: CALCULATE TERMS BASED ON TRUST SCORE
Determine the Collateral Tier and Loan-to-Value (LTV) Requirement based on the score from Step 1:
- Score >= 750 (Tier 1): Block I: 115%, Block II: 135%, Block III: 160%.
- Score 600-749 (Tier 2): Block I: 130%, Block II: 155%, Block III: 190%.
- Score < 600 (Tier 3): Block I: 150%, Block II: 175%, Block III: 220%.

STEP 4: GENERATE THE PRICING ARRAY
Calculate the base commission rates for 1, 3, 6, and 12 months.
Base Rates: 1 MO = 1.0%, 3 MO = 2.8%, 6 MO = 5.2%, 12 MO = 9.8%.
Multiplier: Multiply the Base Rate by 1.0 for Tier 1, 1.25 for Tier 2, and 1.75 for Tier 3.

CRITICAL INSTRUCTION:
You must return ONLY a raw JSON object. Do not include markdown blocks, conversational text, or explanations.

You MUST use this exact JSON schema:
{
  "calculated_trust_score": "Number (300-850)",
  "scoring_reasoning": "String (Briefly explain the points added/subtracted in Step 1)",
  "asset_classification": {
    "block": "String",
    "volatility_description": "String"
  },
  "underwriting_decision": {
    "trust_tier": "String",
    "required_collateral_percentage": "Number",
    "liquidation_threshold_percentage": "Number (Output 115 if Block III, else null)"
  },
  "pricing_array_percentages": {
    "1_month": "Number",
    "3_month": "Number",
    "6_month": "Number",
    "12_month": "Number"
  }
}`;

    const userContent = {
      collateral_asset: collateralAsset,
      web2_web3_profile: web2Web3Profile,
      timestamp: new Date().toISOString(),
    };

    const payload = {
      model: CRUSOE_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify(userContent),
        },
      ],
      temperature: 1,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await axios.post(CRUSOE_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CRUSOE_API_KEY}`,
      },
      timeout: 30000,
    });

    // Extract JSON from response
    if (response.status === 200 && response.data.choices && response.data.choices[0]) {
      const content = response.data.choices[0].message.content;
      
      // Try to parse the JSON response
      try {
        // Extract JSON object if it's wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const parsedResult = JSON.parse(jsonStr);
        return parsedResult;
      } catch (parseErr) {
        console.error("Failed to parse Crusoe API response:", content);
        throw new Error(`Invalid JSON in Crusoe response: ${parseErr.message}`);
      }
    }

    throw new Error("Unexpected Crusoe API response format");
  } catch (err) {
    console.error(`Crusoe API Error: ${err.message}`);
    throw err;
  }
}

/* ------------------ ENDPOINT ------------------ */
app.post("/build-transfer", async (req, res) => {
  try {
    const { fromWallet, amount } = req.body;
    const fromPubkey = new PublicKey(fromWallet);

    // 1. Create the Transfer Instruction (Wallet-to-Wallet)
    const transferIx = SystemProgram.transfer({
      fromPubkey: fromPubkey,
      toPubkey: RECIPIENT_WALLET,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    // 2. Add instruction to a new Transaction
    const tx = new Transaction().add(transferIx);

    // 3. Set recent blockhash and fee payer
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPubkey;

    // 4. Serialize for the frontend (Base64)
    // We set requireAllSignatures: false because the user's Phantom will sign it next
    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    console.log(`✅ Transaction built: ${amount} SOL to ${RECIPIENT_WALLET.toBase58()}`);

    res.json({
      tx: serializedTx.toString("base64"),
      recipient: RECIPIENT_WALLET.toBase58(),
    });

  } catch (err) {
    console.error("❌ Error building transaction:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ WEB2 REPUTATION ENDPOINT ------------------ */

app.post("/api/v1/web2-reputation", async (req, res) => {
  try {
    const { github_username, stackoverflow_id, solana_address } = req.body;

    const [githubData, stackoverflowData, solanaData] = await Promise.all([
      getGithubData(github_username),
      getStackOverflowData(stackoverflow_id),
      checkHeliusReputation(solana_address),
    ]);

    const socialMediaMock = {
      linkedin_verified: true,
      connections: "500+",
    };

    return res.json({
      status: "success",
      data: {
        github: githubData,
        stackoverflow: stackoverflowData,
        solana: solanaData,
        social_media: socialMediaMock,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* ------------------ CRUSOE UNDERWRITING ENDPOINT ------------------ */

app.post("/api/v1/underwriting", async (req, res) => {
  try {
    const { github_username, stackoverflow_id, solana_address, collateral_asset } = req.body;

    // Validate required fields
    if (!collateral_asset) {
      return res.status(400).json({ error: "collateral_asset is required" });
    }

    // Fetch Web2/Web3 reputation data
    const [githubData, stackoverflowData, solanaData] = await Promise.all([
      getGithubData(github_username),
      getStackOverflowData(stackoverflow_id),
      checkHeliusReputation(solana_address),
    ]);

    const socialMediaMock = {
      linkedin_verified: true,
      connections: "500+",
    };

    // Build the profile object for Crusoe API
    const web2Web3Profile = {
      github: githubData,
      stackoverflow: stackoverflowData,
      solana: solanaData,
      social_media: socialMediaMock,
    };

    // Call Crusoe Underwriting API
    const underwritingResult = await callCrusoeUnderwritingAPI(web2Web3Profile, collateral_asset);

    return res.json({
      status: "success",
      data: {
        web2_web3_profile: web2Web3Profile,
        underwriting: underwritingResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Underwriting Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/* --------- START SERVER ---------- */
app.listen(3000, () => {
  console.log("🚀 Solana Payment Service running on port 3000");
});