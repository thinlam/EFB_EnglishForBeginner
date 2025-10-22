// app/game/CaroLevelMapPro.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  Marker,
  Path,
  Polygon,
  Stop,
  LinearGradient as SvgGradient,
} from 'react-native-svg';

import { levelMapStyles as S } from '@/components/style/caro';
import { CARO_LEVELS } from '@/constants/game/caro-levels';
import { useCaroProgress } from '@/hooks/game/useCaroProgress';

const { width: W, height: H } = Dimensions.get('window');
const NODE_R = 48;
const V_STEP = 170;
const LEFT_X = 24 + NODE_R;
const RIGHT_X = W - 24 - NODE_R;

/** Helper: level chơi tiếp theo (first locked - 1 + 1 = first unlocked cuối cùng) */
function getNextPlayableLevel(
  levels: { index: number }[],
  isUnlocked: (lv: number) => boolean
) {
  let candidate = levels[0]?.index ?? 1;
  for (const lv of levels) {
    if (isUnlocked(lv.index)) candidate = lv.index;
    else break;
  }
  return candidate;
}

/** Helper build path từ danh sách nodes */
function buildPathD(nodesArr: { x: number; y: number }[]) {
  return nodesArr.reduce((d, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return d + ` Q ${cx} ${prev.y}, ${p.x} ${p.y}`;
  }, '');
}

export default function CaroLevelMapPro() {
  const router = useRouter();
  const { starsByLevel, isUnlocked } = useCaroProgress();

  // demo 100 level đầu
  const levels = useMemo(() => CARO_LEVELS.slice(0, 100), []);
  const nodes = levels.map((lv, i) => ({
    lv: lv.index,
    x: i % 2 === 0 ? LEFT_X : RIGHT_X,
    y: 120 + i * V_STEP,
    boss: lv.index % 5 === 0,
  }));

  // Level “tiếp tục”
  const nextLevel = useMemo(
    () => getNextPlayableLevel(levels, isUnlocked),
    [levels, isUnlocked]
  );

  // TÁCH PATH: toàn bộ & phần đã mở khóa (dừng ở nextLevel)
  const pathAllD = useMemo(() => buildPathD(nodes), [nodes]);

  const currentIdx = useMemo(
    () => Math.max(0, nodes.findIndex((n) => n.lv === nextLevel)),
    [nodes, nextLevel]
  );
  const unlockedNodes = useMemo(
    () => nodes.slice(0, currentIdx + 1),
    [nodes, currentIdx]
  );
  const pathUnlockedD = useMemo(() => buildPathD(unlockedNodes), [unlockedNodes]);

  const contentH = (nodes.at(-1)?.y ?? 0) + 280;

  // Animate: vẽ đường & dash chạy 1 lần lúc vào
  const dashAnim = useRef(new Animated.Value(0)).current; // 0->1
  useEffect(() => {
    Animated.timing(dashAnim, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }, []);
  const dashLen = 16000;
  const dashOffsetOnce = dashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [dashLen, 0],
  });

  // Dash chạy lặp vô hạn (đốm sáng chạy theo đường)
  const runner = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(runner, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);
  const dashOffsetLoop = runner.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dashLen],
  });

  // Parallax: theo scroll Y
  const scrollY = useRef(new Animated.Value(0)).current;

  // Tổng tiến độ
  const totalStars = Object.values(starsByLevel).reduce<number>((a, b) => a + (b || 0), 0);
  const maxStars = levels.length * 3;
  const progressPct = Math.min(1, totalStars / maxStars);

  const onContinue = () =>
    router.push({ pathname: '/game/play', params: { level: nextLevel } });

  // Pulse cho node hiện tại
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <SafeAreaView style={S.levelContainer}>
      {/* BG: gradient + parallax layers */}
      <View style={[S.absFill, { zIndex: -2 }]}>
        <LinearGradient
          colors={['#0b1220', '#0d1630', '#0b1220']}
          style={S.absFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Stars layer (xa) */}
        <Animated.View
          style={[
            S.parallaxLayer,
            { transform: [{ translateY: Animated.multiply(scrollY, -0.12) }] },
          ]}
        >
          <StarField />
        </Animated.View>
        {/* Clouds layer (gần) */}
        <Animated.View
          style={[
            S.parallaxLayer,
            { transform: [{ translateY: Animated.multiply(scrollY, -0.25) }] },
          ]}
        >
          <CloudBand />
        </Animated.View>
      </View>

      {/* Header pro */}
      <View style={S.proHeader}>
        <TouchableOpacity onPress={() => router.back()} style={S.proBack}>
          <Ionicons name="arrow-back" size={22} color="#e2e8f0" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={S.levelTitle}>Caro — Chọn level</Text>
          <View style={S.progressBarWrap}>
            <LinearGradient
              colors={['#22d3ee', '#60a5fa', '#a78bfa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[S.progressBarFill, { width: `${progressPct * 100}%` }]}
            />
          </View>
          <Text style={S.progressText}>
            {totalStars}/{maxStars} ★
          </Text>
        </View>
        <TouchableOpacity onPress={onContinue} style={S.ctaContinue}>
          <Ionicons name="play" size={16} color="#0b1220" />
          <Text style={S.ctaText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[S.levelList, { height: contentH }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* SVG Path */}
        <Svg width={W} height={contentH} style={S.svg}>
          <Defs>
            <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#60a5fa" />
              <Stop offset="100%" stopColor="#a78bfa" />
            </SvgGradient>
            <SvgGradient id="glow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#60a5fa55" />
              <Stop offset="100%" stopColor="#a78bfa55" />
            </SvgGradient>
            <Marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <Polygon points="0,0 10,5 0,10" fill="#60a5fa" />
            </Marker>
          </Defs>

          {/* ----- NỀN CHO TOÀN BỘ MAP (tối) ----- */}
          <Path d={pathAllD} stroke="url(#glow)" strokeWidth={14} fill="none" opacity={0.18} />
          <Path d={pathAllD} stroke="#1f2a44" strokeWidth={8} fill="none" />

          ----- ĐƯỜNG ĐÃ MỞ KHÓA (sáng) -----
          <Path d={pathUnlockedD} stroke="url(#glow)" strokeWidth={14} fill="none" />
          <Path
            d={pathUnlockedD}
            stroke="url(#grad)"
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            markerEnd="url(#arrow)"
            strokeDasharray={dashLen}
            strokeDashoffset={Number(dashOffsetOnce as any)}
          />
          <Path
            d={pathUnlockedD}
            stroke="#e2e8f0"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={0.25}
            strokeDasharray="18 26"
            strokeDashoffset={Number(dashOffsetLoop as any)}
          />

          {/* Mốc & đốm sáng nhỏ ở đầu path */}
          {nodes.length > 0 && (
            <G>
              <Circle cx={nodes[0].x} cy={nodes[0].y} r={4} fill="#a78bfa" />
              <Circle cx={nodes[0].x} cy={nodes[0].y} r={10} fill="#a78bfa33" />
            </G>
          )}
        </Svg>

        {/* NODES */}
        {nodes.map((n) => {
          const unlocked = isUnlocked(n.lv);
          const stars = starsByLevel[n.lv] ?? 0;
          const isCurrent = unlocked && n.lv === nextLevel;

          return (
            <View key={n.lv} style={[S.nodeWrap, { left: n.x - NODE_R, top: n.y - NODE_R }]}>
              {/* Pulse ring for current level */}
              {isCurrent && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    S.pulseRing,
                    {
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
              )}

              <TouchableOpacity
                activeOpacity={unlocked ? 0.9 : 1}
                style={[S.proNode, !unlocked && S.proNodeLocked]}
                disabled={!unlocked}
                onPress={() =>
                  router.push({ pathname: '/game/play', params: { level: n.lv } })
                }
              >
                {/* Badge boss mỗi 5 level */}
                {n.boss && (
                  <View style={S.bossBadge}>
                    <Ionicons name="trophy" size={14} color="#0b1220" />
                  </View>
                )}

                {/* Ring stars (vòng 3 sao) */}
                <View style={S.ringStars}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < stars ? 'star' : 'star-outline'}
                      size={14}
                      color={i < stars ? '#fbbf24' : '#64748b'}
                      style={{ marginHorizontal: 2 }}
                    />
                  ))}
                </View>

                {/* Label */}
                <LinearGradient
                  colors={unlocked ? ['#111827cc', '#1f2937cc'] : ['#0f172acc', '#0b1220cc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={S.nodeGlass}
                >
                  <Text style={S.proLvText}>{`LV${n.lv}`}</Text>
                  {!unlocked ? (
                    <View style={S.lockRow}>
                      <Ionicons name="lock-closed" size={12} color="#93a2b1" />
                      <Text style={S.lockText}>Locked</Text>
                    </View>
                  ) : (
                    <View style={S.metaRow}>
                      <Ionicons name="flash" size={12} color="#22d3ee" />
                      <Text style={S.metaText}>{stars === 0 ? 'New' : `${stars}/3★`}</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Parallax Partials ---------------- */

function StarField() {
  // vài chục đốm sao tĩnh + “nhấp nháy”
  const dots = useMemo(() => {
    const arr = Array.from({ length: 48 }).map(() => ({
      left: Math.random() * W, // toàn chiều rộng
      top: Math.random() * H * 1.6, // trải dài hơn chiều
      size: Math.random() * 2.2 + 1.2, // 1.2 - 3.4
      twinkleDelay: Math.random() * 2000, // độ trễ nhấp nháy khác nhau
    }));
    return arr;
  }, []);
  return (
    <View style={{ width: W, height: H * 2 }}>
      {dots.map((d, idx) => (
        <TwinkleDot
          key={idx}
          left={d.left}
          top={d.top}
          size={d.size}
          delay={d.twinkleDelay}
        />
      ))}
    </View>
  );
}

function TwinkleDot({
  left,
  top,
  size,
  delay,
}: {
  left: number;
  top: number;
  size: number;
  delay: number;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1200, delay, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [a, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: '#e2e8f0',
        opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.9] }),
      }}
    />
  );
}

function CloudBand() {
  return (
    <View style={{ width: W, height: H * 2, opacity: 0.22 }}>
      <LinearGradient
        colors={['#93c5fd22', '#a78bfa22', '#22d3ee22']}
        style={{ position: 'absolute', inset: 0 }}
      />
      {/* “mây” bo tròn lặp lại */}
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: i * 260 + (i % 2 === 0 ? 0 : 90),
            left: i % 2 === 0 ? -30 : 40,
            width: W * 0.9,
            height: 120,
            backgroundColor: '#0ea5e944',
            borderRadius: 60,
            ...(Platform.OS === 'web' ? { filter: 'blur(20px)' as any } : null),
          }}
        />
      ))}
    </View>
  );
}
