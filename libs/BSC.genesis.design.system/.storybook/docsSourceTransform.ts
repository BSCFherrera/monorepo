/**
 * Story `render` functions wrap real BSC components in a private, stateful
 * demo component (`ControlledSegmented`, `Example`, ...) so the story can own
 * its own local state. Docs source snippets should show the real component a
 * consumer would use, not that internal wrapper's name — this renames the
 * wrapper tag to the story's declared `component` in the generated snippet.
 * Stories whose wrapper renders meaningfully different props than the story's
 * own args (e.g. extra internal-only state) set `parameters.docs.source.code`
 * explicitly instead, which bypasses this transform entirely.
 */
const DEMO_WRAPPER_NAME = /<(Controlled\w*|Example)\b/;

export interface DocsSourceStoryContext {
  component?: { displayName?: string; name?: string };
}

export function toRealComponentSource(source: string, context: DocsSourceStoryContext): string {
  const match = source.match(DEMO_WRAPPER_NAME);
  if (!match) return source;

  const wrapperName = match[1];
  const realName = context.component?.displayName || context.component?.name;
  if (!realName || realName === wrapperName) return source;

  const tagBoundary = '(?=[\\s/>])';
  return source
    .replace(new RegExp(`<${wrapperName}${tagBoundary}`, 'g'), `<${realName}`)
    .replace(new RegExp(`</${wrapperName}>`, 'g'), `</${realName}>`);
}
