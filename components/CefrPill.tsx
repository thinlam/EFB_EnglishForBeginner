// components/CefrPill.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PILL_SIZE = 64;

type Props = {
  level: string;      // "A1", "A2", ...
  progress?: number;  // 0–1 (0 = cạn, 1 = full)
};

export function CefrPill({ level, progress = 0 }: Props) {
  // clamp 0–1
  const clamp = Math.max(0, Math.min(progress ?? 0, 1));
  const waterHeight = clamp * PILL_SIZE;
  const hasWater = waterHeight > 0;

  return (
    <View style={styles.pill}>
      {/* nền xám */}
      <View style={styles.baseBg} />

      {/* nước dâng từ đáy lên */}
      {hasWater && (
        <View
          style={[
            styles.water,
            { height: waterHeight },
          ]}
        />
      )}

      {/* Text */}
      <View style={styles.textWrapper}>
        <Text style={styles.label}>CEFR</Text>
        <Text style={styles.level}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6', // xám
  },
  water: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#38BDF8', // màu nước
  },
  textWrapper: {
    position: 'absolute',
    top: 8,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  level: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1220',
  },
});
