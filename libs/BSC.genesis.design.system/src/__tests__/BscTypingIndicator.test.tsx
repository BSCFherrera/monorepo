import { AccessibilityInfo, Animated } from 'react-native';
import TestRenderer from 'react-test-renderer';

import {
  BscTypingIndicator,
  startTypingIndicatorAnimations,
} from '../components/BscTypingIndicator';

const mounted: TestRenderer.ReactTestRenderer[] = [];

async function render(
  element: React.JSX.Element,
): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await TestRenderer.act(async () => {
    tree = TestRenderer.create(element);
  });
  mounted.push(tree);
  return tree;
}

function animatedDots(
  tree: TestRenderer.ReactTestRenderer,
): TestRenderer.ReactTestInstance[] {
  return tree.root.findAllByType(Animated.View);
}

function hasAnimatedOpacity(dot: TestRenderer.ReactTestInstance): boolean {
  const styles = [dot.props.style].flat(Infinity) as Array<
    { opacity?: unknown } | null | undefined
  >;
  return styles.some(style => style?.opacity !== undefined);
}

describe('BscTypingIndicator', () => {
  let reduceMotion: jest.SpyInstance;
  const remove = jest.fn();

  beforeEach(() => {
    reduceMotion = jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove } as never);
    // Native-driven loops never settle under Jest; the rendered opacity binding is what these tests assert.
    jest
      .spyOn(Animated, 'loop')
      .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });
  });

  afterEach(() => {
    TestRenderer.act(() => {
      mounted.splice(0).forEach(tree => tree.unmount());
    });
    jest.restoreAllMocks();
    remove.mockClear();
  });

  it('exposes progress semantics with a translatable label and three dots', async () => {
    const tree = await render(
      <BscTypingIndicator
        label="Escribiendo"
        animated={false}
        testID="typing"
      />,
    );
    const indicator = tree.root.findByProps({
      accessibilityRole: 'progressbar',
    });

    expect(indicator.props.testID).toBe('typing');
    expect(indicator.props.accessibilityLabel).toBe('Escribiendo');
    expect(animatedDots(tree)).toHaveLength(3);
  });

  it('pulses the dots when animated and reduced motion is off', async () => {
    const tree = await render(<BscTypingIndicator />);

    expect(animatedDots(tree).every(hasAnimatedOpacity)).toBe(true);
  });

  it('renders static dots when animation is disabled', async () => {
    const tree = await render(<BscTypingIndicator animated={false} />);

    expect(animatedDots(tree).some(hasAnimatedOpacity)).toBe(false);
  });

  it('renders static dots when the system asks for reduced motion', async () => {
    reduceMotion.mockResolvedValue(true);
    const tree = await render(<BscTypingIndicator />);

    expect(animatedDots(tree).some(hasAnimatedOpacity)).toBe(false);
  });

  it('unsubscribes from reduced-motion changes on unmount', async () => {
    const tree = await render(<BscTypingIndicator />);
    mounted.splice(mounted.indexOf(tree), 1);

    TestRenderer.act(() => {
      tree.unmount();
    });

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('starts one looping animation per dot and stops them all on cleanup', () => {
    const start = jest.fn();
    const stop = jest.fn();
    const loop = jest
      .spyOn(Animated, 'loop')
      .mockReturnValue({ start, stop, reset: jest.fn() });

    const cleanup = startTypingIndicatorAnimations([
      new Animated.Value(0),
      new Animated.Value(0),
      new Animated.Value(0),
    ]);

    expect(loop).toHaveBeenCalledTimes(3);
    expect(start).toHaveBeenCalledTimes(3);

    cleanup();

    expect(stop).toHaveBeenCalledTimes(3);
  });
});
