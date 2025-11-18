import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
import { BRAND, S } from '@/components/style/tab/ProfileStyles';

/* Hooks */
import { useUserProfile } from '@/hooks/tab/useUserProfile';

/* Constants */
import { DEFAULT_BADGES } from '@/constants/tab/badges';

/* ---------- Helpers ---------- */

function fmtDate(value: any): string {
  if (!value) return '—';

  const d =
    typeof value?.toDate === 'function'
      ? value.toDate()
      : value instanceof Date
      ? value
      : typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : null;

  if (!d || Number.isNaN(d.getTime())) return '—';

  const dd = `${d.getDate()}`.padStart(2, '0');
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/* ---------- Screen ---------- */

export default function ProfileScreen() {
  const { userData, loading, refreshing, onRefresh, progressPercent } =
    useUserProfile({
      onError: () => Alert.alert('Error', 'Failed to load profile data.'),
    });

  if (loading) {
    return (
      <SafeAreaView style={[S.wrap, S.center]}>
        <ActivityIndicator size="large" color={BRAND.primary} />
        <Text style={{ marginTop: 12, color: BRAND.sub }}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  const u = (userData || {}) as any;

  // ----- NAME / LEVEL -----
  const displayName =
    u.displayName ||
    u.name ||
    u.fullName ||
    u.profile?.name ||
    u.nickname ||
    'Learner';

  const level = u.level || 'A1';

  // ----- PREMIUM STATE -----
  const expiresDate =
    u.premiumExpiresAt ? new Date(u.premiumExpiresAt as string) : null;

  const now = Date.now();
  const hasFutureExpire =
    expiresDate && !Number.isNaN(expiresDate.getTime())
      ? expiresDate.getTime() > now
      : false;

  const isPremium = !!(
    (typeof u.premium === 'boolean' && u.premium) ||
    u.premiumPlanId ||
    hasFutureExpire
  );

  const premiumStartText = fmtDate(u.premiumUpdatedAt);
  const premiumEndText = fmtDate(u.premiumExpiresAt);

  const handlePremiumPress = () => {
    router.push('/Premium');
  };

  return (
    <SafeAreaView style={S.wrap} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={['#8C88FF', '#6C63FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.header}
        >
          <View style={S.headerRow}>
            <ProfileAvatar photoURL={u.photoURL || u.avatarURL} />

            <View style={{ flex: 1 }}>
              <Text style={S.name} numberOfLines={1}>
                {displayName}
              </Text>
              <LevelBadge level={level} />
            </View>

            <TouchableOpacity onPress={onRefresh} style={S.iconBtn}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={S.progressWrap}>
            <View style={S.progressTop}>
              <Text style={S.progressTitle}>Level Progress {level}</Text>
              <Text style={S.progressPct}>{progressPercent}%</Text>
            </View>
            <View style={S.progressBar}>
              <View
                style={[S.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={S.progressSub}>
              {u?.progress?.lessonsDone ?? 0}/{u?.progress?.lessonsTotal ?? '—'} lessons
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
              value={u?.stars ?? 0}
            />
            <StatChip
              icon="flame"
              color="#FF8A00"
              label="Streak"
              value={u?.streak ?? 0}
            />
            <StatChip
              icon="trophy"
              color="#F5B800"
              label="Badges"
              value={u?.badges?.length ?? 0}
            />
          </View>
        </View>

        {/* Premium Banner */}
        <View style={S.section}>
          <TouchableOpacity onPress={handlePremiumPress} activeOpacity={0.9}>
            <View style={S.card}>
              {isPremium ? (
                <View style={S.premiumRow}>
                  <MaterialCommunityIcons
                    name="crown"
                    size={24}
                    color={BRAND.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={S.cardTitle}>You are Premium</Text>
                    <Text style={S.cardSub}>Upgraded: {premiumStartText}</Text>
                    <Text style={S.cardSub}>Expires: {premiumEndText}</Text>
                  </View>
                  <TouchableOpacity
                    style={[S.btn, { backgroundColor: BRAND.primary }]}
                    onPress={handlePremiumPress}
                  >
                    <Text style={S.btnText}>Renew</Text>
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
                    <Text style={S.cardTitle}>Upgrade to Premium</Text>
                    <Text style={S.cardSub}>
                      Unlock all lessons + unlimited hearts
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[S.btn, { backgroundColor: BRAND.primary }]}
                    onPress={handlePremiumPress}
                  >
                    <Text style={S.btnText}>Upgrade</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Badges Grid */}
        <View style={S.section}>
          <View style={S.rowBetween}>
            <Text style={S.sectionTitle}>Badges</Text>
            <TouchableOpacity>
              <Text style={S.link}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={S.badgeGrid}>
            {(u?.badges?.length ? u.badges : DEFAULT_BADGES)
              .slice(0, 8)
              .map((b: any, i: number) => {
                const unlocked = !!u?.badges?.find(
                  (x: any) => x.id === b.id
                );
                return (
                  <View key={b.id + i} style={S.badgeItem}>
                    <View
                      style={[
                        S.badgeIconWrap,
                        !unlocked && { opacity: 0.35 },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={b.icon || 'medal-outline'}
                        size={28}
                        color={BRAND.primary}
                      />
                    </View>
                    <Text style={S.badgeName} numberOfLines={1}>
                      {b.name}
                    </Text>
                    {!unlocked && (
                      <Text style={S.lockText}>Locked</Text>
                    )}
                  </View>
                );
              })}
          </View>
        </View>

        {/* Account & Settings */}
        <View style={[S.section, { marginBottom: 28 }]}>
          <View style={S.cardList}>
            <ListItem
              icon="pencil"
              title="Edit Profile"
              onPress={() => router.push('/(tabs)/Profile/EditProfile')}
            />
            <ListItem
              icon="notifications"
              title="Notifications"
              onPress={() => Alert.alert('Info', 'TODO: Notifications')}
            />
            <ListItem
              icon="lock-closed"
              title="Security & Password"
              onPress={() => Alert.alert('Info', 'TODO: Security')}
            />
            <ListItem
              icon="document-text"
              title="Terms & Privacy"
              onPress={() => Alert.alert('Info', 'TODO: Terms')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- UI Partials ---------- */

function ProfileAvatar({ photoURL }: { photoURL?: string | null }) {
  const hasPhoto = photoURL && photoURL.trim().length > 0;

  if (hasPhoto) {
    return <Image source={{ uri: photoURL! }} style={S.avatar} />;
  }

  return (
    <View
      style={[
        S.avatar,
        {
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Ionicons name="person" size={32} color={BRAND.primary} />
    </View>
  );
}

function LevelBadge({ level }: { level: string }) {
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
