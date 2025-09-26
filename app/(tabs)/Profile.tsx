import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text,
  TouchableOpacity, View,
} from 'react-native';

/* Styles */
import { BRAND, S } from '@/components/style/tab/ProfileStyles';

/* Hooks */
import { useUserProfile } from '@/hooks/tab/useUserProfile';

/* Constants */
import { DEFAULT_BADGES } from '@/constants/tab/badges';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const {
  userData, loading, refreshing, onRefresh, progressPercent, defaultAvatar,
  } = useUserProfile({
    onError: () => Alert.alert('Lỗi', 'Không tải được dữ liệu hồ sơ.'),
  });

  if (loading) {
    return (
      <View style={[S.wrap, S.center]}>
        <ActivityIndicator size="large" color={BRAND.primary} />
        <Text style={{ marginTop: 12, color: BRAND.sub }}>Đang tải hồ sơ…</Text>
      </View>
    );
  }

  // if (!uid || !userData) {
  //   return (
  //     <View style={[S.wrap, S.center]}>
  //       <Ionicons name="person-circle" size={80} color={BRAND.sub} />
  //       <Text style={S.emptyTitle}>Chưa đăng nhập</Text>
  //       <Text style={S.emptySub}>Hãy đăng nhập để xem hồ sơ học tập của bạn.</Text>
  //     </View>
  //   );
  // }

  return (
    <ScrollView
      style={S.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header gradient */}
      <LinearGradient
        colors={['#8C88FF', '#6C63FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.header}
      >
        <View style={S.headerRow}>
          <Image source={{ uri: userData?.photoURL || defaultAvatar }} style={S.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={S.name} numberOfLines={1}>
              {userData?.displayName || 'Learner'}
            </Text>
            <LevelBadge level={userData?.level || 'A1'} />
          </View>
          <TouchableOpacity onPress={onRefresh} style={S.iconBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={S.progressWrap}>
          <View style={S.progressTop}>
            <Text style={S.progressTitle}>Tiến độ Level {userData?.level || 'A1'}</Text>
            <Text style={S.progressPct}>{progressPercent}%</Text>
          </View>
          <View style={S.progressBar}>
            <View style={[S.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={S.progressSub}>
            {userData?.progress?.lessonsDone ?? 0}/{userData?.progress?.lessonsTotal ?? '—'} bài
          </Text>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={S.section}>
        <View style={S.statsRow}>
          <StatChip icon="star"   color={BRAND.success} label="Stars"  value={userData?.stars  ?? 0} />
          <StatChip icon="flame"  color="#FF8A00"       label="Streak" value={userData?.streak ?? 0} />
          {/* <StatChip icon="heart"  color={BRAND.heart}   label="Hearts" value={userData.hearts ?? 10} /> */}
          <StatChip icon="trophy" color="#F5B800"       label="Badges" value={userData?.badges?.length ?? 0} />
        </View>
      </View>

      {/* Premium banner */}
      <View style={S.section}>
        <View style={S.card}>
          {userData?.premium ? (
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
              <MaterialCommunityIcons name="crown-outline" size={24} color={BRAND.primary} />
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
          <TouchableOpacity><Text style={S.link}>Xem tất cả</Text></TouchableOpacity>
        </View>

        <View style={S.badgeGrid}>
          {(userData?.badges?.length ? userData.badges : DEFAULT_BADGES).slice(0, 8).map((b, i) => {
            const unlocked = !!userData?.badges?.find((x) => x.id === b.id);
            return (
              <View key={b.id + i} style={S.badgeItem}>
                <View style={[S.badgeIconWrap, !unlocked && { opacity: 0.35 }]}>
                  <MaterialCommunityIcons
                    name={(b.icon as any) || 'medal-outline'}
                    size={28}
                    color={BRAND.primary}
                  />
                </View>
                <Text style={S.badgeName} numberOfLines={1}>{b.name}</Text>
                {!unlocked && <Text style={S.lockText}>Chưa mở</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* Account & Settings (không có Đăng xuất vì ở tab More) */}
      <View style={[S.section, { marginBottom: 28 }]}>
        <View style={S.cardList}>
          <ListItem icon="pencil"          title="Chỉnh sửa hồ sơ"           onPress={() => router.push('/(tabs)/Profile/EditProfile')} />
          <ListItem icon="notifications"   title="Thông báo"                  onPress={() => Alert.alert('Info', 'TODO: Notifications')} />
          <ListItem icon="lock-closed"     title="Bảo mật & Mật khẩu"         onPress={() => Alert.alert('Info', 'TODO: Security')} />
          <ListItem icon="document-text"   title="Điều khoản & Chính sách"    onPress={() => Alert.alert('Info', 'TODO: Terms')} />
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- UI Partials ---------- */
function LevelBadge({ level }: { level: NonNullable<import('@/hooks/tab/useUserProfile').UserDoc['level']> }) {
  return (
    <View style={S.levelBadge}>
      <Ionicons name="book" size={14} color={BRAND.primary} />
      <Text style={S.levelText}>CEFR {level}</Text>
    </View>
  );
}

function StatChip({
  icon, label, value, color,
}: { icon: any; label: string; value: number; color: string }) {
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
  icon, title, onPress, danger,
}: { icon: any; title: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={S.listItem}>
      <View style={[S.listIconWrap, danger && { backgroundColor: '#FFE6E9' }]}>
        <Ionicons name={icon} size={18} color={danger ? BRAND.heart : BRAND.primary} />
      </View>
      <Text style={[S.listTitle, danger && { color: BRAND.heart }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={BRAND.sub} />
    </TouchableOpacity>
  );
}
