import { TextInput } from 'react-native';
import TestRenderer from 'react-test-renderer';

import { BscOtpCodeField } from '../components/BscOtpCodeField';
import { BscColors } from '../theme/colors';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('BscOtpCodeField', () => {
  it('emits code changes and validates the completed OTP', () => {
    const changeOtp = jest.fn();
    const validate = jest.fn();
    const tree = render(<BscOtpCodeField otp="" changeOtp={changeOtp} validate={validate} />);

    TestRenderer.act(() => {
      tree.root.findByType(TextInput).props.onChangeText('12 a34-567');
    });

    expect(changeOtp).toHaveBeenCalledWith('123456');
    expect(validate).toHaveBeenCalledWith('123456');
  });

  it('shows typed digits before the code is verified', () => {
    const tree = render(<BscOtpCodeField otp="123" changeOtp={() => {}} />);

    expect(tree.root.findByProps({ children: '1' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '2' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '3' })).toBeTruthy();
    expect(tree.root.findAllByProps({ children: '•' })).toHaveLength(0);
  });

  it('shows the countdown and disables resend while the timer is running', () => {
    const resend = jest.fn();
    const tree = render(
      <BscOtpCodeField
        otp=""
        changeOtp={() => {}}
        resend={resend}
        timer={{ finished: false, label: '0:59' }}
      />,
    );

    expect(tree.root.findByProps({ children: 'Podrás reenviar el código en' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '0:59' })).toBeTruthy();

    const resendButton = tree.root.findByProps({ accessibilityLabel: 'Reenviar código' });
    expect(resendButton.props.accessibilityState.disabled).toBe(true);
    expect(resendButton.props.onPress).toBeUndefined();
  });

  it('enables resend when the timer finishes', () => {
    const resend = jest.fn();
    const tree = render(
      <BscOtpCodeField
        otp=""
        changeOtp={() => {}}
        resend={resend}
        timer={{ finished: true, label: '0:00' }}
      />,
    );

    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Reenviar código' }).props.onPress();
    });

    expect(resend).toHaveBeenCalledTimes(1);
  });

  it('disables the OTP input and applies the verified border when the code is verified', () => {
    const tree = render(<BscOtpCodeField otp="123456" changeOtp={() => {}} isVerified />);

    expect(tree.root.findByType(TextInput).props.editable).toBe(false);
    expect(tree.root.findByProps({ children: '-' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '1' }).parent?.props.style).toContainEqual({
      backgroundColor: BscColors.surface,
      borderColor: BscColors.primaryLight,
    });
    expect(tree.root.findAllByProps({ accessibilityLabel: 'Reenviar código' })).toHaveLength(0);
  });
});
