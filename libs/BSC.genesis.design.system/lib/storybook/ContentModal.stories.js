"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disclaimer = exports.ImperativeRef = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const meta = {
    title: 'Modals/Compatibility/ContentModal',
    component: src_1.ContentModal,
    args: { visible: false, onDismiss: () => { } },
    tags: ['compatibility'],
    parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility adapter for terms/disclaimer-style content. Prefer TermsAndConditionsModal or DisclaimerModal for named recipes. Use controlled `visible` when host state owns acceptance; use the imperative `ref` for local preview/demo triggers.' } } },
};
exports.default = meta;
function TermsExample() {
    const [visible, setVisible] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(src_1.Button, { label: "Open terms modal", onPress: () => setVisible(true) }), (0, jsx_runtime_1.jsx)(src_1.ContentModal, { visible: visible, onDismiss: () => setVisible(false), title: "Terms and Conditions", acceptLabel: "Accept", onAccept: () => setVisible(false), children: (0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: { fontSize: 12, lineHeight: 20, textAlign: 'justify' }, children: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", '\n\n', "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."] }) })] }));
}
exports.Default = {
    parameters: {
        docs: {
            source: {
                code: `const [visible, setVisible] = useState(false);

<>
  <Button label="Open terms modal" onPress={() => setVisible(true)} />
  <ContentModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Terms and Conditions"
    acceptLabel="Accept"
    onAccept={() => setVisible(false)}
  >
    <Text>Terms content supplied by the host.</Text>
  </ContentModal>
</>`,
            },
        },
    },
    render: () => (0, jsx_runtime_1.jsx)(TermsExample, {}),
};
exports.ImperativeRef = {
    parameters: {
        docs: {
            source: {
                code: `const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open content with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close content with ref" onPress={() => modalRef.current?.close()} />
  <ContentModal
    ref={modalRef}
    title="Content preview"
    acceptLabel="Accept"
    onAccept={() => modalRef.current?.close()}
  >
    <Text>Preview content supplied by the host.</Text>
  </ContentModal>
</>`,
            },
        },
    },
    render: () => {
        const modalRef = (0, react_1.useRef)(null);
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(src_1.Button, { label: "Open content with ref", onPress: () => modalRef.current?.open() }), (0, jsx_runtime_1.jsx)(src_1.Button, { label: "Close content with ref", onPress: () => modalRef.current?.close() }), (0, jsx_runtime_1.jsx)(src_1.ContentModal, { ref: modalRef, title: "Content preview", acceptLabel: "Accept", onAccept: () => modalRef.current?.close(), children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "Use ModalHandle when the content modal is opened by a local trigger and parent state does not need to track visibility." }) })] }));
    },
};
exports.Disclaimer = {
    args: { visible: true, variant: 'disclaimer', title: 'Before you continue', subtitle: 'Prepare the following demo items.', requirements: [{ label: 'A demo profile', iconName: 'user' }, { label: 'A sample document', iconName: 'file-text' }], onAccept: () => { }, acceptLabel: 'Continue' },
    parameters: {
        docs: {
            source: {
                code: `<ContentModal
  visible={visible}
  onDismiss={handleDismiss}
  variant="disclaimer"
  title="Before you continue"
  subtitle="Prepare the following items."
  requirements={requirements}
  acceptLabel="Continue"
  onAccept={handleContinue}
/>`,
            },
        },
    },
};
