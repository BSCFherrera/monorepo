import { StyleSheet, View } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { BscSteps } from '../components/BscSteps';
import { BscColors } from '../theme/colors';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

function stepColors(tree: TestRenderer.ReactTestRenderer): unknown[] {
  const container = tree.root.findByProps({ accessibilityRole: 'progressbar' });
  return container
    .findAllByType(View)
    .filter(node => node !== container)
    .map(node => StyleSheet.flatten(node.props.style).backgroundColor);
}

describe('BscSteps', () => {
  it('exposes progress semantics and renders one segment per label', () => {
    const tree = render(
      <BscSteps
        labels={['Amount', 'Review', 'Confirm']}
        current={0}
        testID="steps"
      />,
    );

    expect(
      tree.root.findByProps({ accessibilityRole: 'progressbar' }).props.testID,
    ).toBe('steps');
    expect(stepColors(tree)).toHaveLength(3);
  });

  it('marks every step up to and including the current one as active', () => {
    const tree = render(<BscSteps totalSteps={4} current={1} testID="steps" />);

    expect(stepColors(tree)).toEqual([
      BscColors.primary,
      BscColors.primary,
      BscColors.border,
      BscColors.border,
    ]);
  });

  it('lets totalSteps override the label count and renders no segments without either', () => {
    expect(
      stepColors(
        render(
          <BscSteps
            labels={['A', 'B']}
            totalSteps={5}
            current={0}
            testID="steps"
          />,
        ),
      ),
    ).toHaveLength(5);
    expect(
      stepColors(render(<BscSteps current={0} testID="steps" />)),
    ).toHaveLength(0);
  });
});
