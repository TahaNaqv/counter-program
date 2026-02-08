use anchor_lang::prelude::*;

declare_id!("42auxsnfr5yGL6kj1jWD7dWuwYU1CHYkfNgtW2yPuX3A");

#[program]
pub mod counter_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: 0,
        });
        msg!("Counter initialized!");
        Ok(())
    }

    pub fn increment(ctx: Context<UpdateCounter>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: ctx.accounts.counter.count,
        });
        msg!("Counter is now: {}", ctx.accounts.counter.count);
        Ok(())
    }

    pub fn decrement(ctx: Context<UpdateCounter>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.saturating_sub(1);
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: ctx.accounts.counter.count,
        });
        msg!("Counter is now: {}", ctx.accounts.counter.count);
        Ok(())
    }

    pub fn reset(ctx: Context<UpdateCounter>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: 0,
        });
        msg!("Counter reset to 0");
        Ok(())
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        emit!(CounterUpdated {
            user: ctx.accounts.user.key(),
            count: ctx.accounts.counter.count,
        });
        Ok(())
    }
}

#[account]
pub struct Counter {
    pub count: u64,
}

#[event]
pub struct CounterUpdated {
    pub user: Pubkey,
    pub count: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCounter<'info> {
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, Counter>,

    pub user: Signer<'info>,
}

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
