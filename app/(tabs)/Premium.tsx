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

/* Components + Styles */
import { PremiumPlanCard } from '@/components/premium/PremiumPlanCard';
import { premiumStyles as S } from '@/components/style/premium/premiumStyles';

/* Hooks */
import { usePremiumPlans } from '@/hooks/premium/usePremiumPlans';
import { usePremiumPurchase } from '@/hooks/premium/usePremiumPurchase';

export default function PremiumScreen() {
  const { plans, loading: loadingPlans } = usePremiumPlans();
  const { loading: loadingPurchase, purchasePremium } = usePremiumPurchase();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleUpgrade = () => {
    if (loadingPurchase || !selectedPlanId) return;

    const plan = plans.find((p) => p.id === selectedPlanId);
    const planLabel = plan?.label ?? 'gói này';

    Alert.alert(
      'Xác nhận mua Premium',
      `Bạn có muốn nâng cấp gói ${planLabel}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => purchasePremium(selectedPlanId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={S.container}>
      {/* HEADER */}
      <View style={S.headerWrapper}>
        <Text style={S.headerTitle}>Premium</Text>
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
          <Ionicons name="sparkles-outline" style={S.heroIcon} color="#FFF" />
          <Text style={S.heroTitle}>Trở thành thành viên Premium</Text>
          <Text style={S.heroText}>
            Không quảng cáo, mở khóa tất cả bài học, tăng tốc hành trình tiếng Anh của bạn.
          </Text>
        </LinearGradient>

        {/* BENEFITS */}
        <Text style={S.sectionTitle}>Quyền lợi khi nâng cấp</Text>
        {[
          "Không quảng cáo",
          "Mở khóa toàn bộ bài học",
          "Học offline",
          "Theo dõi tiến độ nâng cao",
          "Nội dung độc quyền"
        ].map((item, i) => (
          <View key={i} style={S.benefitRow}>
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

          {loadingPlans ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Đang tải gói Premium…
            </Text>
          ) : (
            plans.map((plan) => (
              <PremiumPlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onPress={() => setSelectedPlanId(plan.id)}
              />
            ))
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleUpgrade}
          style={[
            S.ctaButton,
            (loadingPurchase || !selectedPlanId) && { opacity: 0.6 },
          ]}
          disabled={loadingPurchase || !selectedPlanId}
        >
          <Text style={S.ctaText}>
            {loadingPurchase ? 'Đang xử lý…' : 'Nâng cấp ngay'}
          </Text>
          <Text style={S.ctaSubText}>
            Thanh toán an toàn – không ràng buộc, có thể hủy bất kỳ lúc nào.
          </Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <Text style={S.footerText}>
          Bạn đang dùng bản miễn phí. Nâng cấp để trải nghiệm trọn vẹn hơn.
        </Text>
        <Text style={S.restoreText}>Khôi phục giao dịch đã mua</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
