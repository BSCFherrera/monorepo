import { TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer from 'react-test-renderer';

import { BscOtpVerificationField } from '../components/BscOtpVerificationField';

function render(element: React.JSX.Element): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}
      >
        {element}
      </SafeAreaProvider>,
    );
  });
  return tree;
}

describe('BscOtpVerificationField', () => {
  it('keeps the send step host-controlled', () => {
    const onSend = jest.fn();
    const tree = render(
      <BscOtpVerificationField
        value=""
        onChange={() => {}}
        options={[{ label: 'Demo', value: 0 }]}
        selectedValue={0}
        onSend={onSend}
      />,
    );

    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Send code' }).props.onPress();
    });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  });

  it('emits completion once through the compatibility callbacks', () => {
    const onChange = jest.fn();
    const onVerify = jest.fn();
    const onOtpComplete = jest.fn();
    const tree = render(
      <BscOtpVerificationField
        codeSent
        value=""
        onChange={onChange}
        onVerify={onVerify}
        onOtpComplete={onOtpComplete}
        onResend={() => {}}
        options={[{ label: 'Demo', value: 0 }]}
        selectedValue={0}
      />,
    );

    TestRenderer.act(() => {
      tree.root.findByType(TextInput).props.onChangeText('12 a34-567');
    });

    expect(onChange).toHaveBeenCalledWith('123456');
    expect(onVerify).toHaveBeenCalledWith('123456');
    expect(onOtpComplete).toHaveBeenCalledWith('123456');
  });

  it('hides resend during the timed state and disables input once verified', () => {
    const tree = render(
      <BscOtpVerificationField
        codeSent
        value="123456"
        onChange={() => {}}
        onResend={() => {}}
        options={[{ label: 'Demo', value: 0 }]}
        selectedValue={0}
        timer={{ finished: false, label: '00:30' }}
      />,
    );

    expect(tree.root.findByProps({ children: '00:30' })).toBeTruthy();
    expect(tree.root.findAllByProps({ accessibilityLabel: 'Resend code' })).toHaveLength(0);

    TestRenderer.act(() => {
      tree.update(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 0, right: 0, bottom: 0, left: 0 },
          }}
        >
          <BscOtpVerificationField
            codeSent
            verified
            value="123456"
            onChange={() => {}}
            onResend={() => {}}
            options={[{ label: 'Demo', value: 0 }]}
            selectedValue={0}
          />
        </SafeAreaProvider>,
      );
    });

    expect(tree.root.findByType(TextInput).props.editable).toBe(false);
  });
});
