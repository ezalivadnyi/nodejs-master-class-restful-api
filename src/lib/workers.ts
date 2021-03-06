import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import url from 'url';

import _data from './fsDataCRUD';
import helpers from './helpers';
import env from '../env';
import { ICheck, ICheckOutcome } from '../Interfaces';
import checkers from './fieldsCheckers';
import logs from './logs';

const workers = {
    init: () => {
        workers.gatherAllCheks();
        workers.loop();
        workers.rotateLogs();
        workers.logRotationLoop();
    },
    loop: () => {
        console.log(`Workers loop interval = ${env.WORKERKS_LOOP_INTERVAL_MILISECONDS / 1000} seconds.`);
        setInterval(() => {
            workers.gatherAllCheks();
        }, env.WORKERKS_LOOP_INTERVAL_MILISECONDS);
    },
    logRotationLoop: () => {
        setInterval(() => {
            workers.rotateLogs();
        }, 1000 * 60 * 60 * 24);
    },
    rotateLogs: () => {
        logs.list(false, (err, nonCompressedlogs) => {
            if (err) {
                console.error(err);
            } else {
                nonCompressedlogs.forEach(log => {

                    const logId = log.replace('.log', '');
                    const newFileId = logId + '-' + Date.now();
                    logs.compress(logId, newFileId, err => {
                        if (err) {
                            console.error(`Error compressing on of the files`, err);
                        } else {
                            logs.truncate(logId, err => {
                                if (err) {
                                    console.error(`Error truncating log file`, logId);
                                } else {
                                    console.log(`Success truncating log file`, logId);
                                }
                            })
                        }
                    })
                });
            }

        });
    },
    gatherAllCheks: () => {
        _data.list('checks', (err, checksFilenames) => {
            if (err) {
                console.error(err);
            } else {
                if (checksFilenames.length === 0) {
                    const date = new Date();
                    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    console.error(`${time} couldn't find any checks to process`);
                } else {
                    console.log(`\nFounded checks: ${checksFilenames.length}.`);

                    checksFilenames.forEach(checkFilename => {
                        _data.read('checks', checkFilename, (readError, checkData: ICheck) => {
                            if (readError) {
                                console.error(`Error reading check data id: ${checkFilename}`);
                            } else {
                                workers.validateCheckData(checkData);
                            }
                        })
                    })
                }
            }
        })
    },
    log: (checkData: ICheck, checkOutcome: ICheckOutcome, state: 'up' | 'down', alertWarranted: boolean, timeOfCheck: number) => {
        const logData = {
            'check': checkData,
            'outcome': checkOutcome,
            'state': state,
            'alert': alertWarranted,
            'time': timeOfCheck
        };
        const logString = JSON.stringify(logData);
        const logFileName = checkData.id;
        logs.append(logFileName, logString, (e) => {
            if (e) {
                console.error(e);
            } else {
                // console.info('Logging to file succeded');
            }
        })
    },
    validateCheckData: (checkData: ICheck) => {
        if (Object.keys(checkData).length) {
            checkData.id = checkers.checks.id(checkData.id);
            checkData.userPhone = checkers.user.phone(checkData.userPhone);
            checkData.protocol = checkers.checks.protocol(checkData.protocol);
            checkData.url = checkers.checks.url(checkData.url);
            checkData.method = checkers.checks.method(checkData.method);
            checkData.successCodes = checkers.checks.successCodes(checkData.successCodes);
            checkData.timeoutSeconds = checkers.checks.timeout(checkData.timeoutSeconds);

            checkData.state = checkers.checks.state(checkData.state);
            checkData.lastChecked = checkers.checks.lastChecked(checkData.lastChecked);

            if (checkData.id && checkData.userPhone && checkData.protocol && checkData.method &&
                checkData.url && checkData.successCodes && checkData.timeoutSeconds) {
                workers.performCheck(checkData);
            } else {
                console.error(`One of the checks ${checkData.id ? checkData.id : null} is not properly formatted. Skipping it.`);
            }
        }
    },
    performCheck: (originalCheckData: ICheck) => {

        const checkOutcome: ICheckOutcome = {
            responseCode: undefined,
            error: undefined
        }

        let outcomeSent = false;
        const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
        const hostName = parsedUrl.hostname;
        const path = parsedUrl.path; // Using path and not pathname because we want query string

        const requestOptions: http.RequestOptions = {
            'protocol': originalCheckData.protocol + ':',
            'hostname': hostName,
            'method': originalCheckData.method.toUpperCase(),
            'path': path,
            'timeout': originalCheckData.timeoutSeconds * 1000,
        };

        const _moduleToUse = originalCheckData.protocol === 'http' ? http : https;
        const req = _moduleToUse.request(requestOptions, (res) => {
            checkOutcome.responseCode = res.statusCode;

            if (res.statusCode && !originalCheckData.successCodes.includes(res.statusCode)) {
                console.log(`headers`, res.headers);
            }

            if (res.statusCode === 301 && res.headers.location) {
                const newUrlLocation = url.parse(res.headers.location)
                const hostname = newUrlLocation.hostname
                if (hostname) {
                    // TODO: make notification for user about url permanently changed
                    console.log(`Check url changed to: ${hostname}`);
                    originalCheckData.url = hostname
                }
            }

            if (!outcomeSent) {
                workers.processCheckOutcome(originalCheckData, checkOutcome);
                outcomeSent = true;
            };
        });

        req.on('error', (e) => {
            checkOutcome.error = {
                error: true,
                value: e
            };
            console.error(checkOutcome.error);
            if (!outcomeSent) {
                workers.processCheckOutcome(originalCheckData, checkOutcome);
                outcomeSent = true;
            }
        });

        req.on('timeout', () => {
            checkOutcome.error = {
                error: true,
                value: 'timeout'
            };
            // console.error(req.host, checkOutcome.error);
            if (!outcomeSent) {
                workers.processCheckOutcome(originalCheckData, checkOutcome);
                outcomeSent = true;
            };
        });

        req.end();
    },
    processCheckOutcome: (originalCheckData: ICheck, checkOutcome: ICheckOutcome) => {
        const state = !checkOutcome.error && checkOutcome.responseCode
            && originalCheckData.successCodes.includes(checkOutcome.responseCode) ? 'up' : 'down';

        const alertWarranted: boolean = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

        const timeOfCheck = Date.now()
        const newCheckData = originalCheckData;
        newCheckData.state = state;
        newCheckData.lastChecked = timeOfCheck;

        //console.log('__________________________________________');
        console.info(`${timeOfCheck} ${checkOutcome.responseCode} ${originalCheckData.method} ${originalCheckData.protocol}://${originalCheckData.url} state:${state} alert:${alertWarranted}`);
        workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck)
        if (checkOutcome.error) {
            console.error(checkOutcome.error);
        }

        _data.update('checks', newCheckData.id, newCheckData, err => {
            if (err) {
                console.error(`Error trying to update to one of the checks`);
                console.error(err);
            } else {
                if (alertWarranted) {
                    workers.alertUserToStatusChange(newCheckData);
                } else {
                    if (env.ENVIRONMENT_NAME === 'staging') {
                        console.log(`Check ${originalCheckData.id} ${originalCheckData.method} ${originalCheckData.protocol}://${originalCheckData.url} outcome has not changed, no alert needed`);
                    }
                }
            };
        })
    },
    alertUserToStatusChange: (checkData: ICheck) => {
        const msg = `Alert: Your check for ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} is currently ${checkData.state}`;
        helpers.sendTwilioSMS(checkData.userPhone, msg, err => {
            if (err) {
                console.error(`Error: Couldn't send SMS alert to user ${checkData.userPhone} for check ${checkData.id} status change.`, err);
            } else {
                console.info(`Success: User ${checkData.userPhone} was alerted to a status change in their check ${checkData.id} via Twilio SMS`);
            }
        })
    }
};

export default workers;