use anchor_lang::prelude::*;

declare_id!("BsP8bnHPxA2dr2mov3sUzqfoqMZeLFDpsmeX1D8h7uPp");

#[program]
pub mod smart_contracts_vault_program {
    use super::*;

    /// Initialize global vault
    pub fn initialize_global_vault(
        ctx: Context<InitializeGlobalVault>,
        platform_fee_bps: u16,
    ) -> Result<()> {
        ctx.accounts.global_vault.authority = ctx.accounts.authority.key();
        ctx.accounts.global_vault.platform_fee_bps = platform_fee_bps;
        ctx.accounts.global_vault.total_tvl = 0;
        ctx.accounts.global_vault.bump = ctx.bumps.global_vault;
        msg!("Global vault initialized");
        Ok(())
    }

    /// Create strategy vault
    pub fn create_strategy(
        ctx: Context<CreateStrategy>,
        min_deposit: u64,
    ) -> Result<()> {
        ctx.accounts.strategy_vault.global_vault = ctx.accounts.global_vault.key();
        ctx.accounts.strategy_vault.authority = ctx.accounts.authority.key();
        ctx.accounts.strategy_vault.min_deposit = min_deposit;
        ctx.accounts.strategy_vault.is_active = true;
        ctx.accounts.strategy_vault.bump = ctx.bumps.strategy_vault;
        msg!("Strategy created");
        Ok(())
    }

    /// Deposit to strategy
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);
        let user_deposit = &mut ctx.accounts.user_deposit;
        user_deposit.user = ctx.accounts.user.key();
        user_deposit.strategy_vault = ctx.accounts.strategy_vault.key();
        user_deposit.amount = user_deposit.amount.saturating_add(amount);

        ctx.accounts.strategy_vault.total_deposits += amount;
        ctx.accounts.global_vault.total_tvl += amount;
        msg!("Deposited {}", amount);
        Ok(())
    }

    /// Withdraw from strategy
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidAmount);
        require!(
            ctx.accounts.user_deposit.amount >= amount,
            VaultError::InsufficientBalance
        );
        ctx.accounts.user_deposit.amount -= amount;
        ctx.accounts.strategy_vault.total_withdrawals += amount;
        ctx.accounts.global_vault.total_tvl = ctx.accounts.global_vault
            .total_tvl
            .saturating_sub(amount);
        msg!("Withdrawn {}", amount);
        Ok(())
    }

    /// Update performance
    pub fn update_performance(
        ctx: Context<UpdatePerf>,
        change: i32,
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.strategy_vault.authority,
            VaultError::Unauthorized
        );
        ctx.accounts.strategy_vault.performance_bps = ctx.accounts.strategy_vault
            .performance_bps
            .saturating_add(change);
        Ok(())
    }
}

// ==================== Accounts ====================

#[account]
pub struct GlobalVault {
    pub authority: Pubkey,
    pub platform_fee_bps: u16,
    pub total_tvl: u64,
    pub bump: u8,
}

#[account]
pub struct StrategyVault {
    pub global_vault: Pubkey,
    pub authority: Pubkey,
    pub strategy_id: u8,
    pub min_deposit: u64,
    pub total_deposits: u64,
    pub total_withdrawals: u64,
    pub performance_bps: i32,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct UserDeposit {
    pub user: Pubkey,
    pub strategy_vault: Pubkey,
    pub amount: u64,
}

// ==================== Contexts ====================

#[derive(Accounts)]
pub struct InitializeGlobalVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 2 + 8 + 1,
        seeds = [b"global-vault".as_ref()],
        bump
    )]
    pub global_vault: Account<'info, GlobalVault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateStrategy<'info> {
    #[account(mut, seeds = [b"global-vault".as_ref()], bump = global_vault.bump)]
    pub global_vault: Account<'info, GlobalVault>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1 + 8 + 8 + 8 + 4 + 1 + 1,
        seeds = [b"strategy-vault".as_ref()],
        bump
    )]
    pub strategy_vault: Account<'info, StrategyVault>,
    #[account(mut, constraint = authority.key() == global_vault.authority)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub global_vault: Account<'info, GlobalVault>,
    #[account(mut)]
    pub strategy_vault: Account<'info, StrategyVault>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8,
        seeds = [b"deposit", user.key().as_ref(), strategy_vault.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub global_vault: Account<'info, GlobalVault>,
    #[account(mut)]
    pub strategy_vault: Account<'info, StrategyVault>,
    #[account(mut)]
    pub user_deposit: Account<'info, UserDeposit>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdatePerf<'info> {
    #[account(mut)]
    pub strategy_vault: Account<'info, StrategyVault>,
    pub authority: Signer<'info>,
}

// ==================== Errors ====================

#[error_code]
pub enum VaultError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid strategy")]
    InvalidStrategy,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
