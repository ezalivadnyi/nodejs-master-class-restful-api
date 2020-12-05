/**
 * Create and export configuration variables
 */

interface IEnvironments{
    [key: string]: {
        portHttp: number,
        portHttps: number,
        envName: string,
        phoneLength: number,
    }
}
// Container for all the environments
const environments: IEnvironments = {
    // Staging object
    staging: {
        portHttp: 3000,
        portHttps: 3001,
        envName: 'staging',
        phoneLength: 12,
    },
    production: {
        portHttp: 5000,
        portHttps: 5001,
        envName: 'production',
        phoneLength: 12,
    },

};

const currentEnvironment = process.env.NODE_ENV && process.env.NODE_ENV.length > 0 ? process.env.NODE_ENV.toLowerCase() : '';
const envToExport = typeof(environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging;
export default envToExport;
