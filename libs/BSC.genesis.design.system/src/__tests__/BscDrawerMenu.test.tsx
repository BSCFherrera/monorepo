import { Modal } from 'react-native';
import TestRenderer from 'react-test-renderer';

import {
  BscDrawerMenu,
  type BscDrawerMenuItem,
} from '../components/BscDrawerMenu';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

// Presses the nearest pressable at or above the matched node, so a row can be
// targeted by its visible text as well as by its accessibility label.
function press(
  tree: TestRenderer.ReactTestRenderer,
  props: Record<string, unknown>,
): void {
  let node: TestRenderer.ReactTestInstance | null =
    tree.root.findByProps(props);
  while (node !== null && typeof node.props.onPress !== 'function')
    node = node.parent;
  if (node === null)
    throw new Error(`No pressable found for ${JSON.stringify(props)}`);
  const target = node;
  TestRenderer.act(() => {
    target.props.onPress();
  });
}

function item(
  id: string,
  label: string,
  extra: Partial<BscDrawerMenuItem> = {},
): BscDrawerMenuItem {
  return { id, label, onPress: jest.fn(), ...extra };
}

describe('BscDrawerMenu', () => {
  it('renders nothing while hidden', () => {
    const tree = render(
      <BscDrawerMenu visible={false} items={[item('home', 'Home')]} />,
    );

    expect(tree.toJSON()).toBeNull();
  });

  it('renders the title and items, marking the selected item', () => {
    const home = item('home', 'Home');
    const cards = item('cards', 'Cards');
    const tree = render(
      <BscDrawerMenu
        visible
        title="Main menu"
        items={[home, cards]}
        selectedId="cards"
      />,
    );

    expect(tree.root.findByType(Modal).props.visible).toBe(true);
    expect(tree.root.findByProps({ children: 'Main menu' })).toBeTruthy();
    expect(
      tree.root.findByProps({ accessibilityLabel: 'Home' }).props
        .accessibilityState,
    ).toEqual({
      disabled: false,
      selected: false,
    });
    expect(
      tree.root.findByProps({ accessibilityLabel: 'Cards' }).props
        .accessibilityState,
    ).toEqual({
      disabled: false,
      selected: true,
    });

    press(tree, { accessibilityLabel: 'Home' });

    expect(home.onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire a disabled item', () => {
    const locked = item('locked', 'Locked', { disabled: true });
    const tree = render(<BscDrawerMenu visible items={[locked]} />);
    const row = tree.root.findByProps({ accessibilityLabel: 'Locked' });

    expect(row.props.accessibilityState).toEqual({
      disabled: true,
      selected: false,
    });
    expect(row.props.onPress).toBeUndefined();
  });

  it('renders group titles with their items', () => {
    const tree = render(
      <BscDrawerMenu
        visible
        groups={[
          { title: 'ACCOUNTS', items: [item('savings', 'Savings')] },
          { items: [item('help', 'Help')] },
        ]}
      />,
    );

    expect(tree.root.findByProps({ children: 'ACCOUNTS' })).toBeTruthy();
    expect(
      tree.root.findByProps({ accessibilityLabel: 'Savings' }),
    ).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: 'Help' })).toBeTruthy();
  });

  it('dismisses from the close button, the backdrop and the hardware back action', () => {
    const onDismiss = jest.fn();
    const tree = render(
      <BscDrawerMenu visible items={[]} onDismiss={onDismiss} />,
    );

    press(tree, { accessibilityLabel: 'Close menu' });
    press(tree, { accessibilityLabel: 'Dismiss menu' });
    TestRenderer.act(() => {
      tree.root.findByType(Modal).props.onRequestClose();
    });

    expect(onDismiss).toHaveBeenCalledTimes(3);
  });

  it('falls back to onClose when onDismiss is not provided', () => {
    const onClose = jest.fn();
    const tree = render(<BscDrawerMenu visible items={[]} onClose={onClose} />);

    press(tree, { accessibilityLabel: 'Close menu' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the new-conversation and logout actions only when handlers are provided', () => {
    const onNewConversation = jest.fn();
    const onLogout = jest.fn();
    const tree = render(
      <BscDrawerMenu
        visible
        items={[]}
        newConversationLabel="+ Nueva conversación"
        onNewConversation={onNewConversation}
        logoutLabel="Cerrar sesión"
        onLogout={onLogout}
      />,
    );

    press(tree, { children: '+ Nueva conversación' });
    press(tree, { children: 'Cerrar sesión' });

    expect(onNewConversation).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);

    const bare = render(<BscDrawerMenu visible items={[]} />);
    expect(
      bare.root.findAllByProps({ children: '+ New conversation' }),
    ).toHaveLength(0);
    expect(bare.root.findAllByProps({ children: 'Log out' })).toHaveLength(0);
  });

  it('lists history and opens an entry through its own handler', () => {
    const onPress = jest.fn();
    const tree = render(
      <BscDrawerMenu
        visible
        items={[]}
        history={[
          { id: 'c1', title: 'Card request', preview: 'Documents', onPress },
        ]}
      />,
    );

    expect(tree.root.findByProps({ children: 'CONVERSATIONS' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Documents' })).toBeTruthy();

    press(tree, { children: 'Card request' });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('opens a history entry without its own handler through onOpenHistory and dismisses', () => {
    const onOpenHistory = jest.fn();
    const onDismiss = jest.fn();
    const entry = { id: 'c1', title: 'Card request', preview: 'Documents' };
    const tree = render(
      <BscDrawerMenu
        visible
        items={[]}
        history={[entry]}
        onOpenHistory={onOpenHistory}
        onDismiss={onDismiss}
      />,
    );

    press(tree, { children: 'Card request' });

    expect(onOpenHistory).toHaveBeenCalledWith(expect.objectContaining(entry));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  describe('legacy route mode', () => {
    it('renders the built-in navigation and navigates then dismisses on press', () => {
      const onNavigate = jest.fn();
      const onDismiss = jest.fn();
      const tree = render(
        <BscDrawerMenu
          visible
          onNavigate={onNavigate}
          onDismiss={onDismiss}
          currentRoute="Products"
        />,
      );

      expect(tree.root.findByProps({ children: 'NAVEGACION' })).toBeTruthy();
      expect(
        tree.root.findByProps({ accessibilityLabel: 'Productos' }).props
          .accessibilityState,
      ).toEqual({
        disabled: false,
        selected: true,
      });

      press(tree, { accessibilityLabel: 'Transacciones' });

      expect(onNavigate).toHaveBeenCalledWith('Transactions');
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('routes new conversation to Chat and logout to Profile when no handlers are given', () => {
      const onNavigate = jest.fn();
      const tree = render(<BscDrawerMenu visible onNavigate={onNavigate} />);

      press(tree, { children: '+ Nueva conversacion' });
      press(tree, { children: 'Cerrar sesion' });

      expect(onNavigate).toHaveBeenNthCalledWith(1, 'Chat');
      expect(onNavigate).toHaveBeenNthCalledWith(2, 'Profile');
    });

    it('prefers explicit new-conversation and logout handlers over navigation', () => {
      const onNavigate = jest.fn();
      const onNewConversation = jest.fn();
      const onLogout = jest.fn();
      const tree = render(
        <BscDrawerMenu
          visible
          onNavigate={onNavigate}
          onNewConversation={onNewConversation}
          onLogout={onLogout}
        />,
      );

      press(tree, { children: '+ Nueva conversacion' });
      press(tree, { children: 'Cerrar sesion' });

      expect(onNewConversation).toHaveBeenCalledTimes(1);
      expect(onLogout).toHaveBeenCalledTimes(1);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('shows the built-in conversation history when onOpenHistory is provided', () => {
      const onOpenHistory = jest.fn();
      const tree = render(
        <BscDrawerMenu
          visible
          onNavigate={jest.fn()}
          onOpenHistory={onOpenHistory}
        />,
      );

      expect(
        tree.root.findByProps({ children: 'CONVERSACIONES' }),
      ).toBeTruthy();

      press(tree, { children: 'Solicitud de tarjeta' });

      expect(onOpenHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'h2' }),
      );
    });
  });
});
