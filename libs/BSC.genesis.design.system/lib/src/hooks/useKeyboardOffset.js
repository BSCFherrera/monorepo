"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardOffset = useKeyboardOffset;
const react_1 = require("react");
const react_native_1 = require("react-native");
/**
 * Returns the keyboard height on iOS while the surface is visible.
 * On Android, returns 0 because `adjustResize` handles layout.
 */
function useKeyboardOffset(visible = true) {
    const [offset, setOffset] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (!visible) {
            setOffset(0);
            return;
        }
        if (react_native_1.Platform.OS !== 'ios')
            return;
        const showSub = react_native_1.Keyboard.addListener('keyboardWillShow', (event) => {
            setOffset(event.endCoordinates.height);
        });
        const hideSub = react_native_1.Keyboard.addListener('keyboardWillHide', () => {
            setOffset(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [visible]);
    return visible ? offset : 0;
}
