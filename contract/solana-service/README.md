# Solana Payment & Underwriting Service

A Node.js service that integrates Web2 (GitHub, LinkedIn, StackOverflow) and Web3 (Solana) identity verification with Crusoe Cloud's AI-powered underwriting system.

## Features

- **Web2 Reputation Scoring**: Fetches GitHub, StackOverflow, and LinkedIn data
- **Web3 Verification**: Checks Solana wallet balances and NFT holdings
- **AI Underwriting**: Integrates with Crusoe Cloud API for trust score calculation
- **Transaction Building**: Creates Solana transfer transactions
- **CORS Support**: Ready for integration with frontend apps

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
HELIUS_API_KEY=your_helius_api_key
CRUSOE_API_KEY=your_crusoe_api_key
CRUSOE_API_URL=https://hackeurope.crusoecloud.com/v1/chat/completions
CRUSOE_MODEL=NVFP4/Qwen3-235B-A22B-Instruct-2507-FP4
```

**Get API Keys:**
- **Helius RPC**: https://www.helius.dev (for Solana blockchain data)
- **Crusoe API**: https://crusoecloud.com (for AI underwriting)

## Running the Service

```bash
node server.js
```

The service will start on `http://localhost:3000`

## API Endpoints

### 1. Build Transfer Transaction
**POST** `/build-transfer`

Creates a signed Solana transfer transaction.

**Request:**
```json
{
  "fromWallet": "wallet_public_key",
  "amount": 0.5
}
```

**Response:**
```json
{
  "tx": "base64_encoded_transaction",
  "recipient": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf"
}
```

---

### 2. Web2 Reputation Check
**POST** `/api/v1/web2-reputation`

Fetches Web2 and Web3 identity data for a user.

**Request:**
```json
{
  "github_username": "octocat",
  "stackoverflow_id": "1",
  "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "github": {
      "username": "octocat",
      "account_age_years": 15.0,
      "public_repos": 8,
      "followers": 21876
    },
    "stackoverflow": {
      "user_id": "1",
      "reputation": 64169,
      "badge_counts": {...}
    },
    "solana": {
      "is_web3_verified": false,
      "sol_balance": 0,
      "nft_count": 0,
      "trust_signal": "Low Web3 Activity"
    },
    "social_media": {
      "linkedin_verified": true,
      "connections": "500+"
    }
  },
  "timestamp": "2026-02-22T..."
}
```

---

### 3. Crusoe Underwriting (NEW)
**POST** `/api/v1/underwriting`

Performs AI-powered risk assessment and underwriting using Crusoe Cloud API.

**Request:**
```json
{
  "github_username": "octocat",
  "stackoverflow_id": "1",
  "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf",
  "collateral_asset": "BTC"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "web2_web3_profile": {...},
    "underwriting": {
      "calculated_trust_score": 650,
      "scoring_reasoning": "...",
      "asset_classification": {
        "block": "BLOCK III",
        "volatility_description": "High Volatility"
      },
      "underwriting_decision": {
        "trust_tier": "Tier 2",
        "required_collateral_percentage": 190,
        "liquidation_threshold_percentage": 115
      },
      "pricing_array_percentages": {
        "1_month": 1.25,
        "3_month": 3.5,
        "6_month": 6.5,
        "12_month": 12.25
      }
    }
  },
  "timestamp": "2026-02-22T..."
}
```

## Testing

Run the test script:

```bash
node test-underwriting.js
```

This will:
1. Start the server
2. Call the `/api/v1/underwriting` endpoint with sample data
3. Display the trust score and underwriting decision

## Architecture

```
┌─────────────────────────────────────────┐
│      Frontend (React on port 8081)      │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│   Solana Service (Node.js port 3000)    │
├─────────────────────────────────────────┤
│  ├─ /build-transfer                     │
│  ├─ /api/v1/web2-reputation             │
│  └─ /api/v1/underwriting ◄── NEW        │
└──┬──────────────────┬────────────────┬───┘
   │                  │                │
   ▼                  ▼                ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│ Helius RPC  │  │ GitHub   │  │ Crusoe AI    │
│ (Solana)    │  │ API      │  │ Underwriter  │
└─────────────┘  └──────────┘  └──────────────┘
```

## Trust Score Calculation (Crusoe AI)

The trust score (300-850) is calculated based on:

1. **Web3 Metrics** (Solana blockchain)
   - Wallet age & transaction volume
   - DeFi liquidation history
   
2. **Web2 Metrics** (Developer identity)
   - GitHub account age & contributions
   - StackOverflow reputation
   - LinkedIn verification

3. **Risk Adjustments**
   - Applies penalties for suspicious activity
   - Bonuses for verified multi-platform presence

## Loan Terms

Based on trust score and collateral type:

| Trust Tier | Score | Block I (Low Vol) | Block II (Med Vol) | Block III (High Vol) |
|------------|-------|------------------|-------------------|----------------------|
| Tier 1    | ≥750  | 115% LTV         | 135% LTV          | 160% LTV             |
| Tier 2    | 600-749 | 130% LTV       | 155% LTV          | 190% LTV             |
| Tier 3    | <600  | 150% LTV         | 175% LTV          | 220% LTV             |

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200`: Success
- `400`: Bad request (missing required fields)
- `500`: Server error (API integration issues)

## Security Considerations

- ✅ CORS configured for localhost:8081 only
- ✅ Environment variables for sensitive API keys
- ✅ Error messages don't expose internal details
- ⚠️ Remember to never commit `.env` file to version control

## Future Improvements

- [ ] Add request validation middleware
- [ ] Implement rate limiting
- [ ] Add database persistence for audit logs
- [ ] Support for additional Web2 platforms
- [ ] Webhook support for underwriting updates
- [ ] GraphQL API option

## License

ISC
