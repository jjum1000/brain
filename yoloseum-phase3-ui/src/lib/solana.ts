import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

/**
 * Solana RPC endpoint configuration
 */
export const getSolanaRpcUrl = (): string => {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL;

  if (!rpcUrl) {
    const network = (import.meta.env.VITE_SOLANA_NETWORK as 'devnet' | 'testnet' | 'mainnet-beta') || 'devnet';
    return clusterApiUrl(network);
  }

  return rpcUrl;
};

/**
 * Get Solana network from environment
 */
export const getSolanaNetwork = (): string => {
  return import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
};

/**
 * Supported wallet adapters
 */
export const walletAdapters = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

/**
 * Create a Solana RPC connection
 */
export const createConnection = (): Connection => {
  const rpcUrl = getSolanaRpcUrl();
  return new Connection(rpcUrl, 'confirmed');
};

/**
 * Validate Solana address format
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Format public key for display (truncated)
 * @param publicKey - Solana PublicKey
 * @param chars - Number of characters to show from start and end
 * @returns Formatted string like "ABC...XYZ"
 */
export const formatPublicKey = (publicKey: PublicKey, chars: number = 4): string => {
  const address = publicKey.toBase58();
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Convert lamports to SOL
 * @param lamports - Amount in lamports
 * @returns Amount in SOL
 */
export const lamportsToSol = (lamports: number): number => {
  return lamports / 1_000_000_000;
};

/**
 * Convert SOL to lamports
 * @param sol - Amount in SOL
 * @returns Amount in lamports
 */
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 1_000_000_000);
};

/**
 * Get SOL balance for a public key
 */
export const getSolBalance = async (
  publicKey: PublicKey,
  connection: Connection
): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return lamportsToSol(balance);
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    throw new Error('SOL 잔액을 조회할 수 없습니다');
  }
};

/**
 * Solana error messages for user display
 */
export const solanaErrorMessages: Record<string, string> = {
  'User rejected the request': '지갑 연결을 거부했습니다',
  'Wallet not found': '지갑을 찾을 수 없습니다. 먼저 설치해주세요',
  'Wallet connection failed': '지갑 연결에 실패했습니다',
  'Network error': '네트워크 연결을 확인해주세요',
  'Invalid public key': '유효하지 않은 지갑 주소입니다',
  'Failed to fetch balance': 'SOL 잔액을 조회할 수 없습니다',
};

/**
 * Get user-friendly error message for Solana errors
 */
export const getSolanaErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return solanaErrorMessages[error] || error;
  }

  if (error instanceof Error) {
    const message = error.message;

    // Check for matching error messages
    for (const [key, userMessage] of Object.entries(solanaErrorMessages)) {
      if (message.includes(key)) {
        return userMessage;
      }
    }

    return message || '지갑 작업 중 오류가 발생했습니다';
  }

  return '지갑 작업 중 알 수 없는 오류가 발생했습니다';
};
