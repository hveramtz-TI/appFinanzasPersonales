import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { FinanceScreen } from '../screens/FinanceScreen';

export type FinanceStackParamList = {
  FinanceHome: undefined;
  Income: undefined;
};

export type NativeStackNavigationProp = StackNavigationProp<
  FinanceStackParamList,
  'FinanceHome'
>;

const Stack = createStackNavigator<FinanceStackParamList>();

function IncomePlaceholderScreen() {
  return (
    <View style={styles.placeholder}>
      {/* IncomeScreen se implementará en Slice 3 */}
    </View>
  );
}

export function FinanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceHome" component={FinanceScreen} />
      <Stack.Screen
        name="Income"
        component={IncomePlaceholderScreen}
        options={{ title: 'Evolución de Ingresos', headerShown: true }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
  },
});
