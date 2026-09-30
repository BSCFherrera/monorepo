import { toRealComponentSource } from '../.storybook/docsSourceTransform';
import { storyEntries } from '../storybook/catalog';

jest.mock('@storybook/addon-actions', () => ({ action: jest.fn(() => jest.fn()) }));
jest.mock('@storybook/react-native-ui', () => ({}));
jest.mock('@gorhom/bottom-sheet', () => ({}));
jest.mock('react-native-gesture-handler', () => ({}));

describe('toRealComponentSource', () => {
  test('renames a bare wrapper tag to the story component name', () => {
    const source = '<ControlledSegmented labels={["DOP", "USD"]} selectedIndex={0} onChange={function noRefCheck() {}} />';
    expect(toRealComponentSource(source, { component: { name: 'BscSegmented' } })).toBe(
      '<BscSegmented labels={["DOP", "USD"]} selectedIndex={0} onChange={function noRefCheck() {}} />',
    );
  });

  test('renames a matching closing tag', () => {
    const source = '<Example title="Confirm">child</Example>';
    expect(toRealComponentSource(source, { component: { name: 'OnboardingClientVerifiedModal' } })).toBe(
      '<OnboardingClientVerifiedModal title="Confirm">child</OnboardingClientVerifiedModal>',
    );
  });

  test('leaves source untouched when it does not start with a known demo wrapper', () => {
    const source = '<BscPrimaryButton label="Continue" />';
    expect(toRealComponentSource(source, { component: { name: 'BscSegmented' } })).toBe(source);
  });

  test('leaves source untouched when the story has no declared component', () => {
    const source = '<ControlledSegmented labels={["DOP", "USD"]} />';
    expect(toRealComponentSource(source, {})).toBe(source);
  });
});

describe('storybook docs source coverage for private demo wrappers', () => {
  test('a render function that ignores args but renders a "*Example" wrapper declares an explicit docs.source.code override', () => {
    const req = storyEntries[0].req;
    const offenders: string[] = [];

    for (const key of req.keys()) {
      const storyModule = req(key) as Record<string, unknown>;
      for (const [name, story] of Object.entries(storyModule)) {
        if (name === 'default' || typeof story !== 'object' || story === null || !('render' in story)) continue;
        const render = (story as { render: (...args: unknown[]) => unknown }).render;
        if (typeof render !== 'function' || render.length !== 0) continue; // takes args -> handled by the global rename transform instead
        if (!/<\w*Example\b/.test(render.toString())) continue;

        const code = (story as { parameters?: { docs?: { source?: { code?: string } } } }).parameters?.docs?.source?.code;
        if (!code) offenders.push(`${key}/${name}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
