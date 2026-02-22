import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

// Use devnet for hackathon demo
const NETWORK = "devnet";
const connection = new Connection(clusterApiUrl(NETWORK), "confirmed");

export { connection, NETWORK };

/**
 * Get the Phantom wallet provider from the window object
 */
export function getPhantomProvider(): any | null {
  if ("solana" in window) {
    const provider = (window as any).solana;
    if (provider?.isPhantom) return provider;
  }
  return null;
}

/**
 * Connect to Phantom wallet and return the public key
 */
export async function connectPhantom(): Promise<string> {
  const provider = getPhantomProvider();
  if (!provider) {
    throw new Error("Phantom wallet not found. Please install it from phantom.app");
  }
  const resp = await provider.connect();
  return resp.publicKey.toString();
}

/**
 * Get SOL balance for an address
 */
export async function getBalance(address: string): Promise<number> {
  const pubkey = new PublicKey(address);
  const balance = await connection.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Send SOL from connected Phantom wallet to a recipient
 */
export async function sendSol(
  recipientAddress: string,
  amountSol: number
): Promise<string> {
  const provider = getPhantomProvider();
  if (!provider?.publicKey) {
    throw new Error("Wallet not connected");
  }

  const recipientPubkey = new PublicKey(recipientAddress);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: recipientPubkey,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  transaction.feePayer = provider.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  const signed = await provider.signTransaction(transaction);
  const txId = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(txId, "confirmed");

  return txId;
}
