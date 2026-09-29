"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalCentered = exports.ModalCommon = void 0;
exports.TouchableCard = TouchableCard;
exports.RegisterPromptCard = RegisterPromptCard;
exports.Loader = Loader;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const display_1 = require("../../display");
const surfaces_1 = require("../surfaces");
/**
 * @deprecated Compatibility wrapper kept for existing consumers. Prefer BottomSheetModal for new bottom-aligned surfaces.
 */
exports.ModalCommon = (0, react_1.forwardRef)(function ModalCommon({ onClose, closeOnBackdropPress = true, ...props }, ref) {
    return (0, jsx_runtime_1.jsx)(surfaces_1.BottomSheetModal, { ...props, onDismiss: onClose, canDismiss: closeOnBackdropPress, ref: ref });
});
/**
 * @deprecated Compatibility wrapper kept for existing consumers. Prefer CenteredModal for new centered surfaces.
 */
exports.ModalCentered = (0, react_1.forwardRef)(function ModalCentered({ onClose, closeOnBackdropPress = true, ...props }, ref) {
    return (0, jsx_runtime_1.jsx)(surfaces_1.CenteredModal, { ...props, onDismiss: onClose, canDismiss: closeOnBackdropPress, ref: ref });
});
function TouchableCard(props) { return (0, jsx_runtime_1.jsx)(display_1.ActionCard, { ...props, variant: "standard" }); }
function RegisterPromptCard(props) { return (0, jsx_runtime_1.jsx)(display_1.ActionCard, { iconName: "user-plus", ...props, variant: "registration" }); }
function Loader(props) { return (0, jsx_runtime_1.jsx)(display_1.LoadingOverlay, { ...props }); }
