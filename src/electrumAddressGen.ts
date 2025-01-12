import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import { createHash, pbkdf2Sync } from "crypto";
import KeyPackage from "./model.js";

// bip32 und tiny-secp256k1 initialisieren
const bip32 = BIP32Factory(ecc);

enum IncomingAddressType {
  Receiving,
  Change,
}

enum AddressType {
  P2PKH, // Pay-to-PubKey-Hash
  P2SH, // Pay-to-Script-Hash
  Bech32, // P2WPKH/P2WSH
}

export default function generateKeyPackages(size: number = 20): KeyPackage[] {
  let mnemonic = generateRandomMnemonic();

  let addresses = generateNReceivingAdresses(Math.floor(size / 2), mnemonic);
  addresses.push(...generateNChangeAddresses(Math.floor(size / 2), mnemonic));

  return addresses;
}

// check bc1qrk0xnzlcm5tk508rpfdx7tggcgswzw98tkhm7v

function generateNReceivingAdresses(
  n: number,
  mnemonic: string,
  addressTypes: Set<AddressType> = new Set([
    AddressType.P2PKH,
    AddressType.P2SH,
    AddressType.Bech32,
  ])
): KeyPackage[] {
  return generateElectrumAddresses(
    n,
    mnemonic,
    IncomingAddressType.Receiving,
    addressTypes
  );
}

function generateNChangeAddresses(
  n: number,
  mnemonic: string,
  addressTypes: Set<AddressType> = new Set([
    AddressType.P2PKH,
    AddressType.P2SH,
    AddressType.Bech32,
  ])
): KeyPackage[] {
  return generateElectrumAddresses(
    n,
    mnemonic,
    IncomingAddressType.Change,
    addressTypes
  );
}

function generateElectrumAddresses(
  amount: number,
  mnemonic: string,
  incomingAddressType: IncomingAddressType,
  addressTypes: Set<AddressType>
): KeyPackage[] {
  // Mnemonic normalisieren (Electrum verwendet NFKD)
  const normalizedMnemonic = mnemonic.normalize("NFKD");

  // Master-Node (Root Key)
  const rootNode = generateElectrumMasterKey(normalizedMnemonic);
  const hardenedNode = rootNode.deriveHardened(0); // m/0h

  // (m/0h/0/n) - Receiving Addresses
  const receivingNode = hardenedNode.derive(incomingAddressType); // Externe Adressen

  const result: KeyPackage[] = [];
  for (let index = 0; index < amount; index++) {
    const addressNode = receivingNode.derive(index);
    let keyPackage: KeyPackage = {
      privateKey: Buffer.from(addressNode.privateKey ?? "").toString("hex"),
      mnemonic: mnemonic
    };

    if (addressTypes.has(AddressType.P2PKH)) {
      const { address: legacyAddress } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(addressNode.publicKey),
      });
      keyPackage.p2pkh = legacyAddress;
    }

    if (addressTypes.has(AddressType.P2SH)) {
      const { address: segwitAddress } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(addressNode.publicKey),
        }),
      });
      keyPackage.p2sh = segwitAddress;
    }

    if (addressTypes.has(AddressType.Bech32)) {
      const { address: bech32Address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(addressNode.publicKey),
      });
      keyPackage.p2wpkh = bech32Address;
    }
    result.push(keyPackage);
  }
  return result;
}

function generateRandomMnemonic() {
  return bip39.generateMnemonic();
}

function generateElectrumMasterKey(mnemonic: string) {
  // Electrum Seed wird mit PBKDF2 (SHA-512) gehasht
  const normalizedMnemonic = mnemonic.normalize("NFKD");
  const seed = pbkdf2Sync(normalizedMnemonic, "electrum", 2048, 64, "sha512");

  // Ableitung des Master-Nodes aus dem Seed (BIP32)
  const masterNode = bip32.fromSeed(seed);

  return masterNode;
}