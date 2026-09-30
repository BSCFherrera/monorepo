const assert = require('node:assert/strict');
const metro = require('metro');
const { getDefaultConfig } = require('@react-native/metro-config');
const withCatalog = require('../storybook/metro');

async function main() {
  const config = withCatalog(getDefaultConfig(process.cwd()));
  config.maxWorkers = 1;
  config.watchFolders = [...new Set([config.projectRoot, ...config.watchFolders])];
  config.resolver.useWatchman = false;
  for (const platform of ['android', 'ios']) {
    const { code } = await metro.runBuild(config, {
      entry: './lib/storybook/index.js', platform, dev: true, minify: false, write: false,
    });
    assert(code.includes('components/Button') && code.includes('components/modals/common/clientVerifiedDialog') && code.includes('components/commonButtons'));
    assert(code.includes('components/modals/onboarding') && code.includes('WelcomeModal') && code.includes('ModalErrorUserBlockedLogin') && code.includes('ProofOfLifeSuccessModal'));
    console.log(`${platform}: Storybook catalog bundle passed`);
  }
  for (const platform of ['android', 'ios']) {
    const { map } = await metro.runBuild(config, {
      entry: './lib/src/index.js', platform, dev: false, minify: false, write: false,
    });
    const sourceMap = JSON.parse(map);
    const sources = sourceMap.sources ?? sourceMap.sections.flatMap(section => section.map.sources ?? []);
    assert(!sources.some(source => /[\\/](@storybook|storybook)[\\/]/.test(source)));
    assert(!sources.some(source => /[\\/]react-native-web[\\/]/.test(source)));
    assert(!sources.some(source => /[\\/]react-native-svg[\\/]/.test(source)));
    assert(!sources.some(source => /[\\/](@react-navigation|@react-native-clipboard|react-native-pdf|i18next|zustand)[\\/]/.test(source)));
    console.log(`${platform}: production entry has no Storybook, web renderer, navigation, clipboard, PDF, or application store runtime`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
