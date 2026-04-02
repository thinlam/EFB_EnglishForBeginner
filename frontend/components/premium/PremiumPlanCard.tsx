import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { PremiumPlan } from '@/types/Premium/premium';

type Props = {
  plan: PremiumPlan;
  isSelected: boolean;
  onPress: () => void;
};

export function PremiumPlanCard({ plan, isSelected, onPress }: Props) {
 const hasSale = (plan.sale ?? 0) > 0;
const finalPrice = hasSale
  ? plan.price - (plan.price * (plan.sale ?? 0)) / 100
  : plan.price;


  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 18,
        marginBottom: 18,

        borderWidth: isSelected ? 2.2 : 1,
        borderColor: isSelected ? '#4F46E5' : '#E5E7EB',

        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
      }}
    >
      {/* HEADER + BADGE */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
          {plan.label}
        </Text>

        {plan.badge && (
          <View
            style={{
              backgroundColor: '#E3EBFF',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#3B4AFF', fontWeight: '600', fontSize: 12 }}>
              {plan.badge}
            </Text>
          </View>
        )}
      </View>

      {/* DESCRIPTION */}
      {plan.description && (
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 8,
          }}
        >
          {plan.description}
        </Text>
      )}

      {/* PRICE SECTION */}
      <View style={{ marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: hasSale ? '#10B981' : '#111827',
          }}
        >
          {finalPrice.toLocaleString('vi-VN')} {plan.currency}
        </Text>

        {/* Original price */}
        {hasSale && (
          <Text
            style={{
              fontSize: 16,
              marginLeft: 10,
              color: '#9CA3AF',
              textDecorationLine: 'line-through',
            }}
          >
            {plan.price.toLocaleString('vi-VN')} {plan.currency}
          </Text>
        )}
      </View>

      {/* SALE & DURATION */}
      {hasSale && (
        <Text style={{ color: '#EF4444', fontWeight: '600', marginBottom: 2 }}>
          Giảm giá: {plan.sale}%
        </Text>
      )}

      <Text style={{ color: '#6B7280', marginBottom: 4 }}>
        Thời hạn: {plan.duration ? `${plan.duration} ngày` : 'Lifetime'}
      </Text>

      {/* SELECT CHECKMARK */}
      {isSelected && (
        <View
          style={{
            position: 'absolute',
            right: 14,
            top: 14,
            backgroundColor: '#4F46E5',
            padding: 5,
            borderRadius: 20,
          }}
        >
          <Ionicons name="checkmark" size={18} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}
