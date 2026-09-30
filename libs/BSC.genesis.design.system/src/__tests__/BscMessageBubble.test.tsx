import { StyleSheet, Text } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { BscMessageBubble } from '../components/BscMessageBubble';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

// The component itself also carries the testID prop, so skip it and read the
// wrapper view that receives the alignment style.
function alignment(tree: TestRenderer.ReactTestRenderer): unknown {
  const [wrapper] = tree.root.findAll(
    node => node.props.testID === 'bubble' && node.props.style !== undefined,
  );
  return StyleSheet.flatten(wrapper?.props.style).alignItems;
}

describe('BscMessageBubble', () => {
  it('aligns incoming messages to the start and outgoing messages to the end', () => {
    expect(
      alignment(
        render(<BscMessageBubble testID="bubble">Hi</BscMessageBubble>),
      ),
    ).toBe('flex-start');
    expect(
      alignment(
        render(
          <BscMessageBubble direction="outgoing" testID="bubble">
            Hi
          </BscMessageBubble>,
        ),
      ),
    ).toBe('flex-end');
  });

  it.each([
    ['user', 'flex-end'],
    ['Me', 'flex-end'],
    ['assistant', 'flex-start'],
    ['bot', 'flex-start'],
  ])('derives direction from the legacy sender %p', (sender, expected) => {
    const tree = render(
      <BscMessageBubble
        direction="incoming"
        message={{ sender, content: 'Hi' }}
        testID="bubble"
      />,
    );

    expect(alignment(tree)).toBe(expected);
  });

  it('falls back to the direction prop when the legacy sender is unknown', () => {
    const tree = render(
      <BscMessageBubble
        direction="outgoing"
        message={{ sender: 'system', content: 'Hi' }}
        testID="bubble"
      />,
    );

    expect(alignment(tree)).toBe('flex-end');
  });

  it('renders **text** segments in bold and the rest as regular text', () => {
    const tree = render(
      <BscMessageBubble>
        {'Your balance is **RD$ 500** today'}
      </BscMessageBubble>,
    );
    const bold = tree.root.findByProps({ children: 'RD$ 500' });

    expect(StyleSheet.flatten(bold.props.style).fontWeight).toBeDefined();
    expect(
      tree.root.findByProps({ children: 'Your balance is ' }).props.style,
    ).toBeUndefined();
    expect(
      tree.root.findByProps({ children: ' today' }).props.style,
    ).toBeUndefined();
  });

  it('renders non-string content as-is', () => {
    const tree = render(
      <BscMessageBubble>
        <Text>Rich content</Text>
      </BscMessageBubble>,
    );

    expect(tree.root.findByProps({ children: 'Rich content' })).toBeTruthy();
  });

  it('shows the explicit timestamp label over the message timestamp', () => {
    const tree = render(
      <BscMessageBubble
        timestampLabel="10:30"
        message={{ content: 'Hi', timestamp: 'not-a-date' }}
      />,
    );

    expect(tree.root.findByProps({ children: '10:30' })).toBeTruthy();
    expect(tree.root.findAllByProps({ children: 'not-a-date' })).toHaveLength(
      0,
    );
  });

  it('shows an unparseable legacy timestamp verbatim and omits it when absent', () => {
    const withTimestamp = render(
      <BscMessageBubble message={{ content: 'Hi', timestamp: 'yesterday' }} />,
    );
    expect(
      withTimestamp.root.findByProps({ children: 'yesterday' }),
    ).toBeTruthy();

    const withoutTimestamp = render(<BscMessageBubble>Hi</BscMessageBubble>);
    expect(withoutTimestamp.root.findAllByType(Text)).toHaveLength(2);
  });

  it('formats a valid legacy timestamp as a time of day', () => {
    const date = new Date(2026, 0, 15, 9, 5);
    const tree = render(
      <BscMessageBubble message={{ content: 'Hi', timestamp: date }} />,
    );

    expect(
      tree.root.findByProps({
        children: date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }),
    ).toBeTruthy();
  });
});
