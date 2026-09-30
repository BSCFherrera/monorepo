import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { BscColors, BscPrimaryButton, BscSecondaryButton, BscSpacing } from '@bsc/ui-native';
import { Card } from '../src';

export function DemoScreen() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Basic components</Text>
        <Card>
          <Text testID="demo-count" style={styles.text}>Count: {count}</Text>
          <BscPrimaryButton label="Increment" onPress={() => setCount(value => value + 1)} />
          <BscSecondaryButton label="Reset" onPress={() => setCount(0)} />
          <BscPrimaryButton label="Disabled" disabled onPress={() => setCount(value => value + 1)} />
          <BscPrimaryButton label="Loading" loading onPress={() => setCount(value => value + 1)} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BscColors.background },
  content: { padding: BscSpacing.lg, gap: BscSpacing.md },
  heading: { fontSize: 24, fontWeight: '700', color: BscColors.textPrimary },
  text: { fontSize: 18, color: BscColors.textPrimary },
});
