"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const src_1 = require("../src");
const CommonDialogExample_1 = require("./CommonDialogExample");
const meta = { title: 'Modals/Compatibility/ModalCommon', component: src_1.ModalCommon, args: { visible: true, onClose: () => { } }, tags: ['compatibility', 'deprecated'], parameters: { layout: 'fullscreen', docs: { description: { component: 'Compatibility wrapper kept for existing consumers. Prefer BottomSheetModal for new bottom-aligned surfaces; ModalCommon delegates to that shared surface and keeps the older onClose/closeOnBackdropPress prop names.' } } } };
exports.default = meta;
exports.Default = {
    parameters: { docs: { source: { code: `<ModalCommon visible={visible} onClose={handleClose}>
  <Text>Content supplied by the host.</Text>
</ModalCommon>` } } },
    render: args => (0, jsx_runtime_1.jsx)(CommonDialogExample_1.CommonDialogExample, { children: (visible, onClose) => (0, jsx_runtime_1.jsx)(src_1.ModalCommon, { ...args, visible: visible, onClose: onClose, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "Content supplied by the host, without a forced heading or close control." }) }) }),
};
