import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, tokens } from '../src';

export function DemoScreen() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Basic components</Text>
        <Card>
          <Text style={styles.text}>Count: {count}</Text>
          <Button label="Increment" onPress={() => setCount(value => value + 1)} />
          <Button label="Reset" variant="secondary" onPress={() => setCount(0)} />
          <Button label="Disabled" disabled onPress={() => setCount(value => value + 1)} />
          <Button label="Loading" loading onPress={() => setCount(value => value + 1)} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.background },
  content: { padding: tokens.spacing.lg, gap: tokens.spacing.md },
  heading: { fontSize: 24, fontWeight: '700', color: tokens.colors.text },
  text: { fontSize: 18, color: tokens.colors.text },
});
