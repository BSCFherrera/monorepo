import TestRenderer from 'react-test-renderer';

import {
  BscSelectableListGroup,
  type BscSelectableListGroupOption,
} from '../components/BscSelectableListGroup';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

const options = [
  {
    value: 'email',
    icon: 'mail',
    title: 'Correo electrónico',
    subtitle: 'C*******z@correo.com',
  },
  {
    value: 'sms',
    icon: 'smartphone',
    title: 'Mensaje de texto (SMS)',
    subtitle: '+52** **** **89',
  },
] as const;

type ChannelType = '' | 'email' | 'sms';

const typedOptions: readonly BscSelectableListGroupOption<ChannelType>[] =
  options;

describe('BscSelectableListGroup', () => {
  it('renders a labelled radiogroup with selected option semantics', () => {
    const tree = render(
      <BscSelectableListGroup
        label="Método de verificación"
        options={options}
        value="email"
        onChange={jest.fn()}
        testID="verification-method"
      />,
    );

    expect(
      tree.root.findByProps({ children: 'Método de verificación' }),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({ accessibilityRole: 'radiogroup' }),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({ children: 'Correo electrónico' }),
    ).toBeTruthy();
    expect(tree.root.findByProps({ children: '+52** **** **89' })).toBeTruthy();
    expect(
      tree.root.findByProps({ testID: 'verification-method-email' }).props
        .accessibilityState,
    ).toEqual({
      selected: true,
      disabled: false,
    });
    expect(
      tree.root.findByProps({ testID: 'verification-method-sms' }).props
        .accessibilityState,
    ).toEqual({
      selected: false,
      disabled: false,
    });
  });

  it('calls onChange with the selected option value', () => {
    const onChange = jest.fn();
    const tree = render(
      <BscSelectableListGroup
        options={options}
        value="email"
        onChange={onChange}
        testID="verification-method"
      />,
    );

    TestRenderer.act(() => {
      tree.root
        .findByProps({ testID: 'verification-method-sms' })
        .props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith('sms');
  });

  it('accepts string literal union values', () => {
    const onChange = jest.fn<void, [ChannelType]>();
    const tree = render(
      <BscSelectableListGroup
        options={typedOptions}
        value=""
        onChange={onChange}
        testID="verification-method"
      />,
    );

    TestRenderer.act(() => {
      tree.root
        .findByProps({ testID: 'verification-method-email' })
        .props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith('email');
  });

  it('ignores disabled options', () => {
    const onChange = jest.fn();
    const tree = render(
      <BscSelectableListGroup
        options={[options[0], { ...options[1], disabled: true }]}
        value="email"
        onChange={onChange}
        testID="verification-method"
      />,
    );

    expect(
      tree.root.findByProps({ testID: 'verification-method-sms' }).props
        .onPress,
    ).toBeUndefined();
    expect(
      tree.root.findByProps({ testID: 'verification-method-sms' }).props
        .accessibilityState,
    ).toEqual({
      selected: false,
      disabled: true,
    });
  });
});
