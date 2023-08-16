/*
 * Create and export configuration variables
 *
 */

// Container for all environments
/* let environments = {}

// Staging (default) environment
environments.staging = {
    'templateGlobals': {
        'appName': 'Uptime Monitoring',
        'yearCreated': '2023',
        'baseUrl': 'http://localhost:3000/'
    }
}
 */
const config = {
    'templateGlobals': {
        'appName': 'Uptime Monitoring',
        'yearCreated': '2023',
        'baseUrl': 'http://localhost:3000/'
    }
}


module.exports = config;
