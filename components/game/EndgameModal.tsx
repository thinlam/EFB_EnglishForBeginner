import { endgameStyles as S } from '@/components/style/caro';
import type { EndStats } from '@/types/game/caro';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export const EndgameModal = ({
  visible, winner, stars, exp, stats, onPlayAgain,
}: {
  visible: boolean; winner: 'X' | 'O' | null; stars: 0|1|2|3; exp: number; stats: EndStats; onPlayAgain: () => void;
}) => {
  if (!visible) return null;
  return (
    <Modal visible animationType="fade" transparent>
      <View style={S.modalBackdrop}>
        <View style={S.modalCard}>
          <Text style={S.title}>{winner === 'X' ? 'You Win!' : 'Bot Win!'}</Text>
          <Text style={S.star}>{'★'.repeat(stars) + '☆'.repeat(3 - stars)}</Text>
          <Text style={S.line}>EXP: +{exp}</Text>
          <Text style={S.line}>Đúng {stats.correct}/{stats.total} – Streak max {stats.maxStreak}</Text>
          <TouchableOpacity onPress={onPlayAgain} style={S.playBtn}><Text style={S.playText}>Chơi lại</Text></TouchableOpacity>
          
        </View>
      </View>
    </Modal>
  );
};
