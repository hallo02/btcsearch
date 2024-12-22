import unzip from "./unzip.js";
import {getRandomAddresses, getVerificationAddress} from "./addressGen.js";
import checkForRandomKey from "./finder.js";
import fileToMemory from "./fileToMemory.js";
import downloadFile from "./downloadFile.js";

async function searchBtc(){

    const onlineSource = "http://addresses.loyce.club/Bitcoin_addresses_LATEST.txt.gz";
    const source = "le_addresses.gz";
    const target = "le_addresses.txt";
    
    // Download
    await downloadFile(onlineSource, source);

    // Unzip
    await unzip(source, target);

    // Load addesses into memory
    const addresses = await fileToMemory(target)

    // Loop unlimited
    let iteration = 0;
    let startFrom = Date.now();
    let measureInterval = 10_000;
    while(true){
        let randomKey;
        if(iteration === measureInterval * 10){
            randomKey = getVerificationAddress();
            console.log(
                "\nKey for functionality verification, so don't hype. But this is actual money on the address, but please let it there."
              );
              console.log(randomKey);
        }else{
            randomKey = getRandomAddresses();
        }
        checkForRandomKey(randomKey, addresses);
        iteration++;
        if(iteration%measureInterval === 0){
            let elapsedMs = Date.now() - startFrom;
            process.stdout.write(`\rAt iteration ${iteration}, current speed: ${(measureInterval/elapsedMs*1000).toFixed(1)}/s`);
            startFrom = Date.now();
        }
    }
}

searchBtc();
