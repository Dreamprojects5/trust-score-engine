

## Add 10-Second Timeout for Balance Loading

Currently, `getBalance` in `TrustScoreDashboard.tsx` only falls back to 10 SOL on error. If the RPC call hangs without resolving or rejecting, the balance stays at 0 and shows "Loading..." indefinitely.

### Change

**File: `src/components/TrustScoreDashboard.tsx`** (line ~30-31)

Update the `useEffect` to race the `getBalance` call against a 10-second timeout. If 10 seconds pass without a response, default the balance to 10 SOL.

```ts
useEffect(() => {
  const timeout = new Promise<number>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), 10000)
  );
  Promise.race([getBalance(walletAddress), timeout])
    .then(setWalletBalance)
    .catch(() => setWalletBalance(10));
}, [walletAddress]);
```

This ensures users are never stuck on "Loading..." -- after 10 seconds they get a fallback balance of 10 SOL and can proceed with the dashboard.

