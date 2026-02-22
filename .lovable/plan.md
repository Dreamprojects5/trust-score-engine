

## Role Selection After Wallet Connection

### Overview
After a successful wallet connection, instead of immediately showing the social URL input and "Calculate Trust Score" button, we'll show a role selection screen with two options: **Borrower** and **Lender**. Each role leads to a different flow.

### Flow

```text
Connect Wallet
      |
      v
 Role Selection
 /            \
Borrower     Lender
 |              |
 v              v
Current flow   New Lender Page
(social URL +  (slider to pick %
Trust Score)    of wallet to lend,
                amount display,
                confirm button)
```

### Changes

#### 1. IdentityGateway.tsx - Add role selection step
- Add a new state `role` with values `null | "borrower" | "lender"`
- After wallet connects, instead of showing the social URL input, show two large cards:
  - **Become a Borrower** - with a brief description ("Get under-collateralized loans based on your on-chain reputation")
  - **Become a Lender** - with a brief description ("Earn yield by lending your SOL to verified borrowers")
- Clicking **Borrower** shows the existing social URL input + "Calculate Trust Score" flow
- Clicking **Lender** calls a new `onLend` callback prop

#### 2. Index.tsx - Add lender screen
- Add `"lender"` to the `Screen` type: `"gateway" | "loading" | "dashboard" | "lender"`
- Pass a new `onLend` callback to `IdentityGateway` that sets screen to `"lender"`
- Render a new `LenderPage` component when screen is `"lender"`

#### 3. New component: LenderPage.tsx
- Accepts `walletAddress` and `onBack` props
- Fetches wallet balance (reusing `getBalance` from solana.ts)
- Shows a UI similar to the borrower's pledge form:
  - Percentage slider (0-100%) with quick-select buttons (0%, 25%, 50%, 75%, 100%)
  - Read-only amount field showing calculated SOL amount
  - "Confirm Lending" button
- On confirm, shows a success message with the amount committed
- Styled consistently with existing glass-card / neon-border design

### Technical Details

**IdentityGateway.tsx:**
- New state: `const [role, setRole] = useState<null | "borrower" | "lender">(null)`
- New prop: `onLend: (wallet: string) => void`
- After wallet connects, render role selection cards when `role === null`
- When `role === "borrower"`, show existing social URL + calculate flow
- When `role === "lender"`, call `onLend(walletAddress)`

**Index.tsx:**
- Screen type becomes `"gateway" | "loading" | "dashboard" | "lender"`
- New handler: `handleLend` sets wallet address and screen to `"lender"`
- Render `<LenderPage>` when screen is `"lender"`

**LenderPage.tsx (new file):**
- Reuses `getBalance` from `@/lib/solana`
- Same slider pattern as TrustScoreDashboard's pledge form
- Shows wallet balance, percentage slider, quick-select buttons, calculated amount
- Confirm button with loading/success states
- Back button to return to gateway
