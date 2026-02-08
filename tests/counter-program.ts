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
});
