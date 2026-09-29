"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonDismissable = exports.ImperativeRef = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const src_1 = require("../src");
const meta = {
    title: 'Modals/Surfaces/CenteredModal',
    component: src_1.CenteredModal,
    args: { visible: false, onDismiss: () => { } },
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: 'Use controlled `visible` when application state owns the modal lifecycle, for example navigation, persisted flows, or analytics. Use the imperative `ref` for local UI triggers such as “open details”, demos, and escape hatches where the parent does not need to store visibility.' } },
    },
};
exports.default = meta;
function CenteredExample() {
    const [visible, setVisible] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open centered modal", onPress: () => setVisible(true) }), (0, jsx_runtime_1.jsx)(src_1.CenteredModal, { visible: visible, onDismiss: () => setVisible(false), title: "Example Dialog", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "Centered content supplied by the host." }) })] }));
}
exports.Default = {
    parameters: {
        docs: {
            source: {
                code: `const [visible, setVisible] = useState(false);

<>
  <BscPrimaryButton label="Open centered modal" onPress={() => setVisible(true)} />
  <CenteredModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Example Dialog"
  >
    <Text>Centered content supplied by the host.</Text>
  </CenteredModal>
</>`,
            },
        },
    },
    render: () => (0, jsx_runtime_1.jsx)(CenteredExample, {}),
};
exports.ImperativeRef = {
    parameters: {
        docs: {
            source: {
                code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close with ref" onPress={() => modalRef.current?.close()} />
  <CenteredModal
    ref={modalRef}
    title="Imperative Dialog"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Modal content supplied by the host.</Text>
  </CenteredModal>
</>`,
            },
        },
    },
    render: () => {
        const modalRef = (0, react_1.useRef)(null);
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open with ref", onPress: () => modalRef.current?.open() }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Close with ref", onPress: () => modalRef.current?.close() }), (0, jsx_runtime_1.jsx)(src_1.CenteredModal, { ref: modalRef, title: "Imperative Dialog", onDismiss: () => modalRef.current?.close(), children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "The host uses ModalHandle.open() and ModalHandle.close() instead of storing `visible` state." }) })] }));
    },
};
exports.NonDismissable = {
    parameters: {
        docs: {
            source: {
                code: `<CenteredModal
  visible={visible}
  onDismiss={handleClose}
  canDismiss={false}
  title="Confirm action"
>
  <Text>This modal cannot be dismissed by tapping outside.</Text>
  <BscPrimaryButton label="Close" onPress={handleClose} />
</CenteredModal>`,
            },
        },
    },
    render: () => {
        const [visible, setVisible] = (0, react_1.useState)(false);
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open non-dismissable", onPress: () => setVisible(true) }), (0, jsx_runtime_1.jsxs)(src_1.CenteredModal, { visible: visible, onDismiss: () => setVisible(false), canDismiss: false, title: "Confirm action", children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "This modal cannot be dismissed by tapping outside." }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Close", onPress: () => setVisible(false) })] })] }));
    },
};
