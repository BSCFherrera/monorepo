import type { StoryObj } from '@storybook/react';
import { type OnboardingClientVerifiedModalProps } from '../src';
declare const meta: {
    title: string;
    component: import("react").ForwardRefExoticComponent<OnboardingClientVerifiedModalProps & import("react").RefAttributes<import("libs/BSC.genesis.design.system/src/components/modals/surfaces").ModalHandle>>;
    tags: string[];
    parameters: {
        layout: string;
        docs: {
            description: {
                component: string;
            };
        };
    };
    args: {
        visible: true;
        onClose: () => void;
        title: string;
        message: string;
        details: {
            label: string;
            value: string;
        }[];
        logo: import("react").JSX.Element;
        secondaryLabel: string;
        onSecondary: () => void;
        confirmLabel: string;
    };
};
export default meta;
export declare const Default: StoryObj<typeof meta>;
export declare const ServiceError: StoryObj<typeof meta>;
