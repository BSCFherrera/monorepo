import type { StoryObj } from '@storybook/react';
import { ActionCard } from '../src';
declare const meta: {
    title: string;
    component: typeof ActionCard;
    args: {
        title: string;
        subtitle: string;
    };
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
export declare const Standard: Story;
export declare const Registration: Story;
export declare const Disabled: Story;
export declare const TouchableCardVariant: Story;
export declare const RegisterPromptCardVariant: Story;
