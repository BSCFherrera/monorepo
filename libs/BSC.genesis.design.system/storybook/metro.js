// Resolver behavior from @storybook/react-native 8.6.4's withStorybook.
// This packaged static catalog does not need its file generator or require.context.
module.exports = function withCatalog(config) {
  return {
    ...config,
    resolver: {
      ...config.resolver,
      resolveRequest(context, moduleName, platform) {
        const resolve = config.resolver?.resolveRequest ?? context.resolveRequest;
        const isStorybook = moduleName.startsWith('storybook') ||
          moduleName.startsWith('@storybook') || moduleName === 'uuid';
        const result = resolve(isStorybook ? {
          ...context,
          unstable_enablePackageExports: true,
          unstable_conditionNames: ['import'],
        } : context, moduleName, platform);
        return result?.filePath?.includes('@storybook/react/template/cli')
          ? { type: 'empty' }
          : result;
      },
    },
  };
};
