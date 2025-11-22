// components/premium/PremiumPlanCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { premiumStyles as S } from '@/components/style/premium/premiumStyles';
import type { PremiumPlan } from '@/types/Premium/premium';

type Props = {
  plan: PremiumPlan;
  isSelected: boolean;
  onPress: () => void;
};

export function PremiumPlanCard({ plan, isSelected, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        S.planCard,
        isSelected && S.planCardSelected,
      ]}
    >
      <View style={S.planHeaderRow}>
        <Text style={S.planTitle}>{plan.label}</Text>
        {plan.badge ? (
          <View style={S.badgeWrapper}>
            <Text style={S.badgeText}>{plan.badge}</Text>
          </View>
        ) : null}
      </View>

      <Text style={S.planDescription}>{plan.description}</Text>

      <View style={S.planFooterRow}>
        <Text style={S.planPrice}>
          {plan.price.toLocaleString('vi-VN')} {plan.currency}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
        )}
      </View>
    </TouchableOpacity>
  );
}
