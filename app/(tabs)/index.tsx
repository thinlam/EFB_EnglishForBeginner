import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* Hooks */
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';

/* Constants */
import { DATA, Item } from '@/constants/tab/cards';

/* Styles */
import { styles } from '@/components/style/tab/HomeScreenStyles';

const FILTER_CARDS_BY_LEVEL = true;

export default function HomeScreen() {
  const { greetingName, level, isPremium } = useAuthProfile();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  

  const filteredData = useMemo(() => {
    if (!FILTER_CARDS_BY_LEVEL) return DATA;
    return DATA.filter((it) => {
      const lv = it.levels || [];
      return lv.includes('All') || lv.includes('Tool') || lv.includes('Ranking') || lv.includes(level);
    });
  }, [level]);

  const renderLevels = (levels?: string[]) => {
    if (!levels) return null;
    if (levels.includes('All') || levels.includes('Tool') || levels.includes('Ranking')) return null;
    if (!levels.includes(level)) return null;
    return (
      <View style={styles.levelRow}>
        <View style={[styles.levelChip, styles.levelChipActive]}>
          <Text style={[styles.levelText, styles.levelTextActive]}>{level}</Text>
        </View>
      </View>
    );
  };

  // ✅ Nhấn card → mở màn phụ (Stack) /listen hoặc /translate
  const handlePress = (item: Item) => {
    if (item.id === '6' || item.title === 'Dịch') {
      router.push('/translate');
      return;
    }
    if (item.id === '1' || item.title === 'Listening') {
      router.push('/listen');
      return;
    }
    if (item.id === '8' || item.title === 'Play Game'){
      router.push('/(tabs)/playgame');
      return;
    }
    // các card khác: tuỳ bạn push route riêng
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={() => handlePress(item)}>
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={styles.iconBubble}>
            <Ionicons name={item.icon} size={22} color="#fff" />
          </View>
          {item.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
          ) : (
            <Text style={styles.topics}>{item.topics} Topics</Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

        {/* Level chip */}
        {renderLevels(item.levels)}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.screen, { paddingTop: insets.top }]} edges={['top', 'left', 'right']}>
      {/* Greeting */}
      <View style={styles.header}>
  <View style={{ flex: 1 }}>
    {/* PREMIUM badge bảy sắc cầu vồng */}
    {isPremium && (
      <LinearGradient
        colors={['#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumBadge}
      >
        <Text style={styles.premiumBadgeText}>PREMIUM</Text>
      </LinearGradient>
    )}

    {/* Dòng chào */}
    <Text style={styles.hello}>
      {isPremium ? 'Super, ' : 'Xin chào, '}
      <Text style={styles.helloBold}>{greetingName}</Text>
    </Text>

    <Text style={styles.subHello}>
      Học đều mỗi ngày để lên trình nhé!
    </Text>
  </View>

  <View style={styles.headerLevelPill}>
    <Text style={styles.headerLevelLabel}>CEFR</Text>
    <Text style={styles.headerLevelText}>{level}</Text>
  </View>
</View>

      {/* Cards */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: (insets.bottom || 12) + 16,
        }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'ios' ? { contentInsetAdjustmentBehavior: 'automatic' as const } : {})}
      />
    </SafeAreaView>
  );
}
