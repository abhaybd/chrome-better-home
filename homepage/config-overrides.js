module.exports = function override(config, env) {
    // Consolidate chunk files instead
    config.optimization.splitChunks = {
        cacheGroups: {
            default: false,
        },
    };
    // Move runtime into bundle instead of separate file
    config.optimization.runtimeChunk = false;

    // JS
    config.output.filename = '[name].js';
    // CSS. "5" is MiniCssPlugin
    config.plugins[5].options.filename = '[name].css';
    config.plugins[5].options.publicPath = '../';

    return config;
}

