/**
 * Tests for the counter program using Anchor's test harness.
 * Uses the local validator or configured provider (e.g. devnet).
 * We derive the same PDA as the program and call instructions via program.methods.*.rpc().
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterProgram } from "../target/types/counter_program";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("counter-program", () => {
  // Anchor uses this provider (wallet + connection) for all subsequent program.methods calls.
  anchor.setProvider(anchor.AnchorProvider.env());

  // Program client from workspace/IDL; typed with CounterProgram.
  const program = anchor.workspace.counterProgram as Program<CounterProgram>;
  const provider = anchor.getProvider();

  // PDA must use the same seeds as in Rust: ["counter", user_pubkey]. Deterministic; no signer needed.
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), provider.publicKey.toBuffer()],
    program.programId
  );

  it("Initializes counter", async () => {
    // First instruction; expect account to exist and count === 0.
    await program.methods.initialize().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Increments counter", async () => {
    // Two increments; expect 1 then 2 (shows state persists).
    await program.methods.increment().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(1);

    await program.methods.increment().rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    expect(counterAfter.count.toNumber()).to.equal(2);
  });

  it("Decrements counter", async () => {
    // Two decrements from 2 to 0.
    await program.methods.decrement().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(1);

    await program.methods.decrement().rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    expect(counterAfter.count.toNumber()).to.equal(0);
  });

  it("Decrement when already 0 stays at 0", async () => {
    // Saturating behavior: no underflow; count stays at 0.
    await program.methods.decrement().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Increment again", async () => {
    // Brings count back to 1 for following tests.
    await program.methods.increment().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(1);
  });

  it("Resets counter", async () => {
    // Sets count to 0 via reset instruction.
    await program.methods.reset().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Closes counter account", async () => {
    // Closes PDA; fetchNullable returns null when account is closed.
    await program.methods.close().rpc();

    const counterAccount = await program.account.counter.fetchNullable(
      counterPda
    );
    expect(counterAccount).to.be.null;
  });

  it("Can initialize again after close", async () => {
    // Same PDA can be re-initialized; full lifecycle.
    await program.methods.initialize().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Emits counterUpdated event on increment", async () => {
    // Subscribe to event, call increment, assert payload (user, count); "confirmed" commitment.
    const eventPromise = new Promise<{ user: any; count: any }>(
      (resolve, reject) => {
        const timeout = setTimeout(() => {
          program.removeEventListener(listenerId);
          reject(new Error("Event timeout"));
        }, 5000);

        const listenerId = program.addEventListener(
          "counterUpdated",
          (event: { user: any; count: any }) => {
            clearTimeout(timeout);
            program.removeEventListener(listenerId);
            resolve(event);
          },
          "confirmed"
        );
      }
    );

    await program.methods.increment().rpc();

    const event = await eventPromise;

    expect(event.user.toBase58()).to.equal(provider.publicKey.toBase58());
    expect(event.count.toNumber()).to.be.greaterThanOrEqual(0);
  });
});
