import path from 'path';
import fs from "fs";
import zlib from 'zlib';

const logs = {
    pathToDataDirectory: path.join(__dirname, '/../../.logs'),

    append: (fileName: string, stringToAppend: string, errorCallback: (error: string | boolean) => void) => {
        fs.open(`${logs.pathToDataDirectory}/${fileName}.log`, 'a', (openError, fd) => {
            if (openError) {
                errorCallback(`Could not open file for appending`)
            } else {
                fs.appendFile(fd, stringToAppend + '\n', appendError => {
                    if (appendError) {
                        errorCallback(`Error appending to file`);
                    } else {
                        fs.close(fd, closeError => {
                            if (closeError) {
                                errorCallback(`Error closing the file that was being appended`);
                            } else {
                                errorCallback(false);
                            }
                        })
                    }
                });
            }
        })
    },

    list: (includeCompressedLogs: boolean, callback: (err: NodeJS.ErrnoException | null, data: string[]) => void) => {
        fs.readdir(logs.pathToDataDirectory, (err, allLogsData) => {
            if (err) {
                callback(err, allLogsData);
            } else {
                const trimmedFileNames: string[] = [];
                allLogsData.forEach(logFileName => {
                    if (logFileName.indexOf('.log') > -1) {
                        trimmedFileNames.push(logFileName.replace('.log', ''));
                    }

                    if (logFileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                        trimmedFileNames.push(logFileName.replace('.gz.b64', ''));
                    }
                });
                callback(null, trimmedFileNames);
            }
        })
    },

    compress: (logId: string, newFileId: string, err: string | false) => {

    }
}
export default logs;