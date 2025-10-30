import { useState, useCallback, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VaultContract } from '@/lib/contracts/vaultContract';
import { getVaultErrorMessage } from '@/lib/errorHandler';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type {
  DepositParams,
  WithdrawParams,
  DepositResult,
  WithdrawResult,
  VaultState,
} from '@/types/vault';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface UseVaultContractState extends VaultState {
  depositingAmount?: number;
  withdrawingShares?: number;
}

/**
 * useVaultContract Hook
 * Manages vault deposit and withdrawal operations
 *
 * Features:
 * - Transaction building and signing
 * - Error handling with user-friendly messages
 * - Firestore transaction recording
 * - Real-time state management
 *
 * @example
 * const { deposit, withdraw, depositing, withdrawing, error } = useVaultContract();
 *
 * const result = await deposit({
 *   vaultAddress: new PublicKey('...'),
 *   amount: BigInt(1_000_000_000), // 1 SOL in lamports
 *   userPublicKey: publicKey,
 * });
 */
export const useVaultContract = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { user: authUser } = useAuth();

  const [state, setState] = useState<UseVaultContractState>({
    depositing: false,
    withdrawing: false,
    loading: false,
    error: null,
  });

  // Use ref to avoid recreating VaultContract on every render
  const vaultContractRef = useRef<VaultContract | null>(null);

  const getVaultContract = useCallback(() => {
    if (!vaultContractRef.current) {
      vaultContractRef.current = new VaultContract(connection);
    }
    return vaultContractRef.current;
  }, [connection]);

  /**
   * Execute a deposit transaction
   *
   * Flow:
   * 1. Build transaction
   * 2. Sign with wallet
   * 3. Send to network
   * 4. Wait for confirmation
   * 5. Record in Firestore
   */
  const deposit = useCallback(
    async (params: DepositParams): Promise<DepositResult> => {
      if (!publicKey || !signTransaction || !sendTransaction) {
        const error = new Error('Wallet not connected');
        setState(prev => ({
          ...prev,
          error,
          depositing: false,
        }));
        toast({
          title: '지갑 연결 필요',
          description: '지갑을 연결한 후 다시 시도해주세요',
          variant: 'destructive',
        });
        throw error;
      }

      if (!authUser) {
        const error = new Error('User not authenticated');
        setState(prev => ({
          ...prev,
          error,
          depositing: false,
        }));
        toast({
          title: '로그인 필요',
          description: '로그인 후 다시 시도해주세요',
          variant: 'destructive',
        });
        throw error;
      }

      setState(prev => ({
        ...prev,
        depositing: true,
        error: null,
        depositingAmount: Number(params.amount) / 1_000_000_000, // Convert to SOL for display
      }));

      const vaultContract = getVaultContract();

      try {
        console.log('🔄 Building deposit transaction...');

        // 1. Build transaction
        const tx = await vaultContract.buildDepositTransaction({
          ...params,
          userPublicKey: publicKey,
        });

        // Get recent blockhash
        const latestBlockhash = await connection.getLatestBlockhash();
        tx.feePayer = publicKey;
        tx.recentBlockhash = latestBlockhash.blockhash;

        console.log('✅ Transaction built, signing...');

        // 2. Sign transaction
        const signedTx = await signTransaction(tx);

        console.log('✅ Transaction signed, sending...');

        // 3. Send transaction
        const signature = await sendTransaction(signedTx, connection);

        console.log('🚀 Transaction sent:', signature);

        // 4. Wait for confirmation
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        console.log('✨ Deposit confirmed!');

        // 5. Record in Firestore
        try {
          await addDoc(collection(db, 'transactions'), {
            userId: authUser.id,
            strategyId: params.vaultAddress.toString(),
            type: 'deposit',
            amount: Number(params.amount) / 1_000_000_000, // Store in SOL
            currency: 'SOL',
            status: 'completed',
            txHash: signature,
            createdAt: Timestamp.now(),
            completedAt: Timestamp.now(),
            metadata: {
              vaultAddress: params.vaultAddress.toString(),
              source: 'vault_contract',
            },
          });

          console.log('📝 Transaction recorded in Firestore');
        } catch (firestoreError) {
          console.warn('⚠️ Failed to record transaction in Firestore:', firestoreError);
          // Don't throw - transaction succeeded on-chain
        }

        const result: DepositResult = {
          transactionSignature: signature,
          sharesIssued: BigInt(0), // Would need contract to return this
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          depositing: false,
          lastDepositHash: signature,
        }));

        toast({
          title: '입금 성공',
          description: `${(Number(params.amount) / 1_000_000_000).toFixed(4)} SOL이 입금되었습니다`,
        });

        return result;
      } catch (error) {
        const errorMessage = getVaultErrorMessage(error);
        console.error('❌ Deposit failed:', error);

        setState(prev => ({
          ...prev,
          error: new Error(errorMessage),
          depositing: false,
        }));

        toast({
          title: '입금 실패',
          description: errorMessage,
          variant: 'destructive',
        });

        throw error;
      }
    },
    [publicKey, signTransaction, sendTransaction, connection, authUser, getVaultContract]
  );

  /**
   * Execute a withdrawal transaction
   *
   * Flow:
   * 1. Build transaction
   * 2. Sign with wallet
   * 3. Send to network
   * 4. Wait for confirmation
   * 5. Record in Firestore
   */
  const withdraw = useCallback(
    async (params: WithdrawParams): Promise<WithdrawResult> => {
      if (!publicKey || !signTransaction || !sendTransaction) {
        const error = new Error('Wallet not connected');
        setState(prev => ({
          ...prev,
          error,
          withdrawing: false,
        }));
        toast({
          title: '지갑 연결 필요',
          description: '지갑을 연결한 후 다시 시도해주세요',
          variant: 'destructive',
        });
        throw error;
      }

      if (!authUser) {
        const error = new Error('User not authenticated');
        setState(prev => ({
          ...prev,
          error,
          withdrawing: false,
        }));
        toast({
          title: '로그인 필요',
          description: '로그인 후 다시 시도해주세요',
          variant: 'destructive',
        });
        throw error;
      }

      setState(prev => ({
        ...prev,
        withdrawing: true,
        error: null,
        withdrawingShares: Number(params.shares),
      }));

      const vaultContract = getVaultContract();

      try {
        console.log('🔄 Building withdrawal transaction...');

        // 1. Build transaction
        const tx = await vaultContract.buildWithdrawTransaction({
          ...params,
          userPublicKey: publicKey,
        });

        // Get recent blockhash
        const latestBlockhash = await connection.getLatestBlockhash();
        tx.feePayer = publicKey;
        tx.recentBlockhash = latestBlockhash.blockhash;

        console.log('✅ Transaction built, signing...');

        // 2. Sign transaction
        const signedTx = await signTransaction(tx);

        console.log('✅ Transaction signed, sending...');

        // 3. Send transaction
        const signature = await sendTransaction(signedTx, connection);

        console.log('🚀 Transaction sent:', signature);

        // 4. Wait for confirmation
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed'
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        console.log('✨ Withdrawal confirmed!');

        // 5. Record in Firestore
        try {
          await addDoc(collection(db, 'transactions'), {
            userId: authUser.id,
            strategyId: params.vaultAddress.toString(),
            type: 'withdraw',
            amount: 0, // Will be calculated from shares on-chain
            currency: 'SOL',
            status: 'completed',
            txHash: signature,
            createdAt: Timestamp.now(),
            completedAt: Timestamp.now(),
            metadata: {
              vaultAddress: params.vaultAddress.toString(),
              shares: params.shares.toString(),
              source: 'vault_contract',
            },
          });

          console.log('📝 Transaction recorded in Firestore');
        } catch (firestoreError) {
          console.warn('⚠️ Failed to record transaction in Firestore:', firestoreError);
          // Don't throw - transaction succeeded on-chain
        }

        const result: WithdrawResult = {
          transactionSignature: signature,
          amountReceived: BigInt(0), // Would need contract to return this
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          withdrawing: false,
          lastWithdrawHash: signature,
        }));

        toast({
          title: '출금 성공',
          description: `${Number(params.shares)}개의 shares가 출금되었습니다`,
        });

        return result;
      } catch (error) {
        const errorMessage = getVaultErrorMessage(error);
        console.error('❌ Withdrawal failed:', error);

        setState(prev => ({
          ...prev,
          error: new Error(errorMessage),
          withdrawing: false,
        }));

        toast({
          title: '출금 실패',
          description: errorMessage,
          variant: 'destructive',
        });

        throw error;
      }
    },
    [publicKey, signTransaction, sendTransaction, connection, authUser, getVaultContract]
  );

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Functions
    deposit,
    withdraw,
    clearError,

    // State
    depositing: state.depositing,
    withdrawing: state.withdrawing,
    loading: state.loading,
    error: state.error,
    depositingAmount: state.depositingAmount,
    withdrawingShares: state.withdrawingShares,

    // Transaction hashes
    lastDepositHash: state.lastDepositHash,
    lastWithdrawHash: state.lastWithdrawHash,
  };
};

/**
 * Export hook type for TypeScript
 */
export type UseVaultContract = ReturnType<typeof useVaultContract>;
