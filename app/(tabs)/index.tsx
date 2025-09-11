/**
 * HomeScreen.tsx — White background + Greeting (name) + Gradient cards
 */
import { auth, db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ColorValue,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;

type GradientColors =
  | readonly [ColorValue, ColorValue]
  | readonly [ColorValue, ColorValue, ColorValue];

type Item = {
  id: string;
  title: string;
  icon: any;
  gradient: GradientColors;
  topics?: number;
  subtitle?: string;
  levels?: string[];
};

const DATA: Item[] = [
  // tươi – xanh ngọc → xanh dương
  { id: '1', title: 'Listening', icon: 'headset',
    gradient: ['#5EEAD4', '#3B82F6'] as const, topics: 20, levels: ['A1','A2','B1','B2','C1','C2'] },
  // tím hồng → chàm
  { id: '2', title: 'Speaking', icon: 'mic',
    gradient: ['#D946EF', '#7C3AED'] as const, topics: 18, levels: ['A1','A2','B1','B2','C1','C2'] },
  // đỏ cam → đỏ đậm (khác rank)
  { id: '3', title: 'Reading', icon: 'book',
    gradient: ['#FB7185', '#DC2626'] as const, topics: 15, levels: ['A1','A2','B1','B2','C1','C2'] },
  // vàng sáng → vàng đất
  { id: '4', title: 'Writing', icon: 'pencil',
    gradient: ['#FDE047', '#F59E0B'] as const, topics: 12, levels: ['A1','A2','B1','B2','C1','C2'] },
  // teal → xanh đậm (không trùng Listening)
  { id: '5', title: 'Workbook', icon: 'document-text-outline',
    gradient: ['#2DD4BF', '#0EA5E9'] as const, subtitle: 'Bài tập tổng hợp', levels: ['All'] },
  // lục → teal (không trùng workbook)
  { id: '6', title: 'Dịch', icon: 'globe',
    gradient: ['#34D399', '#14B8A6'] as const, subtitle: 'Dịch văn bản', levels: ['Tool'] },
  // cam đỏ → đỏ nâu (khác Reading)
  { id: '7', title: 'Bảng xếp hạng', icon: 'trophy',
    gradient: ['#FB923C', '#B91C1C'] as const, subtitle: 'Xếp hạng', levels: ['Ranking'] },
];

const FILTER_CARDS_BY_LEVEL = true;

export default function HomeScreen() {
  const [level, setLevel] = useState<string>('A1');
  const [greetingName, setGreetingName] = useState<string>('bạn');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = auth.currentUser;

      const pickName = (snap?: any, user?: any) => {
        const fromSnap =
          snap?.get?.('name') ||
          snap?.get?.('fullName') ||
          snap?.get?.('display_name') ||
          snap?.get?.('hoten') ||
          snap?.get?.('profile')?.name ||
          snap?.get?.('nickname') ||
          snap?.get?.('username');
        const fromAuth =
          user?.displayName || (user?.email ? String(user.email).split('@')[0] : '');
        return (fromSnap || fromAuth || '').toString().trim();
      };

      try {
        if (u) {
          const snap = await getDoc(doc(db, 'users', u.uid));
          const cefrFromDb = snap.exists() ? snap.get('levelCefr') : undefined;
          if (typeof cefrFromDb === 'string' && cefrFromDb) {
            setLevel(cefrFromDb);
            await AsyncStorage.setItem('efb.level', cefrFromDb);
          } else {
            const localLevel = await AsyncStorage.getItem('efb.level');
            if (localLevel) setLevel(localLevel);
          }

          const resolved = pickName(snap, u);
          if (resolved) {
            setGreetingName(resolved);
            await AsyncStorage.setItem('efb.name', resolved);
          } else {
            const localName = await AsyncStorage.getItem('efb.name');
            if (localName) setGreetingName(localName);
          }
        } else {
          const localName = await AsyncStorage.getItem('efb.name');
          if (localName) setGreetingName(localName);
          const localLevel = await AsyncStorage.getItem('efb.level');
          if (localLevel) setLevel(localLevel);
        }
      } catch {
        const localName = await AsyncStorage.getItem('efb.name');
        if (localName) setGreetingName(localName);
        const localLevel = await AsyncStorage.getItem('efb.level');
        if (localLevel) setLevel(localLevel);
      }
    })();
  }, []);

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

  const handlePress = (item: Item) => {
    if (item.id === '6' || item.title === 'Dịch') {
      router.push('/(tabs)/translate');
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity activeOpacity={0.92} style={styles.card} onPress={() => handlePress(item)}>
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        {/* Top row: icon + topics/subtitle */}
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

        {/* Title đặt cao hơn để các hàng nhìn đều */}
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

        {/* Level chip */}
        {renderLevels(item.levels)}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.screen, { paddingTop: insets.top }]} edges={['top', 'left', 'right']}>
      {/* Greeting Header (bỏ icon vẫy tay) */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Xin chào, <Text style={styles.helloBold}>{greetingName}</Text></Text>
          <Text style={styles.subHello}>Học đều mỗi ngày để lên trình nhé!</Text>
        </View>
        <View style={styles.headerLevelPill}>
          <Text style={styles.headerLevelLabel}>CEFR</Text>
          <Text style={styles.headerLevelText}>{level}</Text>
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{
          padding: 12,
          paddingBottom: (insets.bottom || 12) + 16, // ngắn lại để hàng cuối xích lên
        }}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'ios' ? { contentInsetAdjustmentBehavior: 'automatic' as const } : {})}
      />
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  hello: { color: '#0B1220', fontSize: 18, fontWeight: '500' },
  helloBold: { fontWeight: '800' },
  subHello: { color: '#6B7280', fontSize: 12, marginTop: 2 },

  headerLevelPill: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  headerLevelLabel: { color: '#6B7280', fontSize: 10, fontWeight: '600', marginBottom: 2 },
  headerLevelText: { color: '#111827', fontWeight: '800', fontSize: 16 },

  card: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  gradientBg: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    // để tiêu đề “xích lên” và mọi card đều giống nhau
  },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  title: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 10 },

  topics: { fontSize: 14, color: '#F9FAFB', fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#F9FAFB', fontStyle: 'italic', fontWeight: '500', maxWidth: CARD_WIDTH - 80 },

  levelRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginRight: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  levelChipActive: { backgroundColor: '#fff' },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  levelTextActive: { color: '#0B1220' },
});
