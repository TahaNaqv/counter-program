import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterProgram } from "../target/types/counter_program";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("counter-program", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.counterProgram as Program<CounterProgram>;
  const provider = anchor.getProvider();

  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), provider.publicKey.toBuffer()],
    program.programId
  );

  it("Initializes counter", async () => {
    await program.methods.initialize().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Increments counter", async () => {
    await program.methods.increment().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(1);

    await program.methods.increment().rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    expect(counterAfter.count.toNumber()).to.equal(2);
  });

  it("Decrements counter", async () => {
    await program.methods.decrement().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(1);

    await program.methods.decrement().rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    expect(counterAfter.count.toNumber()).to.equal(0);
  });

  it("Decrement when already 0 stays at 0", async () => {
    await program.methods.decrement().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Increment again", async () => {
    await program.methods.increment().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(1);
  });

  it("Resets counter", async () => {
    await program.methods.reset().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });

  it("Closes counter account", async () => {
    await program.methods.close().rpc();

    const counterAccount = await program.account.counter.fetchNullable(
      counterPda
    );
    expect(counterAccount).to.be.null;
  });

  it("Can initialize again after close", async () => {
    await program.methods.initialize().rpc();

    const counter = await program.account.counter.fetch(counterPda);
    expect(counter.count.toNumber()).to.equal(0);
  });
});
