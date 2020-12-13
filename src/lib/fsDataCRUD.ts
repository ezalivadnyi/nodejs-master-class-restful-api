/**
 * Library for storing and editing data in .data folder
 */

import fs from 'fs';
import path from 'path';
import helpers from "./helpers";
import ErrnoException = NodeJS.ErrnoException;

// Container for the module (to be exported)
const lib = {
    // Base directory for the data folder
    pathToDataDirectory: path.join(__dirname, '/../../.data'),

    // Write data to a file
    create: (directory: string, filename: string, data: object, callback: (createError: string | boolean) => void) => {
        const directoryPath = `${lib.pathToDataDirectory}/${directory}`;
        // Open file for writing
        if (!fs.existsSync(directoryPath)) {
            console.log(`Dir ${directoryPath} not exist. Creating...`);
            fs.mkdirSync(directoryPath);
        }
        fs.open(`${directoryPath}/${filename}.json`, 'wx', (err, fileDescriptor) => {
            if (err) {
                console.error(err);
                callback("Couldn't create new file, it may already exist:");
            } else {
                // Convert data to string
                const stringData = JSON.stringify(data);
                // Write to file and close it
                fs.writeFile(fileDescriptor, stringData, writeFileError => {
                    if (writeFileError) {
                        console.error('Error writing to new file:', writeFileError);
                        callback('Error writing to new file');
                    } else {
                        fs.close(fileDescriptor, closeFileError => {
                            if (closeFileError) {
                                console.error('Error closing new file:', closeFileError);
                                callback('Error closing new file');
                            } else {
                                callback(false);
                            }
                        })
                    }
                });
            }
        })
    },

    // Read data from a file
    read: (directory: 'users' | 'tokens' | 'checks' | string, filename: string, callback: (readError: ErrnoException | null, readedData: any) => void) => {
        fs.readFile(`${lib.pathToDataDirectory}/${directory}/${filename}.json`, 'utf-8', (readFileError, readedData) => {
            if (readFileError) {
                callback(readFileError, readedData);
            } else {
                callback(readFileError, helpers.jsonToObject(readedData));
            }
        });
    },

    // Update data inside a file
    update: (directory: 'users' | 'tokens' | 'checks' | string, filename: string, data: object, callback: (updateError: string | boolean) => void) => {
        // Open the file for writing
        fs.open(`${lib.pathToDataDirectory}/${directory}/${filename}.json`, 'r+', (openError, fd) => {
            if (openError) {
                console.error(openError);
                callback(`Can't open the file for updating, it may not exist yet`);
            } else {
                // Convert data to string
                const stringData = JSON.stringify(data);
                // Truncate the file
                fs.ftruncate(fd, ftruncateError => {
                    if (ftruncateError) {
                        console.error(ftruncateError);
                        callback(`Error truncating file`);
                    } else {
                        // Write to the file and close it
                        fs.writeFile(fd, stringData, writeFileError => {
                            if (writeFileError) {
                                console.error(writeFileError);
                                callback('Error writing to existing file');
                            } else {
                                fs.close(fd, closeError => {
                                    if (closeError) {
                                        console.error(closeError);
                                        callback(`Error closing the file`);
                                    } else {
                                        callback(false);
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    // Delete a file
    delete: (directory: 'users' | 'tokens' | 'checks' | string, filename: string, callback: (deleteError: string | boolean) => void) => {
        // Unlink the file
        fs.unlink(`${lib.pathToDataDirectory}/${directory}/${filename}.json`, err => {
            if (err) {
                console.error(err);
                callback('Error deleting file');
            } else {
                callback(false);
            }
        });
    },

    list: (directory: 'users' | 'tokens' | 'checks' | string, callback: (err: ErrnoException | boolean, checksFilenames: string[]) => void) => {
        fs.readdir(`${lib.pathToDataDirectory}/${directory}`, (err, files) => {
            if (err) {
                callback(err, files);
            } else {
                const trimmedFilenames: string[] = [];
                files.forEach((filename) => {
                    trimmedFilenames.push(filename.replace('.json', ''));
                });
                callback(false, trimmedFilenames);
            }
        })
    }

};

export default lib;