import gunzipFile from "gunzip-file";
import * as fs from "fs";

function unzip(source: string, target: string) {
    if (process.argv.some(arg => arg.toLocaleLowerCase() === '--skipunzip')) return;
    console.log();
    console.log(`Start unzipping`);
    return new Promise((resolve, reject) => {
    gunzipFile(source, target, () => {
      console.log(`${source} was unzipped to ${target} successfully`);
      try {
        const sourceStats = fs.statSync(source);
        const targetStats = fs.statSync(target);
        console.log(`${source} is ${(sourceStats.size/1024/1024).toFixed(2)}MB`);
        console.log(`${target} is ${(targetStats.size/1024/1024).toFixed(2)}MB`);
      } catch (err) {
        console.error('Error getting file size:', err);
      }
      resolve(target);
    });
  });
}

export default unzip;
