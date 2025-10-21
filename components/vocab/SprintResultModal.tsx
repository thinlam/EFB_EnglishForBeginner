import { vocabSprintStyles as S } from '@/components/style/Game/vocabSprint';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export function ResultModal({
  visible, score, correctCount, wrongCount, bestStreak, onReplay, onExit,
}: {
  visible: boolean;
  score: number; correctCount: number; wrongCount: number; bestStreak: number;
  onReplay: () => void; onExit: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
        <View style={S.modalCard}>
          <Text style={S.modalTitle}>Hết giờ!</Text>
          <View style={S.modalRow}><Text style={S.modalText}>Điểm</Text><Text style={S.modalText}>{score}</Text></View>
          <View style={S.modalRow}><Text style={S.modalText}>Đúng</Text><Text style={S.modalText}>{correctCount}</Text></View>
          <View style={S.modalRow}><Text style={S.modalText}>Sai</Text><Text style={S.modalText}>{wrongCount}</Text></View>
          <View style={S.modalRow}><Text style={S.modalText}>Streak tốt nhất</Text><Text style={S.modalText}>{bestStreak}</Text></View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={[S.btn, { backgroundColor: '#334155' }]} onPress={onExit}>
              <Text style={S.btnLabel}>Thoát</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.btn, { backgroundColor: '#22c55e' }]} onPress={onReplay}>
              <Text style={S.btnLabel}>Chơi lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
