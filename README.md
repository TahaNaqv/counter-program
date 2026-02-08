# Counter Program (Anchor)

A Solana program that stores a **per-user counter**. Each wallet has one Counter account (a PDA). Built with the [Anchor](https://www.anchor-lang.com/) framework.

## Overview

- **Program ID:** `42auxsnfr5yGL6kj1jWD7dWuwYU1CHYkfNgtW2yPuX3A` (devnet)
- **Instructions:** `initialize`, `increment`, `decrement`, `reset`, `close`
- **Account:** One `Counter` account per user (PDA from seeds `["counter", user_pubkey]`)
- **Event:** `CounterUpdated` emitted on state changes for off-chain indexing

## Prerequisites

- [Rust](https://rustup.rs/) (toolchain 1.89.0 via `rust-toolchain.toml`)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.32.x)
- [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) (or npm)

## Project structure

```
counter-program/
├── Anchor.toml          # Anchor config (program id, provider, test script)
├── Cargo.toml           # Workspace root
├── package.json         # JS/TS deps and scripts (Anchor, Mocha, etc.)
├── programs/
│   └── counter-program/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs   # Program logic (instructions, accounts, events)
├── tests/
│   └── counter-program.ts   # Integration tests
├── migrations/
│   └── deploy.ts        # Deploy script (optional extra logic)
└── target/              # Build output (IDL, keypairs, .so)
```

## Setup

1. **Install dependencies (Rust):**  
   Rust is used automatically via `rust-toolchain.toml`. No extra step if Rust is installed.

2. **Install Solana CLI and set cluster (optional for local tests):**
   ```bash
   solana config set --url localhost   # for anchor test
   # or
   solana config set --url devnet     # for deploy to devnet
   ```

3. **Install Node dependencies:**
   ```bash
   yarn install
   # or: npm install
   ```

4. **Install Anchor CLI** (if not already):
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked
   avm install 0.32.1
   avm use 0.32.1
   ```

## Commands

### Build

Build the program and generate the IDL + TypeScript types under `target/`:

```bash
anchor build
```

- Produces: `target/deploy/counter_program.so`, `target/idl/counter_program.json`, `target/types/counter_program.ts`

### Test

Run the test suite. By default this starts a **local validator**, deploys the program, then runs the TypeScript tests:

```bash
anchor test
```

- Uses the `[scripts] test` entry from `Anchor.toml` (e.g. `yarn run ts-mocha ...`).
- To use an already-running validator (e.g. `solana-test-validator`), you can use `anchor test --skip-local-validator` (ensure the program is deployed and the cluster matches `Anchor.toml`).

### Run tests only (no build/deploy)

If the program is already built and a validator is running with the program deployed:

```bash
yarn test
# or, explicitly:
yarn run ts-mocha -p ./tsconfig.json -t 1000000 "tests/**/*.ts"
```

### Deploy to Devnet

1. Point Solana CLI to devnet and ensure wallet has SOL:
   ```bash
   solana config set --url devnet
   solana balance
   ```

2. Deploy:
   ```bash
   anchor deploy --provider.cluster devnet
   ```

   The program ID in the code and `Anchor.toml` must match the keypair used for deployment (or update `declare_id!` and `Anchor.toml` after generating a new keypair).

### Lint

```bash
yarn lint        # check formatting
yarn lint:fix    # fix formatting (Prettier)
```

### Program keypairs

List keypairs used for build/deploy:

```bash
anchor keys list
```

## Frontend

A React frontend that uses this program lives in the `counter-frontend` directory (same repo). It uses the same program ID and IDL to connect a wallet, derive the counter PDA, and call initialize / increment / decrement / reset / close.

## License

ISC
