// app/game/Caro/levels.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  InteractionManager,
  Platform,
  Text,
  TouchableOpacity,
  View
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

// Reanimated cho runner UI-thread
import * as R from 'react-native-reanimated';

import { levelMapStyles as S } from '@/components/style/caro';
import { CARO_LEVELS } from '@/constants/game/caro-levels';
import { useCaroProgress } from '@/hooks/game/useCaroProgress';

const { width: W, height: H } = Dimensions.get('window');
const NODE_R = 48;
const V_STEP = 170;
const LEFT_X = 24 + NODE_R;
const RIGHT_X = W - 24 - NODE_R;

// RN Animated cho hiệu ứng "vẽ 1 lần"
const AnimatedPath = Animated.createAnimatedComponent(Path);
// Reanimated AnimatedPath cho runner UI-thread
const RAnimatedPath: any = R.createAnimatedComponent(Path);

/** Helper: level chơi tiếp theo (first locked - 1 + 1 = last unlocked) */
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

/* ---------------- Reanimated Dash Runner (UI thread) ---------------- */
function DashRunner({
  d,
  dashLen = 12000,
  dashArray = [18, 26],
  speed = 4200,
  paused,
  opacity = 0.22,
}: {
  d: string;
  dashLen?: number;
  dashArray?: number[];
  speed?: number; // ms cho 1 vòng
  paused: boolean; // pause khi đang scroll
  opacity?: number;
}) {
  const offset = R.useSharedValue(0);

  useEffect(() => {
    if (paused) {
      R.cancelAnimation(offset);
      offset.value = offset.value = dashLen; // giữ nguyên vị trí
    } else {
      offset.value = 10; // khởi động lại mượt
      offset.value = R.withRepeat(
        R.withTiming(dashLen, { duration: speed, easing: R.Easing.linear }),
        -1,// lặp
        false
      );
    }
    return () => {
      R.cancelAnimation(offset);
    };
  }, [paused, dashLen, speed]);

  const animatedProps = R.useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <RAnimatedPath
      animatedProps={animatedProps}
      d={d}
      stroke="#e2e8f0"
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
      opacity={opacity}
      strokeDasharray={dashArray}
    />
  );
}

/* ---------------- Parallax Partials ---------------- */
function StarField() {
  // Shared driver cho tất cả đốm sao (RN Animated)
  const twinkle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [twinkle]);

  const dots = useMemo(
    () =>
      Array.from({ length: 32 }).map(() => ({
        left: Math.random() * W,
        top: Math.random() * H * 1.6,
        size: Math.random() * 2.2 + 1.2,
        phase: Math.random(), // 0..1
      })),
    []
  );

  return (
    <View style={{ width: W, height: H * 2 }} pointerEvents="none" collapsable>
      {dots.map((d, idx) => {
        const opacity = twinkle.interpolate({
          inputRange: [0, d.phase, 1],
          outputRange: [0.2, 0.9, 0.2],
        });
        return (
          <Animated.View
            key={idx}
            pointerEvents="none"
            renderToHardwareTextureAndroid
            style={{
              position: 'absolute',
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: 999,
              backgroundColor: '#e2e8f0',
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

function CloudBand() {
  // Giảm số dải mây để giảm overdraw
  return (
    <View style={{ width: W, height: H * 2, opacity: 0.22 }} pointerEvents="none" collapsable>
      <LinearGradient
        colors={['#93c5fd22', '#a78bfa22', '#22d3ee22']}
        style={{ position: 'absolute', inset: 0 } as any}
      />
      {[...Array(3)].map((_, i) => (
        <View
          key={i}
          renderToHardwareTextureAndroid
          style={{
            position: 'absolute',
            top: i * 420 + (i % 2 === 0 ? 0 : 120),
            left: i % 2 === 0 ? -30 : 40,
            width: W * 0.95,
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

/* ---------------- Node tách riêng để memo ---------------- */
type NodeData = { lv: number; x: number; y: number; boss: boolean };

const NodeItem = React.memo(function NodeItem({
  n,
  unlocked,
  stars,
  isCurrent,
  onPress,
  pulseScale,
  pulseOpacity,
}: {
  n: NodeData;
  unlocked: boolean;
  stars: number;
  isCurrent: boolean;
  onPress: () => void;
  pulseScale: any; // đơn giản hóa type cho RN Animated interpolate
  pulseOpacity: any;
}) {
  return (
    <View
      style={[S.nodeWrap, { left: n.x - NODE_R, top: n.y - NODE_R }]}
      renderToHardwareTextureAndroid
      collapsable
    >
      {/* Pulse ring for current level (đừng rasterize phần animate) */}
      {isCurrent && (
        <Animated.View
          pointerEvents="none"
          style={[S.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}
        />
      )}

      <TouchableOpacity
        activeOpacity={unlocked ? 0.9 : 1}
        style={[S.proNode, !unlocked && S.proNodeLocked]}
        disabled={!unlocked}
        onPress={onPress}
      >
        {/* Badge boss mỗi 5 level */}
        {n.boss && (
          <View style={S.bossBadge}>
            <Ionicons name="trophy" size={14} color="#0b1220" />
          </View>
        )}

        {/* Vòng sao */}
        <View style={S.ringStars} pointerEvents="none">
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

        {/* Label: Android dùng màu đặc để giảm overdraw; iOS giữ gradient */}
        {Platform.OS === 'android' ? (
          <View
            style={[
              S.nodeGlass,
              { backgroundColor: unlocked ? '#18202ccc' : '#0b1220cc' },
            ]}
          >
            <Text style={S.proLvText}>{`LV${n.lv}`}</Text>
            {unlocked ? (
              <View style={S.metaRow}>
                <Ionicons name="flash" size={12} color="#22d3ee" />
                <Text style={S.metaText}>{stars === 0 ? 'New' : `${stars}/3★`}</Text>
              </View>
            ) : (
              <View style={S.lockRow}>
                <Ionicons name="lock-closed" size={12} color="#93a2b1" />
                <Text style={S.lockText}>Locked</Text>
              </View>
            )}
          </View>
        ) : (
          <LinearGradient
            colors={unlocked ? ['#111827cc', '#1f2937cc'] : ['#0f172acc', '#0b1220cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={S.nodeGlass}
          >
            <Text style={S.proLvText}>{`LV${n.lv}`}</Text>
            {unlocked ? (
              <View style={S.metaRow}>
                <Ionicons name="flash" size={12} color="#22d3ee" />
                <Text style={S.metaText}>{stars === 0 ? 'New' : `${stars}/3★`}</Text>
              </View>
            ) : (
              <View style={S.lockRow}>
                <Ionicons name="lock-closed" size={12} color="#93a2b1" />
                <Text style={S.lockText}>Locked</Text>
              </View>
            )}
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
});

/* ---------------- Main ---------------- */
export default function CaroLevelMapPro() {
  const router = useRouter();
  const { starsByLevel, isUnlocked } = useCaroProgress();

  // demo 30 level đầu
  const levels = useMemo(() => CARO_LEVELS.slice(0, 30), []);
  const nodes: NodeData[] = useMemo(
    () =>
      levels.map((lv, i) => ({
        lv: lv.index,
        x: i % 2 === 0 ? LEFT_X : RIGHT_X,
        y: 120 + i * V_STEP,
        boss: lv.index % 5 === 0,
      })),
    [levels]
  );

  // Level tiếp tục
  const nextLevel = useMemo(() => getNextPlayableLevel(levels, isUnlocked), [levels, isUnlocked]);

  // Path: toàn bộ & phần đã mở khóa
  const pathAllD = useMemo(() => buildPathD(nodes), [nodes]);
  const currentIdx = useMemo(
    () => Math.max(0, nodes.findIndex((n) => n.lv === nextLevel)),
    [nodes, nextLevel]
  );
  const unlockedNodes = useMemo(() => nodes.slice(0, currentIdx + 1), [nodes, currentIdx]);
  const pathUnlockedD = useMemo(() => buildPathD(unlockedNodes), [unlockedNodes]);

  // Chiều cao nội dung
  const contentH = (nodes.at(-1)?.y ?? 0) + 160;

  // Dash "vẽ 1 lần" lúc vào (RN Animated)
  const dashAnim = useRef(new Animated.Value(0)).current; // 0->1
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      Animated.timing(dashAnim, { toValue: 1, duration: 1000, useNativeDriver: false }).start();
    });
    return () => task.cancel();
  }, [dashAnim]);

  const dashLen = 12000;
  const dashOffsetOnce = dashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [dashLen, 0],
  });

  // Parallax theo scroll Y (native driver)
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolling, setIsScrolling] = React.useState(false);

  // Tổng tiến độ
  const totalStars = Object.values(starsByLevel).reduce<number>((a, b) => a + (b || 0), 0);
  const maxStars = levels.length * 3;
  const progressPct = Math.min(1, totalStars / maxStars);

  const onContinue = () => router.push({ pathname: '/game/play', params: { level: nextLevel } });

  // Pulse cho node hiện tại
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  // Android bỏ marker để tránh crash Skia
  const markerProps = Platform.select<{ markerEnd?: string }>({
    ios: { markerEnd: 'url(#arrow)' },
    android: {},
    default: {},
  })!;

  return (
    <SafeAreaView style={S.levelContainer}>
      {/* BG: gradient + parallax layers (đưa ra ngoài ScrollView) */}
      <View style={[S.absFill, { zIndex: -2 }]} pointerEvents="none" collapsable>
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
          pointerEvents="none"
        >
          <StarField />
        </Animated.View>
        {/* Clouds layer (gần) */}
        <Animated.View
          style={[
            S.parallaxLayer,
            { transform: [{ translateY: Animated.multiply(scrollY, -0.25) }] },
          ]}
          pointerEvents="none"
        >
          <CloudBand />
        </Animated.View>
      </View>

      {/* Header */}
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
        contentContainerStyle={[S.levelList, { minHeight: contentH, paddingBottom: 120 }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onMomentumScrollEnd={() => setIsScrolling(false)}
        onScrollEndDrag={(e) => {
          const vy = e?.nativeEvent?.velocity?.y ?? 0;
          if (Math.abs(vy) < 0.01) setIsScrolling(false);
        }}
        scrollEventThrottle={16}
        removeClippedSubviews
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

          {/* NỀN CHO TOÀN BỘ MAP */}
          {Platform.OS === 'ios' ? (
            <>
              <Path d={pathAllD} stroke="#22304d" strokeWidth={7} fill="none" opacity={0.9} />
            </>
          ) : (
            <>
              <Path d={pathAllD} stroke="url(#glow)" strokeWidth={14} fill="none" opacity={0.18} />
              <Path d={pathAllD} stroke="#1f2a44" strokeWidth={8} fill="none" />
            </>
          )}

          {/* PHẦN ĐÃ MỞ KHÓA */}
          {Platform.OS === 'ios' ? (
            <>
              <Path d={pathUnlockedD} stroke="url(#grad)" strokeWidth={5} fill="none" />
              <AnimatedPath
                d={pathUnlockedD}
                stroke="url(#grad)"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
                {...markerProps}
                strokeDasharray={[dashLen, dashLen]}
                strokeDashoffset={dashOffsetOnce}
              />
            </>
          ) : (
            <>
              <Path d={pathUnlockedD} stroke="url(#glow)" strokeWidth={14} fill="none" />
              <AnimatedPath
                d={pathUnlockedD}
                stroke="url(#grad)"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
                {...markerProps}
                strokeDasharray={[dashLen, dashLen]}
                strokeDashoffset={dashOffsetOnce}
              />
            </>
          )}

          {/* Runner mượt (Reanimated UI thread) – chạy cả iOS & Android.
              Tự pause khi người dùng đang kéo để ưu tiên FPS cuộn. */}
          <DashRunner
            d={pathUnlockedD}
            dashLen={12000}
            dashArray={[18, 26]}
            speed={4200}
            paused={isScrolling}
            opacity={Platform.OS === 'ios' ? 0.22 : 0.18}
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
            <NodeItem
              key={n.lv}
              n={n}
              unlocked={unlocked}
              stars={stars}
              isCurrent={isCurrent}
              onPress={() => router.push({ pathname: '/game/play', params: { level: n.lv } })}
              pulseScale={pulseScale}
              pulseOpacity={pulseOpacity}
            />
          );
        })}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
