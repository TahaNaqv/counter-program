use anchor_lang::prelude::*;

declare_id!("42auxsnfr5yGL6kj1jWD7dWuwYU1CHYkfNgtW2yPuX3A");

#[program]
pub mod counter_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
