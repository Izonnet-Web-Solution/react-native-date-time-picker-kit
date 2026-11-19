const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.watchFolders = [root];
defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
];

module.exports = defaultConfig;
