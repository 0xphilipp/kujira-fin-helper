const npm_package = require('./package.json')

module.exports = function override(config, env) {
    config.resolve.fallback = {
        crypto: false,
        path: false,
    }
    Object.assign(config.resolve.alias, npm_package._moduleAliases);
    return config
}