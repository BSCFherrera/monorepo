"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderControlled = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const LoaderContext = (0, react_1.createContext)(null);
function LoaderProviderExample({ children }) {
    const [visible, setVisible] = (0, react_1.useState)(false);
    const showLoader = (0, react_1.useCallback)(() => setVisible(true), []);
    const hideLoader = (0, react_1.useCallback)(() => setVisible(false), []);
    const withLoader = (0, react_1.useCallback)(async (task) => {
        showLoader();
        try {
            await task();
        }
        finally {
            hideLoader();
        }
    }, [hideLoader, showLoader]);
    const value = (0, react_1.useMemo)(() => ({ visible, showLoader, hideLoader, withLoader }), [hideLoader, showLoader, visible, withLoader]);
    return ((0, jsx_runtime_1.jsx)(LoaderContext.Provider, { value: value, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { minHeight: 280, padding: 16, gap: 12 }, children: [children, (0, jsx_runtime_1.jsx)(src_1.Loader, { visible: visible })] }) }));
}
function useLoaderExample() {
    const context = (0, react_1.useContext)(LoaderContext);
    if (!context) {
        throw new Error('useLoaderExample must be used within LoaderProviderExample');
    }
    return context;
}
function LoaderControlsExample() {
    const { hideLoader, showLoader, visible, withLoader } = useLoaderExample();
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 12 }, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "Provider-controlled loading keeps one overlay at the app root while screens call a hook." }), (0, jsx_runtime_1.jsxs)(react_native_1.Text, { children: ["Current state: ", visible ? 'visible' : 'hidden'] }), (0, jsx_runtime_1.jsx)(react_native_1.Button, { title: "Show loader", onPress: showLoader }), (0, jsx_runtime_1.jsx)(react_native_1.Button, { title: "Hide loader", onPress: hideLoader }), (0, jsx_runtime_1.jsx)(react_native_1.Button, { title: "Run async action", onPress: () => {
                    void withLoader(() => new Promise(resolve => setTimeout(resolve, 1200)));
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
                component: 'Compatibility loader. Existing screens may keep `<Loader visible={loading} />`; app-level integrations should prefer one provider-owned root overlay controlled from a hook.',
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
                story: 'Example of the Conversacional pattern: a provider owns the visible state, exposes hook actions, and renders the compatibility Loader once at the root.',
            },
            source: {
                code: `function LoaderProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const withLoader = async (task) => {
    setVisible(true);
    try {
      await task();
    } finally {
      setVisible(false);
    }
  };

  return (
    <LoaderContext.Provider value={{ visible, showLoader: () => setVisible(true), hideLoader: () => setVisible(false), withLoader }}>
      {children}
      <Loader visible={visible} />
    </LoaderContext.Provider>
  );
}`,
            },
        },
    },
    render: () => ((0, jsx_runtime_1.jsx)(LoaderProviderExample, { children: (0, jsx_runtime_1.jsx)(LoaderControlsExample, {}) })),
};
