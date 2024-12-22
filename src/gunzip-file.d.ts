declare module 'gunzip-file' {
    const gunzip: (source: string, destination: string, callback: (error?: Error) => void) => void;
    export default gunzip;
  }