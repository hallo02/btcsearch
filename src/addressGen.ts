import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory, ECPairInterface } from "ecpair";
import * as ecc from "tiny-secp256k1";
import KeyPackage from "./model.js";

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.bitcoin; // Otherwise, bitcoin = mainnet and regnet = local

export function getVerificationAddress(): KeyPackage[] {
  const keyPair = ECPair.fromWIF(
    process.env.VERIFICATION_PRIVATE_KEY as string,
    network
  );
  return [packageKey(keyPair)];
}

export function getRandomAddresses(): KeyPackage[] {
  const keyPair = ECPair.makeRandom();
  return [packageKey(keyPair)];
}

function packageKey(keyPair: ECPairInterface): KeyPackage {
  const { address: legacyAddress } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
  });

  const { address: segwitAddress } = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }),
  });

  const { address: bech32Address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
  });

  return {
    privateKey: keyPair.toWIF(),
    p2pkh: legacyAddress,
    p2sh: segwitAddress,
    p2wpkh: bech32Address,
  };
}

function example() {
  // Create private key
  const keyPair = ECPair.makeRandom();

  console.log("Private key as WIF", keyPair.toWIF());
  console.log("-----------------------------");
  // Legacy Address (P2PKH - Pay-to-PubKey-Hash)
  // Starts with 1...
  // Old and high compatibility
  // Hash_160Bit ( public key )
  // Expensive transaction fees
  const { address: legacyAddress } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
  });
  console.log("Legacy Address:", legacyAddress);

  // SegWit Address (P2SH - Pay-to-Script-Hash)
  // Starts with 3...
  // Temporary form (before real SegWit)
  // Cheaper than Legacy P2PKH
  const { address: segwitAddress } = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }),
  });
  console.log("SegWit Address:", segwitAddress);

  // Native SegWit Address (Bech32 - P2WPKH/P2WSH)
  // Starts with bc1
  // Most modern
  // Cheap transaction fees
  // Lowest compatibility
  const { address: bech32Address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
  });
  console.log("Bech32 Address:", bech32Address);

  console.log("-----------------------------");
  console.log("-----------------------------");
}
