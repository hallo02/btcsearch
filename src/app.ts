import unzip from "./unzip.js";
import {getRandomAddresses, getVerificationAddress} from "./addressGen.js";
import checkForRandomKey from "./finder.js";
import fileToMemory from "./fileToMemory.js";
import downloadFile from "./downloadFile.js";

const onlineSource = "http://addresses.loyce.club/Bitcoin_addresses_LATEST.txt.gz";
const fileCompressed = "addresses.gz";
const fileUncompressed = "addresses.txt";

async function searchBtc(){

    // Init download
    await downloadFile(onlineSource, fileCompressed);

    // Unzip
    await unzip(fileCompressed, fileUncompressed);

    // Load addesses into memory
    let addresses = await fileToMemory(fileUncompressed);

    // Lookup loop
    let iteration = 1;
    let newDownloadInterval = 100_000_000;
    let measurementStartFrom = Date.now();
    let measurementInterval = 10_000;
    while(true){
        let randomKey;
        
        // Refresh balanced addresses
        if(iteration % newDownloadInterval === 0){
            addresses = await downloadAndUnzipAndLoadIntoMemory(onlineSource, fileCompressed, fileUncompressed)
        }

        // Bring in verification address
        // Expectation is to find a match using this Random Key.
        // This is real money on the blockchain and verifies app functionality.
        if(iteration === measurementInterval * 10){
            randomKey = getVerificationAddress();
            console.log(
                "\nKey for functionality verification, so don't hype. But this is actual money on the address, please let it there."
              );
              console.log(randomKey);
        }else{
            randomKey = getRandomAddresses();
        }

        checkForRandomKey(randomKey, addresses);
        
        // App performance monitor
        if(iteration % measurementInterval === 0){
            let elapsedMs = Date.now() - measurementStartFrom;
            process.stdout.write(`\rAt iteration ${iteration}, current speed: ${(measurementInterval / elapsedMs * 1000).toFixed(1)}/s`);
            measurementStartFrom = Date.now();
        }

        iteration++;
    }
}

async function downloadAndUnzipAndLoadIntoMemory(onlineSource: string, fileCompressed: string, fileUncompressed: string){

    await downloadFile(onlineSource, fileCompressed);
    await unzip(fileCompressed, fileUncompressed);
    return fileToMemory(fileUncompressed);
}

searchBtc();
