const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  'react-native-web-webview': require.resolve('./mock-react-native-web-webview.js'),
};

module.exports = config;
