# 📋 DEPLOYMENT PHASE 2: 스마트 컨트랙트 개발 및 배포

**단계**: Phase 2
**기간**: 3-4일
**목표**: Solana Testnet에 Vault 프로그램 배포 및 검증
**난이도**: ⭐⭐⭐⭐ (어려움)

---

## 📚 필수 지식

### 사전 요구사항

1. **Solana CLI 설치**
   ```bash
   # Windows
   curl https://release.solana.com/stable/install | sh
   ```

2. **Rust 설치**
   ```bash
   # Windows: https://rustup.rs/
   # 또는 cmd에서
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Anchor Framework**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked
   avm install latest
   avm use latest
   ```

---

## 🔄 작업 절차

### 1단계: Vault 프로그램 생성 (4시간)

```bash
# 프로젝트 생성
anchor init vault_program
cd vault_program

# 프로젝트 구조
vault_program/
├── programs/
│   └── vault_program/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs          # 메인 프로그램
│           └── instructions/   # 명령어들
├── tests/
│   └── vault_program.ts        # 테스트
└── Anchor.toml
```

### 2단계: Vault 계정 설계 (2시간)

**lib.rs**:
```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod vault_program {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        fee_percentage: u16,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.fee_percentage = fee_percentage;
        vault.total_deposits = 0;
        vault.total_withdrawals = 0;
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.total_deposits += amount;

        // 실제 전송은 프론트엔드에서 처리
        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(
            vault.total_deposits >= amount,
            VaultError::InsufficientFunds
        );
        vault.total_withdrawals += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 2 + 8 + 8 + 1,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub fee_percentage: u16,
    pub total_deposits: u64,
    pub total_withdrawals: u64,
    pub bump: u8,
}

#[error_code]
pub enum VaultError {
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
```

### 3단계: 단위 테스트 작성 (3시간)

**tests/vault_program.ts**:
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VaultProgram } from "../target/types/vault_program";

describe("vault_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VaultProgram as Program<VaultProgram>;

  it("Initializes vault", async () => {
    const [vaultPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault")],
      program.programId
    );

    const tx = await program.methods
      .initializeVault(new anchor.BN(20))
      .accounts({
        vault: vaultPda,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize vault tx:", tx);
  });

  it("Deposits funds", async () => {
    const [vaultPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault")],
      program.programId
    );

    const tx = await program.methods
      .deposit(new anchor.BN(1000000))
      .accounts({
        vault: vaultPda,
        owner: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Deposit tx:", tx);
  });
});
```

### 4단계: Testnet 배포 (2시간)

```bash
# Testnet RPC로 전환
solana config set --url https://api.testnet.solana.com

# 테스트 지갑 생성
solana-keygen new --outfile ~/testnet-wallet.json

# Testnet SOL 받기 (Faucet)
solana airdrop 2 $(solana-keygen pubkey ~/testnet-wallet.json)

# 지갑 설정
solana config set --keypair ~/testnet-wallet.json

# 배포
anchor deploy

# 출력:
# Program Address: 11111111111111111111111111111111
```

### 5단계: 프로그램 테스트 (2시간)

```bash
# 로컬 테스트
anchor test

# Testnet에서 테스트
anchor test --provider.cluster testnet

# 결과 확인
# ✓ vault_program (3 tests passed)
```

---

## 🔑 프로그램 ID 저장

배포 후 프로그램 ID를 저장합니다:

```bash
# 프로그램 ID 확인
solana address -k target/deploy/vault_program-keypair.json

# 또는
anchor keys list

# 결과 예시:
# vault_program: 9k1YTmZvFfqDdUJdXXk8qYBzwZjCK7kjvVzF6dxX7Ugj
```

**Anchor.toml 업데이트**:
```toml
[programs.testnet]
vault_program = "9k1YTmZvFfqDdUJdXXk8qYBzwZjCK7kjvVzF6dxX7Ugj"
```

**환경 변수 업데이트** (.env.local):
```env
VITE_VAULT_PROGRAM_ID=9k1YTmZvFfqDdUJdXXk8qYBzwZjCK7kjvVzF6dxX7Ugj
VITE_SOLANA_NETWORK=testnet
VITE_SOLANA_RPC_URL=https://api.testnet.solana.com
```

---

## ✅ Phase 2 완료 체크리스트

- [ ] Solana CLI 설치
- [ ] Rust 설치
- [ ] Anchor Framework 설치
- [ ] Vault 프로그램 생성
- [ ] 계정 구조 설계
- [ ] 단위 테스트 작성
- [ ] 로컬에서 테스트 성공
- [ ] Testnet에 배포
- [ ] 배포된 프로그램 ID 저장
- [ ] 프론트엔드 환경 변수 업데이트
- [ ] 프론트엔드에서 테스트

---

## 📞 도움말

### 일반적인 에러

**에러**: "Insufficient SOL to pay for transaction"

```bash
# 해결책: Testnet 토큰 요청
solana airdrop 2
```

**에러**: "Program not found"

```bash
# 해결책: 프로그램 ID 확인
solana account <program_id>
```

### 유용한 명령어

```bash
# 지갑 잔액 확인
solana balance

# Testnet 트랜잭션 확인
solana confirm <tx_signature>

# 프로그램 배포 상태
solana program show <program_id>

# 로그 확인
solana logs <program_id>
```

---

**다음**: DEPLOYMENT_PHASE3_PRODUCTION.md

---

**작성**: Claude AI
**최종 업데이트**: 2025-11-01
