import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { InvestmentFormScreen } from '../screens/InvestmentFormScreen';
import { Investment } from '../../../domain/entities/Investment';

export type InvestmentsStackParamList = {
  InvestmentsHome: undefined;
  InvestmentForm: { investment?: Investment } | undefined;
};

export type InvestmentsStackNavigationProp = StackNavigationProp<
  InvestmentsStackParamList,
  'InvestmentsHome'
>;

const Stack = createStackNavigator<InvestmentsStackParamList>();

export function InvestmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvestmentsHome" component={InvestmentsScreen} />
      <Stack.Screen
        name="InvestmentForm"
        component={InvestmentFormScreen}
        options={{ title: 'Nueva Inversión', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
