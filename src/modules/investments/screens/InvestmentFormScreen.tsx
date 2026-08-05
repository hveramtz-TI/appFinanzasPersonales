import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { InvestmentForm } from '../components/InvestmentForm';
import { useInvestments } from '../hooks/useInvestments';
import { Investment, CreateInvestment } from '../../../domain/entities/Investment';

export type InvestmentFormRouteParams = {
  InvestmentForm: {
    investment?: Investment;
  };
};

export function InvestmentFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<InvestmentFormRouteParams, 'InvestmentForm'>>();
  const { addInvestment } = useInvestments();
  const investment = route.params?.investment;

  const handleSubmit = async (data: CreateInvestment) => {
    const investment = await addInvestment(data);
    navigation.goBack();
    return investment;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <InvestmentForm
        investment={investment}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}
