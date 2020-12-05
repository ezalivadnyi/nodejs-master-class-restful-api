/**
 * Create and export configuration variables
 */

interface IEnvironments{
    [key: string]: {
        portHttp: number,
        portHttps: number,
        envName: string,
        hashingSecret: string,
        maxChecks: number,
    }
}

const environments: IEnvironments = {
    staging: {
        portHttp: 3000,
        portHttps: 3001,
        envName: 'staging',
        hashingSecret: 'try to guess me:)',
        maxChecks: 5,
    },
    production: {
        portHttp: 5000,
        portHttps: 5001,
        envName: 'production',
        hashingSecret: 'try to guess meeeeeeee:)',
        maxChecks: 5,
    },
};

const currentEnvironment = process.env.NODE_ENV && process.env.NODE_ENV.length > 0 ? process.env.NODE_ENV.toLowerCase() : '';
const envToExport = typeof(environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging;
export default envToExport;
