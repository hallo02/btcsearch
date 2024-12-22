import readline from "readline";
import fs from "fs";

async function fileToMemory(source: string): Promise<Set<string>[]> {
    
  console.log(`Start loading ${source} to memory`);
  const readlineInterface = readline.createInterface({
    input: fs.createReadStream(source),
  });

  // Node doesn't allow a set to be much bigger than 16_000_000
  // Entries are split up into multiple sets
  const listOfSets = [new Set<string>()];
  console.log("First set created");
  let currentSetIdx = 0;

  readlineInterface.on("line", (line) => {
    if (listOfSets[currentSetIdx].size > 16000000) {
      listOfSets.push(new Set());
      currentSetIdx++;
      console.log(`Additional set (${currentSetIdx}) created`);
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
