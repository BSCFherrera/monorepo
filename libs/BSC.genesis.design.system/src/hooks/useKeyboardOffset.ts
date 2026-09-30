import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

/**
 * Returns the keyboard height on iOS while the surface is visible.
 * On Android, returns 0 because `adjustResize` handles layout.
 */
export function useKeyboardOffset(visible = true): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!visible) { setOffset(0); return; }
    if (Platform.OS !== 'ios') return;

    const showSub = Keyboard.addListener('keyboardWillShow', (event: KeyboardEvent) => {
      setOffset(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  return visible ? offset : 0;
}
