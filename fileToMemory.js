import readline from "readline";
import fs from "fs";

async function fileToMemory(source) {
    
  console.log(`Start loading ${source} to memory`);
  const readlineInterface = readline.createInterface({
    input: fs.createReadStream(source),
  });

  const listOfSets = [new Set()];
  console.log("First set created");
  let currentSetIdx = 0;

  readlineInterface.on("line", (line) => {
    if (listOfSets[currentSetIdx].size > 16000000) {
      listOfSets.push(new Set());
      currentSetIdx++;
      console.log("Additional set created");
    }
    listOfSets[currentSetIdx].add(line.trim());
  });

  return new Promise((resolve, reject) => {
    readlineInterface.on("close", () => {
      console.log("Addresses loaded into memory successfully");
      resolve(listOfSets);
    });
  });
}

export default fileToMemory;
