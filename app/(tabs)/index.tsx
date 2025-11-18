// app/(tabs)/HomeScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* Firebase (fallback lấy auth.photoURL) */
import { auth } from '@/scripts/firebase';

/* Hooks */
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';

/* Constants */
import { DATA, Item } from '@/constants/tab/cards';

/* Styles */
import { styles } from '@/components/style/tab/HomeScreenStyles';

/* CEFR Pill có nước lượn sóng */
import { CefrPill } from '@/components/CefrPill';

const FILTER_CARDS_BY_LEVEL = true;

/** Thứ tự CEFR và số XP cần để lên mỗi level */
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const XP_PER_LEVEL = 100;

/** Tính level + progress từ tổng XP */
function getCefrFromXp(totalXp: number) {
  if (!Number.isFinite(totalXp) || totalXp < 0) {
    totalXp = 0;
  }

  const maxIndex = CEFR_ORDER.length - 1;

  // mỗi level 100 XP: 0–99 → A1, 100–199 → A2, ...
  const idx = Math.min(Math.floor(totalXp / XP_PER_LEVEL), maxIndex);
  const level = CEFR_ORDER[idx];

  const xpInThisLevel = totalXp - idx * XP_PER_LEVEL;
  const progress = Math.min(xpInThisLevel / XP_PER_LEVEL, 1);
  return { level, progress };
}

export default function HomeScreen() {
  const profile = useAuthProfile();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const greetingName = profile.greetingName;
  const isPremium = (profile as any).isPremium ?? false;

  // Lấy ce fr XP (tổng điểm) từ profile
  // TODO: sau này em lưu thật trong Firestore là ok
  const totalXp: number = (profile as any).cefrXp ?? 40;

  const { level, progress: levelProgress } = useMemo(
    () => getCefrFromXp(totalXp),
    [totalXp],
  );

  // Avatar URL
  const hookPhotoURL: string | null = (profile as any).photoURL ?? null;
  const authPhotoURL: string | null = auth.currentUser?.photoURL ?? null;
  const photoURL: string | null = hookPhotoURL || authPhotoURL || null;

  // Ký tự đầu khi không có avatar
  const initial = useMemo(() => {
    const raw = (greetingName || '').trim();
    if (!raw) return 'U';
    return raw[0]!.toUpperCase();
  }, [greetingName]);

  // Lọc card theo level (dùng level đã tính từ XP)
  const filteredData = useMemo(() => {
    if (!FILTER_CARDS_BY_LEVEL) return DATA;
    return DATA.filter((it) => {
      const lv = it.levels || [];
      return (
        lv.includes('All') ||
        lv.includes('Tool') ||
        lv.includes('Ranking') ||
        lv.includes(level)
      );
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

  const handlePress = (item: Item) => {
    if (item.id === '6' || item.title === 'Dịch') {
      router.push('/translate');
      return;
    }
    if (item.id === '1' || item.title === 'Listening') {
      router.push('/listen');
      return;
    }
    if (item.id === '8' || item.title === 'Play Game') {
      router.push('/(tabs)/playgame');
      return;
    }
    // các card khác: define route sau
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.card}
      onPress={() => handlePress(item)}
    >
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
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : (
            <Text style={styles.topics}>{item.topics} Topics</Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {/* Level chip */}
        {renderLevels(item.levels)}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAvatar = () => {
    if (photoURL) {
      if (isPremium) {
        return (
          <LinearGradient
            colors={['#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarPremiumRing}
          >
            <Image
              source={{ uri: photoURL }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </LinearGradient>
        );
      }

      return (
        <Image
          source={{ uri: photoURL }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }

    if (isPremium) {
      return (
        <LinearGradient
          colors={['#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarPremiumRing}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { paddingTop: insets.top }]}
      edges={['top', 'left', 'right']}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {/* PREMIUM badge */}
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

          {/* Avatar + text chào */}
          <View style={styles.headerRow}>
            {renderAvatar()}

            <View style={styles.headerTextBlock}>
              <Text style={styles.hello}>
                {isPremium ? 'Super, ' : 'Xin chào, '}
                <Text style={styles.helloBold}>{greetingName}</Text>
              </Text>

              <Text style={styles.subHello}>
                Học đều mỗi ngày để lên trình nhé!
              </Text>
            </View>
          </View>
        </View>

        {/* CEFR Pill có nước lượn sóng, dùng level & progress từ XP */}
        <CefrPill level={level} progress={levelProgress} />
      </View>

      {/* LIST CARD */}
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
        {...(Platform.OS === 'ios'
          ? { contentInsetAdjustmentBehavior: 'automatic' as const }
          : {})}
      />
    </SafeAreaView>
  );
}
