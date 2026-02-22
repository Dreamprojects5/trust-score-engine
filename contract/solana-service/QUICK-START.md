# Crusoe API Integration - Complete Setup

## 🎯 What Was Built

Your Node.js Solana service now includes a complete integration with the Crusoe Cloud underwriting API. The service:

1. **Collects Web2 Identity Data** from GitHub, LinkedIn, and StackOverflow
2. **Collects Web3 Data** from Solana blockchain (via Helius)
3. **Calls Crusoe AI** with combined profile data
4. **Returns Underwriting Decision** with trust score, LTV requirements, and pricing

## 📦 Project Structure

```
solana-service/
├── .env                      ← YOUR API KEYS (Crusoe + Helius)
├── .gitignore               ← Protects .env from git
├── server.js                ← Express server with all endpoints
├── package.json             ← Dependencies (now includes dotenv)
├── test-underwriting.js     ← Test script for the new endpoint
├── README.md                ← Complete API documentation
├── API-EXAMPLES.md          ← Curl command examples
├── IMPLEMENTATION.md        ← Technical implementation details
└── VERIFICATION.md          ← This verification guide
```

## 🚀 How to Use

### Step 1: Verify Server Starts
```bash
cd /Users/ravisahani/Documents/Artificial\ Intelligence/Project/solana-service
node server.js
```

**Expected output:**
```
[dotenv@17.3.1] injecting env (4) from .env
🚀 Solana Payment Service running on port 3000
```

### Step 2: Test the Underwriting Endpoint

**Option A - Using Node.js test script:**
```bash
# In another terminal
node test-underwriting.js
```

**Option B - Using curl (your curl command adapted):**
```bash
curl --location 'http://localhost:3000/api/v1/underwriting' \
  --header 'Content-Type: application/json' \
  --data '{
    "github_username": "octocat",
    "stackoverflow_id": "1",
    "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf",
    "collateral_asset": "BTC"
  }'
```

### Step 3: Interpret the Response

The API returns:
- **Trust Score**: 300-850 (higher is better)
- **Trust Tier**: Tier 1 (excellent), Tier 2 (good), or Tier 3 (fair)
- **Collateral Requirement**: LTV percentage (how much you can borrow)
- **Pricing**: Commission rates for 1, 3, 6, 12 month loans

## 🔑 Environment Variables (.env)

Your `.env` file contains:
```env
HELIUS_API_KEY=35c6b453-6a5c-4a3a-9694-87893116d997
CRUSOE_API_KEY=dhyarM19QhSErnsiNWydiQ$2a$10$LbWIeuyXog4.u.d/kqJOZO7byPhPIMgc3yQRpUHg1n7XICIp78A5W
CRUSOE_API_URL=https://hackeurope.crusoecloud.com/v1/chat/completions
CRUSOE_MODEL=NVFP4/Qwen3-235B-A22B-Instruct-2507-FP4
```

**⚠️ IMPORTANT**: Never commit `.env` to git!

## 📊 Example Underwriting Result

When you call the endpoint, you get:

```json
{
  "status": "success",
  "data": {
    "web2_web3_profile": {
      "github": {
        "username": "octocat",
        "account_age_years": 15.0,
        "public_repos": 8,
        "followers": 21876
      },
      "stackoverflow": {
        "user_id": "1",
        "reputation": 64169,
        "badge_counts": {
          "bronze": 153,
          "silver": 153,
          "gold": 48
        }
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
    "underwriting": {
      "calculated_trust_score": 650,
      "scoring_reasoning": "Base score 500 + 100 for verified Web2 identity + 100 for developer proof - 50 for no Web3 activity = 650",
      "asset_classification": {
        "block": "BLOCK III",
        "volatility_description": "High Volatility - Crypto Assets"
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
  "timestamp": "2026-02-22T10:30:45.123Z"
}
```

## 💡 What This Means

For someone with:
- **Trust Score**: 650 (Tier 2)
- **Collateral**: Bitcoin (Block III - High Volatility)

They can:
- **Borrow 190% LTV**: Put up $100k BTC, borrow $190k USDC
- **Pay commission**: 
  - 1-month loan: 1.25% fee
  - 3-month loan: 3.5% fee
  - 6-month loan: 6.5% fee
  - 12-month loan: 12.25% fee

## 🔄 How It Works Behind the Scenes

1. **Your Node.js Server**:
   - Receives request with username/wallet/collateral
   
2. **Fetches User Data** (in parallel):
   - GitHub API → Account age, public repos, followers
   - StackOverflow API → Reputation, badges
   - Helius API → SOL balance, NFT count
   
3. **Formats for Crusoe AI**:
   - Includes the system prompt with underwriting rules
   - Includes user's profile as JSON
   - Includes requested collateral asset
   
4. **Calls Crusoe API**:
   - Sends POST to Crusoe with all data
   - Crusoe AI evaluates risk
   - Returns underwriting decision in JSON
   
5. **Returns to Client**:
   - All Web2/Web3 data
   - Crusoe's underwriting decision
   - Full loan terms and pricing

## 🛠️ All 3 Endpoints Now Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/build-transfer` | POST | Create Solana transaction |
| `/api/v1/web2-reputation` | POST | Get Web2/Web3 data |
| `/api/v1/underwriting` | POST | **NEW: AI underwriting decision** |

## 📝 Key Files to Review

1. **[server.js](server.js)** - Main API implementation
   - Lines 1-10: Imports including dotenv
   - Lines 31-34: Crusoe configuration
   - Lines 146-260: `callCrusoeUnderwritingAPI()` function
   - Lines 347-375: `/api/v1/underwriting` endpoint

2. **[.env](.env)** - Configuration (never commit this!)
   - Your Crusoe and Helius API keys

3. **[test-underwriting.js](test-underwriting.js)** - Easy testing
   - Run: `node test-underwriting.js`

4. **[README.md](README.md)** - Full documentation

## 🎓 Learning Resources

- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js/
- **Crusoe Cloud**: https://crusoecloud.com
- **Helius RPC**: https://www.helius.dev
- **Node.js Express**: https://expressjs.com

## ✅ Verification Checklist

Before deploying to production:

- [ ] Test with `node test-underwriting.js`
- [ ] Verify trust scores calculate correctly
- [ ] Check LTV percentages match your business rules
- [ ] Test with different collateral assets (BTC, ETH, SOL, etc.)
- [ ] Verify error handling (bad API keys, network errors)
- [ ] Check response times (Crusoe can be slow, up to 30 seconds)
- [ ] Update CORS origin for production
- [ ] Add request logging/monitoring
- [ ] Set up error tracking (optional but recommended)

## 🚨 Troubleshooting

**Error: "Cannot find module 'dotenv'"**
```bash
npm install dotenv
```

**Error: "CRUSOE_API_KEY is not configured"**
```bash
# Check .env file exists and has the key
cat .env
```

**Error: "address already in use :::3000"**
```bash
# Kill existing process
pkill -f "node server.js"
# Then restart
node server.js
```

**Slow Response (10-30 seconds)**
- Normal! Crusoe AI is running complex underwriting analysis
- Adjust timeout if needed in `test-underwriting.js`

## 🎯 Next Steps

1. **Test**: Run `node test-underwriting.js` and verify response
2. **Integrate**: Use `/api/v1/underwriting` in your React frontend
3. **Customize**: Adjust trust score rules if needed (edit system prompt)
4. **Deploy**: Push to production with proper environment setup
5. **Monitor**: Track API response times and error rates

---

**Implementation Date**: February 22, 2026
**Status**: ✅ Complete and Ready to Test
**Support**: Review README.md and API-EXAMPLES.md for more details
