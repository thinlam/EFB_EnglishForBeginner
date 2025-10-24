import { endgameStyles as S } from '@/components/style/caro';
import type { EndStats } from '@/types/game/caro';
import { router } from 'expo-router';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean; // hiển thị modal hay không
  winner: 'X' | 'O' | null; // người thắng cuộc
  stars: 0 | 1 | 2 | 3; // số sao nhận được
  exp: number; // điểm kinh nghiệm nhận được
  stats: EndStats; // thống kê cuối game
  onPlayAgain: () => void; // hàm gọi khi nhấn chơi lại
};

export const EndgameModal: React.FC<Props> = ({
  visible,
  winner,
  stars,
  exp,
  stats,
  onPlayAgain,
}) => {
  const [show, setShow] = React.useState(visible);

  React.useEffect(() => setShow(visible), [visible]);

  if (!show) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={S.modalBackdrop}>
        <View style={S.modalCard}>
          <Text style={S.title}>
            {winner === 'X' ? 'Bạn thắng!' : 'Bot thắng!'}
          </Text>

          <Text style={S.star}>
            {'★'.repeat(stars) + '☆'.repeat(3 - stars)}
          </Text>
          <Text style={S.line}>EXP: +{exp}</Text>
          <Text style={S.line}>
            Đúng {stats.correct}/{stats.total} – Streak max {stats.maxStreak}
          </Text>

          {/* Hai nút tách chức năng */}
          <View style={S.rowBtn}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[S.playBtn, { backgroundColor: '#e5e7eb' }]}
            >
              <Text style={[S.playText, { color: '#111827' }]}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPlayAgain} style={S.playBtn}>
              <Text style={S.playText}>Chơi lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
