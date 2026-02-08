//! Solana program that stores a per-user counter.
//! Each wallet gets one Counter account (PDA). Built with the Anchor framework.
//! In this file you'll see: the program module (instructions), account structs,
//! an event, and account context structs that define which accounts each instruction needs.

use anchor_lang::prelude::*;

// Program's on-chain public key; must match deployment (Anchor.toml / devnet).
// Changing this changes the program address; clients and IDL must use the same ID.
declare_id!("42auxsnfr5yGL6kj1jWD7dWuwYU1CHYkfNgtW2yPuX3A");

// Instructions (entrypoints) that clients can call. Each pub fn is one instruction.
// Context<...> encodes which accounts the instruction expects; Anchor validates them before the fn runs.
#[program]
pub mod counter_program {
    use super::*;

    /// Creates the Counter PDA for the signer and sets count to 0.
    /// ctx.accounts = validated accounts; emit! = event for off-chain indexing; msg! = logs.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: 0,
        });
        msg!("Counter initialized!");
        Ok(())
    }

    /// Increments the counter by 1. Counter account must be mut (writable) to change data.
    pub fn increment(ctx: Context<UpdateCounter>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: ctx.accounts.counter.count,
        });
        msg!("Counter is now: {}", ctx.accounts.counter.count);
        Ok(())
    }

    /// Decrements the counter by 1. saturating_sub prevents underflow; count stays at 0.
    pub fn decrement(ctx: Context<UpdateCounter>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.saturating_sub(1);
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: ctx.accounts.counter.count,
        });
        msg!("Counter is now: {}", ctx.accounts.counter.count);
        Ok(())
    }

    /// Resets the counter to 0.
    pub fn reset(ctx: Context<UpdateCounter>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: 0,
        });
        msg!("Counter reset to 0");
        Ok(())
    }

    /// Closes the account and returns rent to user. PDA can be re-initialized afterward.
    pub fn close(ctx: Context<Close>) -> Result<()> {
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: ctx.accounts.counter.count,
        });
        Ok(())
    }
}

// On-chain data layout for the counter account (only count: u64).
// Anchor adds an 8-byte discriminator; total space = 8 + 8 = 16, matching space in Initialize.
#[account]
pub struct Counter {
    pub count: u64,
}

// Events are emitted on-chain and can be read by indexers/frontends for "counter changed" notifications.
#[event]
pub struct CounterUpdated {
    pub user: Pubkey,
    pub count: u64,
}

// Defines which accounts Initialize needs and how they are validated. Validation runs before instruction logic.
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,           // create the account
        payer = user,   // user pays rent
        space = 8 + 8,  // 8 discriminator + 8 for u64
        seeds = [b"counter", user.key().as_ref()],  // PDA seeds; must match client ["counter", user]
        bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Same PDA seeds as Initialize, but no init—account must already exist. Used by increment, decrement, reset.
#[derive(Accounts)]
pub struct UpdateCounter<'info> {
    #[account(
        mut,  // writable so we can change count
        seeds = [b"counter", user.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, Counter>,

    pub user: Signer<'info>,
}

// close = user: account is closed and rent is returned to user. Same PDA seeds for the correct account.
#[derive(Accounts)]
pub struct Close<'info> {
    #[account(
        mut,
        close = user,
        seeds = [b"counter", user.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, Counter>,

    pub user: Signer<'info>,
}
