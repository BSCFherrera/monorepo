/**
 * Returns the keyboard height on iOS while the surface is visible.
 * On Android, returns 0 because `adjustResize` handles layout.
 */
export declare function useKeyboardOffset(visible?: boolean): number;
