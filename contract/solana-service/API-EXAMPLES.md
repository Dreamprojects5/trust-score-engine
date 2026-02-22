# API Request Examples

## 1. Build Transfer Transaction

```bash
curl --location 'http://localhost:3000/build-transfer' \
  --header 'Content-Type: application/json' \
  --data '{
    "fromWallet": "YourWalletPublicKey",
    "amount": 0.5
  }'
```

## 2. Get Web2/Web3 Reputation

```bash
curl --location 'http://localhost:3000/api/v1/web2-reputation' \
  --header 'Content-Type: application/json' \
  --data '{
    "github_username": "octocat",
    "stackoverflow_id": "1",
    "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf"
  }'
```

## 3. Crusoe Underwriting API (NEW)

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

## 4. Test with Different Collateral Assets

### Ethereum
```bash
curl --location 'http://localhost:3000/api/v1/underwriting' \
  --header 'Content-Type: application/json' \
  --data '{
    "github_username": "octocat",
    "stackoverflow_id": "1",
    "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf",
    "collateral_asset": "ETH"
  }'
```

### Solana
```bash
curl --location 'http://localhost:3000/api/v1/underwriting' \
  --header 'Content-Type: application/json' \
  --data '{
    "github_username": "octocat",
    "stackoverflow_id": "1",
    "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf",
    "collateral_asset": "SOL"
  }'
```

### US Treasury Bonds
```bash
curl --location 'http://localhost:3000/api/v1/underwriting' \
  --header 'Content-Type: application/json' \
  --data '{
    "github_username": "octocat",
    "stackoverflow_id": "1",
    "solana_address": "EQSod18RNXNu9tGr4JFaSazDaVF2NNfdGpnzjdnq4PEf",
    "collateral_asset": "US_BONDS"
  }'
```

## Testing Flow

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **In another terminal, run the test script:**
   ```bash
   node test-underwriting.js
   ```

3. **Or use curl commands above to test individual endpoints**

## Expected Response (Underwriting Endpoint)

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
      "scoring_reasoning": "Base 500 + 100 (Web2 verified identity) + 100 (GitHub developer) - 100 (no Web3 activity) = 600",
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
  "timestamp": "2026-02-22T10:30:45.123Z"
}
```

## Key Response Fields Explained

- **calculated_trust_score**: Score from 300-850 (higher is better)
- **trust_tier**: Tier 1 (excellent), Tier 2 (good), or Tier 3 (fair)
- **required_collateral_percentage**: LTV ratio (Loan-to-Value)
  - 115% = Can borrow 115 for every 100 in collateral
  - 160% = High-risk tier with crypto collateral
  - 220% = Lowest trust tier with high-volatility assets
- **pricing_array_percentages**: Commission rates for different loan durations
  - Tier 1 uses base rates (1%, 2.8%, 5.2%, 9.8%)
  - Tier 2 multiplies by 1.25
  - Tier 3 multiplies by 1.75

## Troubleshooting

### CRUSOE_API_KEY Error
- Ensure `.env` file is in the project root
- Check that `CRUSOE_API_KEY` is correctly set
- Verify the API key has access to Crusoe API

### Connection Refused
- Make sure server is running: `node server.js`
- Check port 3000 is not in use: `lsof -i :3000`

### Slow Response
- Crusoe AI may take 10-30 seconds for underwriting
- Default timeout is 30 seconds
