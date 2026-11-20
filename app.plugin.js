// Expo Config Plugin for @izonnet-web-solution/react-native-date-time-modal
// Enables seamless integration with managed Expo projects and EAS Build.

const { createRunOncePlugin } = (() => {
  try {
    return require('@expo/config-plugins');
  } catch {
    return {
      createRunOncePlugin: (plugin, _name, _version) => plugin,
    };
  }
})();

const pkg = require('./package.json');

/**
 * Config plugin that configures the native DateTimePicker modal for Expo apps.
 * Since this package uses React Native New Architecture TurboModules and
 * standard native autolinking with zero external runtime dependencies,
 * no extra native configuration mutations are required.
 */
function withDateTimePickerModal(config) {
  return config;
}

module.exports = createRunOncePlugin(
  withDateTimePickerModal,
  pkg.name,
  pkg.version
);
