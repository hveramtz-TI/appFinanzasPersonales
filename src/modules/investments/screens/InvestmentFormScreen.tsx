import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { InvestmentForm } from '../components/InvestmentForm';
import { useInvestments } from '../hooks/useInvestments';
import { Investment, CreateInvestment, UpdateInvestment } from '../../../domain/entities/Investment';
import { InvestmentsStackParamList } from '../navigation/InvestmentsStack';

type InvestmentFormRouteProp = RouteProp<InvestmentsStackParamList, 'InvestmentForm'>;

export function InvestmentFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<InvestmentFormRouteProp>();
  const { addInvestment, updateInvestment } = useInvestments();
  const investment = route.params?.investment;

  const handleSubmit = async (data: CreateInvestment) => {
    if (investment) {
      const updated = await updateInvestment(investment.id, data as UpdateInvestment);
      navigation.goBack();
      return updated;
    }

    const created = await addInvestment(data);
    navigation.goBack();
    return created;
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
