import readline from "readline";
import fs from "fs";
import { getVerificationAddress, KeyPackage } from "./addressGen.js";
import sendMessage from "./telegramBot.js";

async function checkForRandomKey(randomKey: KeyPackage, listOfSets: Set<string>[]) {
  const { privateKey, p2pkh, p2sh, p2wpkh } = randomKey;
  let setIdx = 0;
  for (const addressSet of listOfSets) {
    if (p2pkh && addressSet.has(p2pkh)) {
      await found("p2pkh", p2pkh, privateKey, randomKey, setIdx);
    }

    if (p2sh && addressSet.has(p2sh)) {
      await found("p2sh", p2sh, privateKey, randomKey, setIdx);
    }

    if (p2wpkh && addressSet.has(p2wpkh)) {
      await found("p2wpkh", p2wpkh, privateKey, randomKey, setIdx);
    }
    setIdx++;
  }
}

async function found(
  type: string,
  address: string,
  privateKey: string,
  randomKey: KeyPackage,
  setIdx: number
) {
  console.log();
  console.log(`Found ${type} ${address} in set number ${setIdx}`);
  console.log(`With PrivateKey: ${privateKey}`);
  console.log(randomKey);
  writeToFile(randomKey);
  await sendMessage(`CHECK YOUR BOT ${address}`);
}

function writeToFile(randomKey: KeyPackage) {
  const filename = "wallet.json";
  if (!fs.existsSync(filename)) {
    fs.appendFileSync(filename, "[");
  }

  // Skip for verification key
  if (getVerificationAddress().p2pkh === randomKey.p2pkh) {
    console.log(
      `Found key is verification key, therefore no write to ${filename}`
    );
    return;
  }
  fs.appendFileSync(filename, "\n" + JSON.stringify(randomKey) + ",");
}

export default checkForRandomKey;
