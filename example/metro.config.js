const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const defaultConfig = getDefaultConfig(__dirname);

const modules = ['react', 'react-native', '@babel/runtime'];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

defaultConfig.watchFolders = [root];

defaultConfig.resolver.extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.resolve(__dirname, 'node_modules', name);
  return acc;
}, {});

defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

const blockedModules = modules.map(
  (m) =>
    new RegExp(`^${escapeRegex(path.resolve(root, 'node_modules', m))}\\/.*$`)
);

const existingBlockList = defaultConfig.resolver.blockList;
defaultConfig.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : existingBlockList
      ? [existingBlockList]
      : []),
  ...blockedModules,
];

module.exports = defaultConfig;
