import {
  PublicKey,
  Transaction,
  Connection,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import {
  VAULT_PROGRAM_ID,
  STRATEGY_VAULTS,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from './contractConfig';
import type {
  DepositParams,
  WithdrawParams,
} from '@/types/vault';

/**
 * VaultContract class
 * Handles construction of vault deposit and withdrawal transactions
 * Uses manual instruction building (compatible until Anchor IDL is available)
 */
export class VaultContract {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: PublicKey = VAULT_PROGRAM_ID) {
    this.connection = connection;
    this.programId = programId;
  }

  /**
   * Build a deposit transaction
   * Constructs the necessary instructions for depositing tokens into a vault
   *
   * @param params Deposit parameters
   * @returns Unsigned transaction ready for signing
   * @throws Error if accounts cannot be found or transaction cannot be built
   */
  async buildDepositTransaction(params: DepositParams): Promise<Transaction> {
    const { vaultAddress, amount, userPublicKey, slippageBps = 50 } = params;

    // 1. Get vault configuration
    const vaultConfig = await this.getVaultAccount(vaultAddress);
    if (!vaultConfig) {
      throw new Error('Vault account not found');
    }

    // 2. Get user's token account
    const userTokenAccount = await this.getOrCreateUserTokenAccount(
      userPublicKey,
      vaultConfig.mint
    );

    if (!userTokenAccount) {
      throw new Error('User token account not found');
    }

    // 3. Get vault's token account
    const vaultTokenAccount = await this.getVaultTokenAccount(vaultAddress);
    if (!vaultTokenAccount) {
      throw new Error('Vault token account not found');
    }

    // 4. Get user's vault account (shares account)
    const userVaultAccount = await this.getUserVaultAccount(userPublicKey, vaultAddress);

    // 5. Build transaction
    const tx = new Transaction();

    // Create user vault account if it doesn't exist
    if (!userVaultAccount) {
      const createAccountIx = await this.createUserVaultAccountInstruction(
        userPublicKey,
        vaultAddress
      );
      if (createAccountIx) {
        tx.add(createAccountIx);
      }
    }

    // Add deposit instruction
    const depositIx = this.createDepositInstruction({
      vault: vaultAddress,
      vaultAuthority: vaultConfig.authority,
      vaultTokenAccount,
      userTokenAccount,
      userVaultAccount: userVaultAccount || (await this.deriveUserVaultAccount(userPublicKey, vaultAddress)),
      userPublicKey,
      amount: new BN(amount.toString()),
      slippageBps: new BN(slippageBps),
    });

    tx.add(depositIx);

    return tx;
  }

  /**
   * Build a withdrawal transaction
   * Constructs the necessary instructions for withdrawing from a vault
   *
   * @param params Withdrawal parameters
   * @returns Unsigned transaction ready for signing
   * @throws Error if accounts cannot be found or transaction cannot be built
   */
  async buildWithdrawTransaction(params: WithdrawParams): Promise<Transaction> {
    const { vaultAddress, shares, userPublicKey, minAmount = BigInt(0) } = params;

    // 1. Get vault configuration
    const vaultConfig = await this.getVaultAccount(vaultAddress);
    if (!vaultConfig) {
      throw new Error('Vault account not found');
    }

    // 2. Get user's token account
    const userTokenAccount = await this.getOrCreateUserTokenAccount(
      userPublicKey,
      vaultConfig.mint
    );

    if (!userTokenAccount) {
      throw new Error('User token account not found');
    }

    // 3. Get vault's token account
    const vaultTokenAccount = await this.getVaultTokenAccount(vaultAddress);
    if (!vaultTokenAccount) {
      throw new Error('Vault token account not found');
    }

    // 4. Get user's vault account
    const userVaultAccount = await this.deriveUserVaultAccount(userPublicKey, vaultAddress);

    // 5. Build transaction
    const tx = new Transaction();

    // Add withdrawal instruction
    const withdrawIx = this.createWithdrawInstruction({
      vault: vaultAddress,
      vaultAuthority: vaultConfig.authority,
      vaultTokenAccount,
      userTokenAccount,
      userVaultAccount,
      userPublicKey,
      shares: new BN(shares.toString()),
      minAmount: new BN(minAmount.toString()),
    });

    tx.add(withdrawIx);

    return tx;
  }

  /**
   * Get vault account information
   * Retrieves vault account data from blockchain
   */
  private async getVaultAccount(
    vaultAddress: PublicKey
  ): Promise<{ mint: PublicKey; authority: PublicKey; decimals: number } | null> {
    try {
      const account = await this.connection.getAccountInfo(vaultAddress);
      if (!account) return null;

      // For now, we need to find the vault config that matches this address
      for (const [, config] of Object.entries(STRATEGY_VAULTS)) {
        if (config.address.equals(vaultAddress)) {
          return {
            mint: config.mint,
            authority: vaultAddress,
            decimals: config.decimals,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get vault account:', error);
      throw new Error(`Failed to get vault account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get user's vault account (shares account)
   * Returns null if account doesn't exist (needs to be created)
   */
  private async getUserVaultAccount(
    userPublicKey: PublicKey,
    vaultAddress: PublicKey
  ): Promise<PublicKey | null> {
    try {
      const accountPubkey = await this.deriveUserVaultAccount(userPublicKey, vaultAddress);
      const account = await this.connection.getAccountInfo(accountPubkey);
      return account ? accountPubkey : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Derive user's vault account PDA (Program Derived Address)
   */
  private async deriveUserVaultAccount(
    userPublicKey: PublicKey,
    vaultAddress: PublicKey
  ): Promise<PublicKey> {
    // Derive PDA for user vault account
    // Seed: ['vault_account', vault_address, user_address]
    const seeds = [
      Buffer.from('vault_account'),
      vaultAddress.toBuffer(),
      userPublicKey.toBuffer(),
    ];

    const [pda] = await PublicKey.findProgramAddress(seeds, this.programId);
    return pda;
  }

  /**
   * Get or create user's token account
   * If account doesn't exist, find the associated token account
   */
  private async getOrCreateUserTokenAccount(
    userPublicKey: PublicKey,
    mint: PublicKey
  ): Promise<PublicKey | null> {
    try {
      // Get associated token account
      const ata = await this.getAssociatedTokenAccount(userPublicKey, mint);

      // Check if account exists
      const account = await this.connection.getAccountInfo(ata);
      if (account) {
        return ata;
      }

      // Account doesn't exist but we can return the ATA address
      // Client will need to create it if necessary
      return ata;
    } catch (error) {
      console.error('Failed to get user token account:', error);
      return null;
    }
  }

  /**
   * Get associated token account address
   */
  private async getAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey
  ): Promise<PublicKey> {
    // Derive associated token account
    const [ata] = await PublicKey.findProgramAddress(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return ata;
  }

  /**
   * Get vault's token account
   * This is typically a PDA derived from the vault address
   */
  private async getVaultTokenAccount(vaultAddress: PublicKey): Promise<PublicKey> {
    // Derive vault's token account PDA
    // Seed: ['vault_token_account', vault_address]
    const seeds = [Buffer.from('vault_token_account'), vaultAddress.toBuffer()];

    const [pda] = await PublicKey.findProgramAddress(seeds, this.programId);
    return pda;
  }

  /**
   * Create instruction to initialize user vault account
   * Returns null if account already exists
   */
  private async createUserVaultAccountInstruction(
    userPublicKey: PublicKey,
    vaultAddress: PublicKey
  ): Promise<TransactionInstruction | null> {
    try {
      const userVaultAccount = await this.deriveUserVaultAccount(userPublicKey, vaultAddress);

      // Check if account exists
      const account = await this.connection.getAccountInfo(userVaultAccount);
      if (account) {
        return null; // Account already exists
      }

      // Create initialize account instruction
      return SystemProgram.createAccount({
        fromPubkey: userPublicKey,
        newAccountPubkey: userVaultAccount,
        lamports: 1000000, // Approximate rent for vault account
        space: 64, // Vault account data size
        programId: this.programId,
      });
    } catch (error) {
      console.warn('Failed to create user vault account instruction:', error);
      return null;
    }
  }

  /**
   * Create deposit instruction
   * Manual instruction building (until Anchor IDL available)
   */
  private createDepositInstruction(params: {
    vault: PublicKey;
    vaultAuthority: PublicKey;
    vaultTokenAccount: PublicKey;
    userTokenAccount: PublicKey;
    userVaultAccount: PublicKey;
    userPublicKey: PublicKey;
    amount: BN;
    slippageBps: BN;
  }): TransactionInstruction {
    const { vault, vaultAuthority, vaultTokenAccount, userTokenAccount, userVaultAccount, userPublicKey, amount, slippageBps } = params;

    // Deposit instruction discriminator (8 bytes)
    // This is the hash of "global:deposit" using anchor's discriminator format
    const discriminator = Buffer.from([0xe8, 0x61, 0x82, 0xa6, 0xa9, 0x76, 0x7d, 0x20]); // deposit discriminator

    // Build instruction data
    // [discriminator(8)] [amount(16 bytes as u128)] [slippage_bps(2 bytes as u16)]
    const amountBuffer = Buffer.alloc(16);
    amountBuffer.writeBigUInt64LE(amount.toBigInt(), 0);

    const slippageBuffer = Buffer.alloc(2);
    slippageBuffer.writeUInt16LE(slippageBps.toNumber());

    const instructionData = Buffer.concat([discriminator, amountBuffer, slippageBuffer]);

    // Account metas
    const keys = [
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: vaultAuthority, isSigner: false, isWritable: false },
      { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userVaultAccount, isSigner: false, isWritable: true },
      { pubkey: userPublicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: instructionData,
    });
  }

  /**
   * Create withdrawal instruction
   * Manual instruction building (until Anchor IDL available)
   */
  private createWithdrawInstruction(params: {
    vault: PublicKey;
    vaultAuthority: PublicKey;
    vaultTokenAccount: PublicKey;
    userTokenAccount: PublicKey;
    userVaultAccount: PublicKey;
    userPublicKey: PublicKey;
    shares: BN;
    minAmount: BN;
  }): TransactionInstruction {
    const { vault, vaultAuthority, vaultTokenAccount, userTokenAccount, userVaultAccount, userPublicKey, shares, minAmount } = params;

    // Withdrawal instruction discriminator
    const discriminator = Buffer.from([0x54, 0x85, 0xaa, 0x89, 0x3f, 0x2f, 0xcd, 0x22]); // withdraw discriminator

    // Build instruction data
    // [discriminator(8)] [shares(16 bytes as u128)] [min_amount(16 bytes as u128)]
    const sharesBuffer = Buffer.alloc(16);
    sharesBuffer.writeBigUInt64LE(shares.toBigInt(), 0);

    const minAmountBuffer = Buffer.alloc(16);
    minAmountBuffer.writeBigUInt64LE(minAmount.toBigInt(), 0);

    const instructionData = Buffer.concat([discriminator, sharesBuffer, minAmountBuffer]);

    // Account metas
    const keys = [
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: vaultAuthority, isSigner: false, isWritable: false },
      { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userVaultAccount, isSigner: false, isWritable: true },
      { pubkey: userPublicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      programId: this.programId,
      keys,
      data: instructionData,
    });
  }
}
