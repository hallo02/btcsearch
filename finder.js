import readline from "readline";
import fs from "fs";
import {getVerificationAddress} from "./addressGen.js";

function checkForRandomKey(randomKey, addresses) {
  findAddress(randomKey, addresses);
}

function findAddress(randomKey, listOfSets) {
  const { privateKey, p2pkh, p2sh, p2wpkh } = randomKey;
  let setIdx = 0;
  for (const addressSet of listOfSets) {
    if (addressSet.has(p2pkh)) {
      found("p2pkh", p2pkh, privateKey, randomKey, setIdx);
    }

    if (addressSet.has(p2sh)) {
      found("p2sh", p2sh, privateKey, randomKey, setIdx);
    }

    if (addressSet.has(p2wpkh)) {
      found("p2wpkh", p2wpkh, privateKey, randomKey, setIdx);
    }
    setIdx++;
  }
}

function found(type, address, privateKey, randomKey, setIdx) {
  console.log();
  console.log(`Found ${type} ${address} in set number ${setIdx}`);
  console.log(`With PrivateKey: ${privateKey}`);
  console.log(randomKey);
  writeToFile(randomKey);
}

function writeToFile(randomKey) {
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
