import type { StoryObj } from '@storybook/react';
import { Loader } from '../src';
declare const meta: {
    title: string;
    component: typeof Loader;
    args: {
        visible: true;
    };
    decorators: ((Story: import(".pnpm/@storybook+core@8.6.14_prettier@2.8.8_storybook@8.6.14_prettier@2.8.8_/node_modules/@storybook/core/csf", { with: { "resolution-mode": "import" } }).PartialStoryFn<import("@storybook/react").ReactRenderer, {
        visible: boolean;
        label?: string | undefined;
        animated?: boolean | undefined;
    }>) => import("react").JSX.Element)[];
    parameters: {
        docs: {
            description: {
                component: string;
            };
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const ProviderControlled: Story;
