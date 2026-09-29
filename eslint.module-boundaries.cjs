/**
 * Nx module boundaries, shared by the root flat config (`eslint.config.mjs`)
 * and the legacy `.eslintrc.js` files of the app and `libs/shared-ui-native`,
 * so every project lints against the same rules.
 *
 * Tags live in each `project.json`:
 *   scope:shared          libs/shared-*
 *   scope:mobile-banking  the app and its @bsc/shared
 *   scope:conversational  the conversational app
 *   type:app | type:ui | type:util
 */
module.exports = {
  '@nx/enforce-module-boundaries': [
    'error',
    {
      enforceBuildableLibDependency: false,
      allow: [],
      depConstraints: [
        { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
        {
          sourceTag: 'scope:mobile-banking',
          onlyDependOnLibsWithTags: ['scope:shared', 'scope:mobile-banking'],
        },
        {
          sourceTag: 'scope:conversational',
          onlyDependOnLibsWithTags: ['scope:shared', 'scope:conversational'],
        },
        { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
        { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util'] },
        { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
      ],
    },
  ],
};
