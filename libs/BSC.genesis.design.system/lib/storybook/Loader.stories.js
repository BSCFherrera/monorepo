"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderControlled = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ui_native_1 = require("@bsc/ui-native");
const react_native_1 = require("react-native");
const src_1 = require("../src");
function LoaderControlsExample() {
    const { hideLoader, showLoader, visible, withLoader } = (0, ui_native_1.useBscLoader)();
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 12 }, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "Provider-controlled loading keeps one overlay at the app root while screens call a hook." }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { children: ["Current state: ", visible ? 'visible' : 'hidden'] }), (0, jsx_runtime_1.jsx)(react_native_1.Button, { title: "Show loader", onPress: () => showLoader('Loading') }), (0, jsx_runtime_1.jsx)(react_native_1.Button, { title: "Hide loader", onPress: hideLoader }), (0, jsx_runtime_1.jsx)(react_native_1.Button, { title: "Run async action", onPress: () => {
                    withLoader(() => new Promise(resolve => setTimeout(resolve, 1200)), 'Loading').catch(() => undefined);
                } })] }));
}
const meta = {
    title: 'Feedback/Loader',
    component: src_1.Loader,
    args: { visible: true },
    decorators: [(Story) => (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { height: 280, width: '100%' }, children: (0, jsx_runtime_1.jsx)(Story, {}) })],
    parameters: {
        docs: {
            description: {
                component: 'Compatibility loader. Existing screens may keep `<Loader visible={loading} />`; app-level integrations should prefer `BscLoaderProvider` at the root and `useBscLoader` from screens.',
            },
        },
    },
};
exports.default = meta;
exports.Default = {};
exports.ProviderControlled = {
    parameters: {
        docs: {
            description: {
                story: 'Official provider-owned pattern: BscLoaderProvider owns the visible state, screens call useBscLoader actions, and the overlay is rendered once at the root.',
            },
            source: {
                code: `function ScreenAction() {
  const { withLoader } = useBscLoader();

  return (
    <Button
      title="Run async action"
      onPress={() => withLoader(() => save(), 'Loading')}
    />
  );
}

function AppRoot() {
  return <BscLoaderProvider><ScreenAction /></BscLoaderProvider>;
}`,
            },
        },
    },
    render: () => ((0, jsx_runtime_1.jsx)(ui_native_1.BscLoaderProvider, { children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: { minHeight: 280, padding: 16, gap: 12 }, children: (0, jsx_runtime_1.jsx)(LoaderControlsExample, {}) }) })),
};
