import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { FinanceScreen } from '../screens/FinanceScreen';
import { IncomeScreen } from '../screens/IncomeScreen';
import { MonthlyChargesScreen } from '../screens/MonthlyChargesScreen';

export type FinanceStackParamList = {
  FinanceHome: undefined;
  Income: undefined;
  MonthlyCharges: undefined;
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
      <Stack.Screen
        name="MonthlyCharges"
        component={MonthlyChargesScreen}
        options={{ title: 'Mensualidades', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
