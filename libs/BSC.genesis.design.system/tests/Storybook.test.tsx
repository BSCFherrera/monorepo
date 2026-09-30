import { fireEvent, render, screen } from '@testing-library/react-native';
import { createElement, type ComponentType, type ReactElement } from 'react';
import { BscPrimaryButton, BscSecondaryButton, BscTextButton } from '@bsc/ui-native';
import { Card } from '../src';
import * as bscButtonStories from '../storybook/BscButton.stories';
import * as cardStories from '../storybook/Card.stories';
import { storyEntries } from '../storybook/catalog';
import { prepareStories } from '@storybook/react-native';

jest.mock('@storybook/addon-actions', () => ({ action: jest.fn(() => jest.fn()) }));
jest.mock('@storybook/react-native-ui', () => ({}));
jest.mock('@gorhom/bottom-sheet', () => ({}));
jest.mock('react-native-gesture-handler', () => ({}));

declare const __dirname: string;
declare function require(moduleName: string): unknown;

type DirectoryEntry = { isFile(): boolean; name: string };
const fs = require('fs') as { readdirSync(directory: string, options: { withFileTypes: true }): DirectoryEntry[] };
const path = require('path') as { resolve(...segments: string[]): string; basename(filePath: string, extension?: string): string };

test('Storybook 8.6 indexes every statically registered story', () => {
  const { index, importMap } = prepareStories({ storyEntries });
  expect(Object.keys(index.entries)).toEqual(expect.arrayContaining([
    'actions-bscbutton--primary', 'actions-bscbutton--secondary',
    'actions-bscbutton--disabled', 'actions-bscbutton--loading',
    'cards-card--default',
  ]));
  const req = storyEntries[0].req;
  const count = req.keys().reduce((total: number, key: string) => total + Object.keys(req(key)).filter(name => name !== 'default').length, 0);
  expect(Object.keys(index.entries)).toHaveLength(count);
  expect(Object.keys(importMap)).toHaveLength(req.keys().length);
});

test('catalog contains the actual exported components and all story modules', () => {
  const req = storyEntries[0].req;
  expect(req.keys()).toContain('./BscButton.stories');
  expect(req.keys()).toContain('./Card.stories');
  expect(req.keys()).toContain('./BscTextField.stories');
  expect(req.keys()).toContain('./BscSelect.stories');
  expect(req.keys()).toContain('./FeedbackModal.stories');
  expect(req('./BscButton.stories')).toBe(bscButtonStories);
  expect(req('./Card.stories')).toBe(cardStories);
  expect(bscButtonStories.default.component).toBe(BscPrimaryButton);
  expect(cardStories.default.component).toBe(Card);
  expect(Object.keys(bscButtonStories).filter(key => key !== 'default').sort())
    .toEqual(['Disabled', 'Large', 'Loading', 'Primary', 'Secondary', 'Small', 'Text']);
  expect(Object.keys(cardStories).filter(key => key !== 'default')).toEqual(['Default']);
  expect(() => req('./Missing.stories')).toThrow('Unknown story module');
});

test('catalog registers every Storybook story file', () => {
  const storiesDir = path.resolve(__dirname, '../storybook');
  const storyFiles = fs.readdirSync(storiesDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.stories.tsx'))
    .map(entry => `./${path.basename(entry.name, '.tsx')}`)
    .sort();
  const registeredStories = [...storyEntries[0].req.keys()].sort();

  expect(registeredStories).toEqual(storyFiles);
});

test.each([
  ['Primary', BscPrimaryButton, 1],
  ['Secondary', BscSecondaryButton, 1],
  ['Text', BscTextButton, 1],
] as const)('%s uses its real button args', (name, Component, expectedPresses) => {
  const onPress = jest.fn();
  const args = { ...bscButtonStories.default.args, ...bscButtonStories[name].args, onPress };
  render(<Component {...args} />);
  fireEvent.press(screen.getByRole('button', { name: args.label }));
  expect(onPress).toHaveBeenCalledTimes(expectedPresses);
});

test.each([
  ['Disabled', { disabled: true }],
  ['Loading', { disabled: true, busy: true }],
] as const)('%s exposes inactive accessibility state', (name, expectedState) => {
  const args = { ...bscButtonStories.default.args, ...bscButtonStories[name].args, onPress: jest.fn() };
  render(<BscPrimaryButton {...args} />);
  expect(screen.getByRole('button', { name: args.label }).props.accessibilityState).toMatchObject(expectedState);
});

test('Card story renders its native content', () => {
  render(<Card {...cardStories.default.args} />);
  expect(screen.getByText('A reusable card with native content.')).toBeTruthy();
});

const sharedExamples: [string, { render: () => ReactElement }][] = storyEntries[0].req.keys()
  .filter((key: string) => key !== './BscButton.stories' && key !== './Card.stories')
  .flatMap((key: string) => Object.entries(storyEntries[0].req(key))
    .filter(([name]) => name !== 'default')
    .filter(([, story]) => typeof story === 'object' && story !== null && 'render' in story)
    .map(([name, story]) => {
      const module = storyEntries[0].req(key);
      const entry = story as { render: ComponentType<object>; args?: object };
      return [key + '/' + name, { render: () => createElement(entry.render, { ...module.default.args, ...entry.args }) }] as const;
    }));

test.each(sharedExamples)('%s renders its shared example', (_name, story) => {
  const view = render(story.render());
  expect(view.toJSON()).not.toBeNull();
  view.unmount();
});

test('Metro adapter scopes export conditions and preserves the host resolver', () => {
  const withCatalog = require('../storybook/metro') as (config: { resolver: { resolveRequest: jest.Mock; sourceExts: string[] } }) => { resolver: { resolveRequest: (context: object, moduleName: string, platform: string) => unknown; sourceExts: string[] } };
  const resolveRequest = jest.fn(() => ({ type: 'sourceFile', filePath: '/module.js' }));
  const config = withCatalog({ resolver: { resolveRequest, sourceExts: ['js'] } });
  const context = { unstable_conditionNames: ['require'] };
  config.resolver.resolveRequest(context, '@storybook/core/preview-api', 'android');
  expect(resolveRequest).toHaveBeenLastCalledWith({
    ...context, unstable_enablePackageExports: true, unstable_conditionNames: ['import'],
  }, '@storybook/core/preview-api', 'android');
  config.resolver.resolveRequest(context, 'react-native', 'ios');
  expect(resolveRequest).toHaveBeenLastCalledWith(context, 'react-native', 'ios');
  expect(config.resolver.sourceExts).toEqual(['js']);
});
