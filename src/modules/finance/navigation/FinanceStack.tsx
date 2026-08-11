import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { FinanceScreen } from '../screens/FinanceScreen';

export type FinanceStackParamList = {
  FinanceHome: undefined;
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
    </Stack.Navigator>
  );
}
