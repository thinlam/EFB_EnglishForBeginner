import { quizStyles as S } from '@/components/style/caro';
import type { QuizQuestion } from '@/types/game/caro';
import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

export const QuestionModal = ({
  visible, loading, question, secondsLeft, onSubmit, onDismiss,
}: {
  visible: boolean; loading: boolean; question: QuizQuestion | null; secondsLeft: number;
  onSubmit: (ok: boolean) => void; onDismiss: () => void;
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={S.modalBackdrop}>
      <View style={S.modalCard}>
        {loading || !question ? (
          <View style={S.center}><ActivityIndicator /><Text style={S.modalTitle}>Đang lấy câu hỏi…</Text></View>
        ) : (
          <>
            <Text style={S.timer}>⏳ {secondsLeft}s</Text>
            <Text style={S.modalTitle}>{question.prompt}</Text>
            {question.choices.map((ch) => (
              <TouchableOpacity key={ch.id} style={S.choice} onPress={() => onSubmit(ch.correct)}>
                <Text style={S.choiceText}>{ch.text}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={onDismiss} style={S.dismissBtn}><Text style={S.dismissText}>Đóng</Text></TouchableOpacity>
          </>
        )}
      </View>
    </View>
  </Modal>
);
