import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { FinanceScreen } from '../screens/FinanceScreen';
import { IncomeScreen } from '../screens/IncomeScreen';

export type FinanceStackParamList = {
  FinanceHome: undefined;
  Income: undefined;
};

export type NativeStackNavigationProp = StackNavigationProp<
  FinanceStackParamList,
  'FinanceHome'
>;

const Stack = createStackNavigator<FinanceStackParamList>();

export function FinanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceHome" component={FinanceScreen} />
      <Stack.Screen
        name="Income"
        component={IncomeScreen}
        options={{ title: 'Evolución de Ingresos', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
