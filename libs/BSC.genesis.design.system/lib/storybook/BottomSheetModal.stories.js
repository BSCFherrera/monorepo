"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImperativeRef = exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const ui_native_1 = require("@bsc/ui-native");
const src_1 = require("../src");
const meta = {
    title: 'Modals/Surfaces/BottomSheetModal',
    component: src_1.BottomSheetModal,
    args: { visible: false, onDismiss: () => { } },
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: 'Use controlled `visible` when the sheet is part of app state or navigation. Use the imperative `ref` for local actions where callers only need to open or close the sheet.' } },
    },
};
exports.default = meta;
function SheetExample() {
    const [visible, setVisible] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open bottom sheet", onPress: () => setVisible(true) }), (0, jsx_runtime_1.jsx)(src_1.BottomSheetModal, { visible: visible, onDismiss: () => setVisible(false), title: "Bottom Sheet", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "A bottom-aligned modal without drag gestures." }) })] }));
}
exports.Default = {
    parameters: {
        docs: {
            source: {
                code: `const [visible, setVisible] = useState(false);

<>
  <BscPrimaryButton label="Open bottom sheet" onPress={() => setVisible(true)} />
  <BottomSheetModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Bottom Sheet"
  >
    <Text>A bottom-aligned modal without drag gestures.</Text>
  </BottomSheetModal>
</>`,
            },
        },
    },
    render: () => (0, jsx_runtime_1.jsx)(SheetExample, {}),
};
exports.ImperativeRef = {
    parameters: {
        docs: {
            source: {
                code: `const modalRef = useRef<ModalHandle>(null);

<>
  <BscPrimaryButton label="Open with ref" onPress={() => modalRef.current?.open()} />
  <BscPrimaryButton label="Close with ref" onPress={() => modalRef.current?.close()} />
  <BottomSheetModal
    ref={modalRef}
    title="Imperative Sheet"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Sheet content supplied by the host.</Text>
  </BottomSheetModal>
</>`,
            },
        },
    },
    render: () => {
        const modalRef = (0, react_1.useRef)(null);
        return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { gap: 16 }, children: [(0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Open with ref", onPress: () => modalRef.current?.open() }), (0, jsx_runtime_1.jsx)(ui_native_1.BscPrimaryButton, { label: "Close with ref", onPress: () => modalRef.current?.close() }), (0, jsx_runtime_1.jsx)(src_1.BottomSheetModal, { ref: modalRef, title: "Imperative Sheet", onDismiss: () => modalRef.current?.close(), children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "The host uses ModalHandle for a local bottom-sheet trigger without keeping `visible` in state." }) })] }));
    },
};
