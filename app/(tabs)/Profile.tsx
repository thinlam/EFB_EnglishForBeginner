// app/(tabs)/profile.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/* Firebase */
import { auth, db } from '@/scripts/firebase';
import { doc, getDoc } from 'firebase/firestore';

/* ---- Types ---- */
type UserDoc = {
  displayName?: string;
  photoURL?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  stars?: number;
  streak?: number;
  hearts?: number;
  badges?: { id: string; icon?: string; name: string }[];
  premium?: boolean;
  premiumEnd?: string; // ISO date string
  progress?: {
    percent?: number; // 0..100
    lessonsDone?: number;
    lessonsTotal?: number;
  };
};

const BRAND = {
  primary: '#6C63FF', // tím EFB
  success: '#77B66E',
  heart: '#FF5D73',
  bg: '#F6F7FB',
  text: '#0B1220',
  sub: '#6B7280',
  card: '#FFFFFF',
  border: '#E5E7EB',
};

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lắng nghe auth state để không bị "Chưa đăng nhập" giả
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setUid(null);
          setUserData(null);
          return;
        }
        setUid(user.uid);
        const snap = await getDoc(doc(db, 'users', user.uid));
        setUserData(snap.exists() ? (snap.data() as UserDoc) : null);
      } catch (e) {
        console.warn(e);
        Alert.alert('Lỗi', 'Không tải được dữ liệu hồ sơ.');
        setUserData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    });
    return unsub;
  }, []);

  const onRefresh = async () => {
    if (!uid) return;
    try {
      setRefreshing(true);
      const snap = await getDoc(doc(db, 'users', uid));
      setUserData(snap.exists() ? (snap.data() as UserDoc) : null);
    } catch (e) {
      console.warn(e);
      Alert.alert('Lỗi', 'Không thể làm mới dữ liệu.');
    } finally {
      setRefreshing(false);
    }
  };

  const progressPercent = useMemo(() => {
    const p =
      userData?.progress?.percent ?? percentFromLessons(userData?.progress);
    return Math.max(0, Math.min(100, Math.round(p || 0)));
  }, [userData]);

  if (loading) {
    return (
      <View style={[S.wrap, S.center]}>
        <ActivityIndicator size="large" color={BRAND.primary} />
        <Text style={{ marginTop: 12, color: BRAND.sub }}>Đang tải hồ sơ…</Text>
      </View>
    );
  }

  if (!uid || !userData) {
    return (
      <View style={[S.wrap, S.center]}>
        <Ionicons name="person-circle" size={80} color={BRAND.sub} />
        <Text style={S.emptyTitle}>Chưa đăng nhập</Text>
        <Text style={S.emptySub}>Hãy đăng nhập để xem hồ sơ học tập của bạn.</Text>
      </View>
    );
  }

  // Avatar mặc định: Dicebear fun-emoji PNG (RN không render SVG từ URL)
  const seed = `monkey-${uid.slice(0, 6)}`;
  const defaultAvatar = `https://api.dicebear.com/7.x/fun-emoji/png?seed=${seed}&radius=50`;

  return (
    <ScrollView
      style={S.wrap}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header gradient */}
      <LinearGradient
        colors={['#8C88FF', '#6C63FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.header}
      >
        <View style={S.headerRow}>
          <Image
            source={{ uri: userData.photoURL || defaultAvatar }}
            style={S.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={S.name} numberOfLines={1}>
              {userData.displayName || 'Learner'}
            </Text>
            <LevelBadge level={userData.level || 'A1'} />
          </View>
          <TouchableOpacity onPress={onRefresh} style={S.iconBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={S.progressWrap}>
          <View style={S.progressTop}>
            <Text style={S.progressTitle}>
              Tiến độ Level {userData.level || 'A1'}
            </Text>
            <Text style={S.progressPct}>{progressPercent}%</Text>
          </View>
          <View style={S.progressBar}>
            <View style={[S.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={S.progressSub}>
            {userData.progress?.lessonsDone ?? 0}/
            {userData.progress?.lessonsTotal ?? '—'} bài
          </Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={S.section}>
        <View style={S.statsRow}>
          <StatChip
            icon="star"
            color={BRAND.success}
            label="Stars"
            value={userData.stars ?? 0}
          />
          <StatChip
            icon="flame"
            color="#FF8A00"
            label="Streak"
            value={userData.streak ?? 0}
          />
          <StatChip
            icon="heart"
            color={BRAND.heart}
            label="Hearts"
            value={userData.hearts ?? 10}
          />
          <StatChip
            icon="trophy"
            color="#F5B800"
            label="Badges"
            value={userData.badges?.length ?? 0}
          />
        </View>
      </View>

      {/* Premium banner */}
      <View style={S.section}>
        <View style={S.card}>
          {userData.premium ? (
            <View style={S.premiumRow}>
              <MaterialCommunityIcons name="crown" size={24} color={BRAND.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={S.cardTitle}>Bạn đang là Premium</Text>
                <Text style={S.cardSub}>Hết hạn: {userData.premiumEnd || '—'}</Text>
              </View>
              <TouchableOpacity style={[S.btn, { backgroundColor: BRAND.primary }]}>
                <Text style={S.btnText}>Gia hạn</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={S.premiumRow}>
              <MaterialCommunityIcons
                name="crown-outline"
                size={24}
                color={BRAND.primary}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={S.cardTitle}>Nâng cấp Premium</Text>
                <Text style={S.cardSub}>Mở kho bài luyện + không giới hạn trái tim</Text>
              </View>
              <TouchableOpacity style={[S.btn, { backgroundColor: BRAND.primary }]}>
                <Text style={S.btnText}>Nâng cấp</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Badges grid */}
      <View style={S.section}>
        <View style={S.rowBetween}>
          <Text style={S.sectionTitle}>Huy hiệu</Text>
          <TouchableOpacity>
            <Text style={S.link}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={S.badgeGrid}>
          {(userData.badges?.length ? userData.badges : DEFAULT_BADGES)
            .slice(0, 8)
            .map((b, i) => {
              const unlocked = !!userData.badges?.find((x) => x.id === b.id);
              return (
                <View key={b.id + i} style={S.badgeItem}>
                  <View style={[S.badgeIconWrap, !unlocked && { opacity: 0.35 }]}>
                    <MaterialCommunityIcons
                      name={(b.icon as any) || 'medal-outline'}
                      size={28}
                      color={BRAND.primary}
                    />
                  </View>
                  <Text style={S.badgeName} numberOfLines={1}>
                    {b.name}
                  </Text>
                  {!unlocked && <Text style={S.lockText}>Chưa mở</Text>}
                </View>
              );
            })}
        </View>
      </View>

      {/* Account & Settings (không có Đăng xuất vì ở tab More) */}
      <View style={[S.section, { marginBottom: 28 }]}>
        <View style={S.cardList}>
          <ListItem
            icon="pencil"
            title="Chỉnh sửa hồ sơ"
            onPress={() => Alert.alert('Info', 'TODO: Edit profile')}
          />
          <ListItem
            icon="notifications"
            title="Thông báo"
            onPress={() => Alert.alert('Info', 'TODO: Notifications')}
          />
          <ListItem
            icon="lock-closed"
            title="Bảo mật & Mật khẩu"
            onPress={() => Alert.alert('Info', 'TODO: Security')}
          />
          <ListItem
            icon="document-text"
            title="Điều khoản & Chính sách"
            onPress={() => Alert.alert('Info', 'TODO: Terms')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- Components ---------- */
function LevelBadge({ level }: { level: NonNullable<UserDoc['level']> }) {
  return (
    <View style={S.levelBadge}>
      <Ionicons name="book" size={14} color={BRAND.primary} />
      <Text style={S.levelText}>CEFR {level}</Text>
    </View>
  );
}

function StatChip({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={S.statChip}>
      <View style={[S.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={S.statVal}>{value}</Text>
      <Text style={S.statLabel}>{label}</Text>
    </View>
  );
}

function ListItem({
  icon,
  title,
  onPress,
  danger,
}: {
  icon: any;
  title: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={S.listItem}>
      <View style={[S.listIconWrap, danger && { backgroundColor: '#FFE6E9' }]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? BRAND.heart : BRAND.primary}
        />
      </View>
      <Text style={[S.listTitle, danger && { color: BRAND.heart }]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={BRAND.sub} />
    </TouchableOpacity>
  );
}

/* ---------- Helpers & Mock ---------- */
function percentFromLessons(p?: {
  lessonsDone?: number;
  lessonsTotal?: number;
}) {
  if (!p?.lessonsDone || !p?.lessonsTotal) return 0;
  return (p.lessonsDone / Math.max(1, p.lessonsTotal)) * 100;
}

const DEFAULT_BADGES = [
  { id: 'streak-3', name: 'Streak 3 ngày', icon: 'fire' },
  { id: 'streak-7', name: 'Streak 7 ngày', icon: 'fire' },
  { id: 'quiz-10', name: 'Hoàn thành 10 bài', icon: 'medal-outline' },
  { id: 'fast-1', name: 'Phản xạ nhanh', icon: 'lightning-bolt-outline' },
  { id: 'listen-a1', name: 'Listening A1', icon: 'headphones' },
  { id: 'speak-a1', name: 'Speaking A1', icon: 'microphone' },
  { id: 'vocab-100', name: '100 từ vựng', icon: 'book-outline' },
  { id: 'grammar-a1', name: 'Ngữ pháp A1', icon: 'format-list-bulleted' },
];

/* ---------- Styles ---------- */
const S = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BRAND.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  levelBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  levelText: { color: BRAND.primary, fontWeight: '700', fontSize: 12 },

  progressWrap: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    padding: 12,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: { color: '#fff', fontWeight: '700' },
  progressPct: { color: '#fff', fontWeight: '800' },
  progressBar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF' },
  progressSub: { color: '#EEF', fontSize: 12, marginTop: 6 },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  link: { color: BRAND.primary, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    backgroundColor: BRAND.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BRAND.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statVal: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  statLabel: { fontSize: 12, color: BRAND.sub, marginTop: 2 },

  card: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BRAND.border,
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  cardSub: { fontSize: 12, color: BRAND.sub, marginTop: 2 },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  btnText: { color: '#fff', fontWeight: '800' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  badgeItem: { width: '22.5%', alignItems: 'center' },
  badgeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BRAND.border,
  },
  badgeName: { fontSize: 11, marginTop: 6, color: BRAND.text, fontWeight: '600' },
  lockText: { fontSize: 10, color: BRAND.sub },

  cardList: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderColor: BRAND.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BRAND.border,
  },
  listIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF0FF',
    marginRight: 10,
  },
  listTitle: { flex: 1, color: BRAND.text, fontWeight: '600' },

  emptyTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text, marginTop: 12 },
  emptySub: { color: BRAND.sub, marginTop: 6 },
});
