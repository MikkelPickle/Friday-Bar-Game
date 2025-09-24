module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv'], // your dotenv plugin
      'react-native-reanimated/plugin' // reanimated plugin MUST be last
    ],
  };
};
