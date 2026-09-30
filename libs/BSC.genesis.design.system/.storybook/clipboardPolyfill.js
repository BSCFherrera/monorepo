// Standalone web clipboard polyfill for Storybook.
// Uses browser navigator.clipboard API directly (no native module dependency).
const noop = () => Promise.resolve('');
const noopSet = () => Promise.resolve();

function isClipboardAvailable() {
  return typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function';
}

const Clipboard = {
  getString: isClipboardAvailable()
    ? async () => { try { return (await navigator.clipboard.readText()) ?? ''; } catch { return ''; } }
    : noop,
  setString: isClipboardAvailable()
    ? async (text) => { try { await navigator.clipboard.writeText(text ?? ''); } catch { /* insecure context */ } }
    : noopSet,
  getImage: async () => undefined,
  setImage: async () => {},
  addListener: () => {},
  removeListeners: () => {},
};

module.exports = Clipboard;
module.exports.default = Clipboard;
module.exports.Clipboard = Clipboard;
