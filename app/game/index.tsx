import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Marker, Path, Polygon, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { levelMapStyles as S } from '@/components/style/caro';
import { CARO_LEVELS } from '@/constants/game/caro-levels';
import { useCaroProgress } from '@/hooks/game/useCaroProgress';

const { width: W } = Dimensions.get('window');
const NODE_R = 48; // kích thước node

export default function CaroLevelMapPro() {
  const router = useRouter();
  const { starsByLevel, isUnlocked } = useCaroProgress();

  // demo 30 level đầu (kéo xuống mượt); muốn đủ 100 thì tăng slice
  const levels = useMemo(() => CARO_LEVELS.slice(0, 30), []);

  // layout zigzag trái-phải
  const V_STEP = 170;
  const LEFT_X = 24 + NODE_R;
  const RIGHT_X = W - 24 - NODE_R;

  const nodes = levels.map((lv, i) => ({
    lv: lv.index,
    x: i % 2 === 0 ? LEFT_X : RIGHT_X,
    y: 80 + i * V_STEP,
  }));

  // path cong qua điểm giữa (nhìn “game” hơn)
  const pathD = nodes.reduce((d, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return d + ` Q ${cx} ${prev.y}, ${p.x} ${p.y}`;
  }, '');

  // animate “vẽ đường”
  const contentH = (nodes.at(-1)?.y ?? 0) + 200;// padding-bottom
  const dashAnim = useRef(new Animated.Value(0)).current; // 0->1
  useEffect(() => {
    Animated.timing(dashAnim, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }, []);
  const dashLen = 16000; // đủ dài để che hết
  const dashOffset = dashAnim.interpolate({ inputRange: [0, 1], outputRange: [dashLen, 0] });// 0->1 thì offset từ full->0

  // tổng tiến độ (bao nhiêu sao đã kiếm)
  const totalStars = Object.values(starsByLevel).reduce<number>((a, b) => a + (b || 0), 0);// 0|1|2|3
  const maxStars = levels.length * 3;
  const progressPct = Math.min(1, totalStars / maxStars);

  return (
    <SafeAreaView style={S.levelContainer}>
      {/* Header Pro với tiến độ */}
      <View style={S.proHeader}>
        <TouchableOpacity onPress={() => router.back()} style={S.proBack}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={S.levelTitle}>Caro — Chọn level</Text>
          <View style={S.progressBarWrap}>
            <View style={[S.progressBarFill, { width: `${progressPct * 100}%` }]} />
          </View>
          <Text style={S.progressText}>{totalStars}/{maxStars} ★</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[S.levelList, { height: contentH }]}
      >
        {/* Lớp SVG: đường đi gradient + mũi tên + animate vẽ đường */}
        <Svg width={W} height={contentH} style={S.svg}>
          <Defs>
            <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#93c5fd" />
              <Stop offset="100%" stopColor="#3b82f6" />
            </SvgGradient>
            <Marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <Polygon points="0,0 10,5 0,10" fill="#3b82f6" />
            </Marker>
          </Defs>

          {/* nét dưới mờ để tạo chiều sâu */}
          <Path d={pathD} stroke="#93c5fd55" strokeWidth={10} fill="none" />

          {/* nét chính có dash animate */}
          <Path
            d={pathD}
            stroke="url(#grad)"
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            markerEnd="url(#arrow)"
            strokeDasharray={dashLen}
            strokeDashoffset={Number(dashOffset as any)}
          />
        </Svg>

        {/* Node “glass” */}
        {nodes.map((n) => {
          const unlocked = isUnlocked(n.lv);
          const stars = starsByLevel[n.lv] ?? 0;

          return (
            <TouchableOpacity
              key={n.lv}
              activeOpacity={unlocked ? 0.85 : 1}
              style={[
                S.proNode,
                { left: n.x - NODE_R, top: n.y - NODE_R },
                !unlocked && S.proNodeLocked,
              ]}
              disabled={!unlocked}
              onPress={() => router.push({ pathname: '/game/play', params: { level: n.lv } })}
            >
              <Text style={S.proLvText}>{`LV${n.lv}`}</Text>
              <View style={S.proStarRow}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < stars ? 'star' : 'star-outline'}
                    size={14}
                    color={i < stars ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
              </View>

              {/* badge khoá */}
              {!unlocked && (
                <View style={S.proLockBadge}>
                  <Ionicons name="lock-closed" size={12} color="#334155" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
