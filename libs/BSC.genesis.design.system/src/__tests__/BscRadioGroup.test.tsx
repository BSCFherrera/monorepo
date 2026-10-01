import TestRenderer from 'react-test-renderer';

import { BscRadioGroup } from '../components/BscRadioGroup';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

const options = [
  { label: 'Cédula', value: 'cedula' },
  { label: 'Pasaporte', value: 'pasaporte' },
] as const;

describe('BscRadioGroup', () => {
  it('renders a labelled radiogroup with selected option semantics', () => {
    const tree = render(
      <BscRadioGroup
        label="Tipo de documento"
        options={options}
        value="cedula"
        onChange={jest.fn()}
        testID="document-type"
      />,
    );

    expect(tree.root.findByProps({ children: 'Tipo de documento' })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityRole: 'radiogroup' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'document-type-cedula' }).props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    });
    expect(tree.root.findByProps({ testID: 'document-type-pasaporte' }).props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
  });

  it('calls onChange with the selected option value', () => {
    const onChange = jest.fn();
    const tree = render(
      <BscRadioGroup
        options={options}
        value="cedula"
        onChange={onChange}
        testID="document-type"
      />,
    );

    TestRenderer.act(() => {
      tree.root.findByProps({ testID: 'document-type-pasaporte' }).props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith('pasaporte');
  });

  it('ignores disabled options', () => {
    const onChange = jest.fn();
    const tree = render(
      <BscRadioGroup
        options={[options[0], { ...options[1], disabled: true }]}
        value="cedula"
        onChange={onChange}
        testID="document-type"
      />,
    );

    expect(tree.root.findByProps({ testID: 'document-type-pasaporte' }).props.onPress).toBeUndefined();
    expect(tree.root.findByProps({ testID: 'document-type-pasaporte' }).props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
  });
});
