// components/premium/PremiumPlanCard.tsx
import { PremiumPlan } from '@/types/Premium/premium';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PremiumPlanCardProps {
  plan: PremiumPlan;
  isSelected?: boolean;
  onPress?: () => void;
}

export const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  plan,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        backgroundColor: isSelected ? '#111827' : '#FFFFFF',
        borderWidth: isSelected ? 0 : 1,
        borderColor: '#E5E7EB',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: isSelected ? '#F9FAFB' : '#111827',
            }}
          >
            {plan.title}
          </Text>
          {plan.description ? (
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: isSelected ? '#D1D5DB' : '#6B7280',
              }}
            >
              {plan.description}
            </Text>
          ) : null}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: isSelected ? '#FBBF24' : '#111827',
            }}
          >
            {plan.priceLabel}
          </Text>

          {plan.badge ? (
            <View
              style={{
                marginTop: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: isSelected ? '#FBBF24' : '#FEF3C7',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isSelected ? '#111827' : '#92400E',
                }}
              >
                {plan.badge}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
