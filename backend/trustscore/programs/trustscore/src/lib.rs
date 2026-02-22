use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("BAoYiH6vNDCvZgggccAisSNRtCCtDDnzWkfU2Hu3SmEb");

#[program]
pub mod trustscore {
    use super::*;

    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            ix,
        );

        system_program::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let user_key = ctx.accounts.user.key();
        let bump = ctx.bumps.vault;

        let seeds = &[
            b"vault",
            user_key.as_ref(),
            &[bump],
        ];

        let signer = &[&seeds[..]];

        let ix = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            ix,
            signer,
        );

        system_program::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = user,
        space = 8,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault (no data stored)
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}