"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterPromptCardVariant = exports.TouchableCardVariant = exports.Disabled = exports.Registration = exports.Standard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const src_1 = require("../src");
const meta = {
    title: 'Cards/ActionCard',
    component: src_1.ActionCard,
    args: { title: 'Explore details', subtitle: 'Tap to view more information' },
    parameters: { docs: { description: { component: 'Action card stories include the compatibility card wrappers as variants so the catalog is grouped by purpose.' } } },
};
exports.default = meta;
exports.Standard = { args: { onPress: () => { } } };
exports.Registration = { args: { variant: 'registration', title: 'First time here?', subtitle: 'Create your account', iconName: 'user-plus', onPress: () => { } } };
exports.Disabled = { args: { disabled: true, onPress: () => { } } };
exports.TouchableCardVariant = {
    name: 'TouchableCard compatibility variant',
    args: { onPress: () => { } },
    parameters: {
        docs: {
            description: { story: 'Compatibility wrapper kept under ActionCard because it serves the same selectable-card purpose.' },
            source: {
                code: `<TouchableCard
  title="Review your preferences"
  subtitle="Choose the details you want to update."
  iconName="user"
  onPress={handlePress}
/>`,
            },
        },
    },
    render: () => (0, jsx_runtime_1.jsx)(src_1.TouchableCard, { title: "Review your preferences", subtitle: "Choose the details you want to update.", iconName: "user", onPress: () => { } }),
};
exports.RegisterPromptCardVariant = {
    name: 'RegisterPromptCard compatibility variant',
    args: { onPress: () => { } },
    parameters: {
        docs: {
            description: { story: 'Compatibility wrapper kept under ActionCard because it is a registration-flavored action card.' },
            source: {
                code: `<RegisterPromptCard
  title="First time here?"
  subtitle="Create a demo profile to continue."
  onPress={handleRegister}
/>`,
            },
        },
    },
    render: () => (0, jsx_runtime_1.jsx)(src_1.RegisterPromptCard, { title: "First time here?", subtitle: "Create a demo profile to continue.", onPress: () => { } }),
};
