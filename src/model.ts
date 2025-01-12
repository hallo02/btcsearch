interface KeyPackage {
    privateKey: string,
    mnemonic?: string,
    p2pkh?: string,
    p2sh?: string,
    p2wpkh?: string,
}

export default KeyPackage;