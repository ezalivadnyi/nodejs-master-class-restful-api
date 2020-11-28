/**
 * Create and export configuration variables
 */

// Container for all the environments
const environments = {
    //Staging object
    staging: {
        portHttp: 3000,
        portHttps: 3001,
        envName: 'staging',
    },
    production: {
        portHttp: 5000,
        portHttps: 5001,
        envName: 'production',
    },

};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const envToExport = typeof(environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;
module.exports = envToExport;
