import axios from "axios";
import * as fs from "fs";

async function downloadFile(url: string, outputPath: string) {
  if (process.argv.some((arg) => arg.toLocaleLowerCase() === "--skipdownload"))
    return;
  console.log(`Start downloading ${url} to ${outputPath}`);
  const writer = fs.createWriteStream(outputPath);

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const totalLength = response.headers["content-length"]; // Get file size from headers
    let downloaded = 0;
    response.data.on("data", (chunk: any) => {
      downloaded += chunk.length; // Track downloaded bytes
      const progress = ((downloaded / totalLength) * 100).toFixed(2);
      process.stdout.write(
        `\rProgress: ${progress}% (${(downloaded / 1024 / 1024).toFixed(
          2
        )}MB / ${(totalLength / 1024 / 1024).toFixed(2)}MB)`
      );
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (err: any) {
    console.error("Error downloading file:", err.message);
  }
}

export default downloadFile;
