import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PremiumPlanCard } from '@/components/premium/PremiumPlanCard';
import { premiumStyles as S } from '@/components/style/premium/premiumStyles';
import { PREMIUM_BENEFITS, PREMIUM_PLANS } from '@/constants/Premium/premium';
import { usePremiumPurchase } from '@/hooks/premium/usePremiumPurchase';
import { PremiumPlanId } from '@/types/Premium/premium';

export default function PremiumScreen() {
  const [selectedPlanId, setSelectedPlanId] = useState<PremiumPlanId>('yearly');
  const { loading, purchasePremium } = usePremiumPurchase();

  const handleUpgrade = () => {
    if (loading) return;

    const plan = PREMIUM_PLANS.find((p) => p.id === selectedPlanId);
    const planLabel = plan?.label ?? 'this plan';

    Alert.alert(
      'Confirm purchase',
      `Do you want to purchase ${planLabel}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            purchasePremium(selectedPlanId);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={S.container}>
      {/* HEADER */}
      <View style={S.headerWrapper}>
        <Text style={S.headerTitle}>Premium Unlock</Text>
        <Text style={S.headerSubtitle}>
          Nâng cấp để học không giới hạn, không quảng cáo và mở khóa toàn bộ nội dung.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <LinearGradient
          colors={['#FACC15', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.heroCard}
        >
          <Ionicons
            name="sparkles-outline"
            style={S.heroIcon}
            color="#FFF"
          />
          <Text style={S.heroTitle}>Trở thành thành viên Premium</Text>
          <Text style={S.heroText}>
            Không quảng cáo, mở khóa tất cả bài học, tăng tốc hành trình tiếng Anh của bạn.
          </Text>
        </LinearGradient>

        {/* BENEFITS */}
        <Text style={S.sectionTitle}>Quyền lợi khi nâng cấp</Text>
        {PREMIUM_BENEFITS.map((item, index) => (
          <View key={index} style={S.benefitRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#16A34A"
              style={S.benefitIcon}
            />
            <Text style={S.benefitText}>{item}</Text>
          </View>
        ))}

        {/* PLANS */}
        <View style={S.plansContainer}>
          <Text style={S.sectionTitle}>Chọn gói Premium</Text>

          {PREMIUM_PLANS.map((plan) => (
            <PremiumPlanCard
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              onPress={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleUpgrade}
          style={[S.ctaButton, loading && { opacity: 0.6 }]}
          disabled={loading}
        >
          <Text style={S.ctaText}>
            {loading ? 'Processing…' : 'Upgrade Now'}
          </Text>
          <Text style={S.ctaSubText}>
            Thanh toán an toàn – không ràng buộc, có thể hủy bất kỳ lúc nào.
          </Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <Text style={S.footerText}>
          Bạn đang sử dụng phiên bản miễn phí. Nâng cấp để trải nghiệm đầy đủ hơn.
        </Text>
        <Text style={S.restoreText}>Khôi phục giao dịch đã mua</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
