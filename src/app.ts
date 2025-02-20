import unzip from "./unzip.js";
import { getRandomAddresses, getVerificationAddress } from "./addressGen.js";
import checkForRandomKey from "./finder.js";
import fileToMemory from "./fileToMemory.js";
import downloadFile from "./downloadFile.js";
import sendMessage, { initTelegramBot } from "./telegramBot.js";
import dotenv from "dotenv";
import generateKeyPackages from "./electrumAddressGen.js";

dotenv.config();
const onlineSource =
  "http://addresses.loyce.club/Bitcoin_addresses_LATEST.txt.gz";
const fileCompressed = "addresses.gz";
const fileUncompressed = "addresses.txt";

async function searchBtc() {
  // Init telegram bot
  initTelegramBot();
  await sendMessage(`BTCSEARCH STARTED`);

  // Init download
  await downloadFile(onlineSource, fileCompressed);

  // Unzip
  await unzip(fileCompressed, fileUncompressed);

  // Load addesses into memory
  let utxo: Set<string>[] | null = await fileToMemory(fileUncompressed);

  // Lookup loop
  let iteration = 1;
  let newDownloadInterval = 5_000_000;
  let verificationIteration = 1_000;
  let measurementStartFrom = Date.now();
  let hdWalletDerivationDepth = 20;
  let measurementInterval = 1_000;

  while (true) {

    // Refresh balanced addresses memory
    if (iteration % newDownloadInterval === 0) {
      utxo = null;
      utxo = await downloadAndUnzipAndLoadIntoMemory(
        onlineSource,
        fileCompressed,
        fileUncompressed
      );
    }

    // Bring in verification address
    // Expectation is to find a match using the verification address.
    // This is real money on the blockchain and verifies app functionality.
    let randomKey;
    if (iteration === verificationIteration) {
      randomKey = getVerificationAddress();
      console.log(
        "\nKey for functionality verification, so don't hype. But this is actual money on the address, please let it there."
      );
      console.log(randomKey);
    } else {
      randomKey = generateKeyPackages(hdWalletDerivationDepth);
    }

    await checkForRandomKey(randomKey, utxo);

    // App performance monitor
    if (iteration % measurementInterval === 0) {
      let elapsedMs = Date.now() - measurementStartFrom;

      process.stdout.write(
        `\rAt iteration ${iteration} (x${hdWalletDerivationDepth}), current speed: ${(
          ((measurementInterval * hdWalletDerivationDepth) / elapsedMs) *
          1000
        ).toFixed(1)}/s`
      );

      measurementStartFrom = Date.now();
    }

    iteration++;
  }
}

async function downloadAndUnzipAndLoadIntoMemory(
  onlineSource: string,
  fileCompressed: string,
  fileUncompressed: string
) {
  await downloadFile(onlineSource, fileCompressed);
  await unzip(fileCompressed, fileUncompressed);
  return fileToMemory(fileUncompressed);
}

searchBtc();
