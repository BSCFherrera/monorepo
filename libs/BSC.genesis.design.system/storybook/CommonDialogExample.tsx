import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { BscPrimaryButton } from '@bsc/ui-native';

export const dialogArgs = { visible: true, onClose: () => {}, title: 'Please review this request', message: 'This demo request needs your attention. Review the available information before continuing.', confirmLabel: 'Continue' };
export function CommonDialogExample({ children }: { children: (visible: boolean, close: () => void) => ReactNode }) {
  const [visible, setVisible] = useState(true);
  return <View style={{ minHeight: 100 }}><BscPrimaryButton label="Open example" onPress={() => setVisible(true)} />{children(visible, () => setVisible(false))}</View>;
}
export const supportMessage = <Text>Review the <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>demo support instructions</Text> or select <Text style={{ fontWeight: '700', color: '#002d80' }}>help resources</Text> to learn about the next step. No external service is connected.</Text>;
