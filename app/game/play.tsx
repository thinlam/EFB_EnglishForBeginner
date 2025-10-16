import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaroBoard } from '@/components/game/CaroBoard';
import { EndgameModal } from '@/components/game/EndgameModal';
import { QuestionModal } from '@/components/game/QuestionModal';
import { caroScreenStyles as S } from '@/components/style/caro';
import { useCaro } from '@/hooks/game/useCaro';
import { useCaroProgress } from '@/hooks/game/useCaroProgress';
import { useQuiz } from '@/hooks/game/useQuiz';

export default function CaroPlayScreen() {
  const router = useRouter();
  const { level = '1' } = useLocalSearchParams();
  const lv = Number(level);
  const { saveResult } = useCaroProgress();

  const {
    board, turn, winner, stars, exp, stats, lastPick,
    handleHumanTap, resetGame, botFirstMoveIfNeeded
  } = useCaro({ level: lv });

  const {
    visible, question, secondsLeft, showQuestionForCell,
    submitAnswer, dismissQuestion, loading
  } = useQuiz({
    onCorrect: (cell) => handleHumanTap(cell, true),
    onTimeoutOrWrong: (cell) => handleHumanTap(cell, false),
  });

  useEffect(() => { botFirstMoveIfNeeded(); }, [botFirstMoveIfNeeded]);

  useEffect(() => {
    if (winner) {
      // lưu kết quả (sao) để mở khóa level tiếp theo
      saveResult(lv, stars);
    }
  }, [winner, stars, lv, saveResult]);

  return (
    <SafeAreaView style={S.container}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 8 }}>
          <Ionicons name="arrow-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>level {lv}</Text>
      </View>

      <View style={S.boardWrap}>
        <CaroBoard
          board={board}
          turn={turn}
          lastPick={lastPick}
          onCellPress={(cell) => { if (!winner) showQuestionForCell(cell); }}
        />
      </View>

      <QuestionModal
        visible={visible}
        loading={loading}
        secondsLeft={secondsLeft}
        question={question}
        onSubmit={(isCorrect) => submitAnswer(isCorrect)}
        onDismiss={dismissQuestion}
      />

      <EndgameModal
        visible={!!winner}
        winner={winner}
        stars={stars}
        exp={exp}
        stats={stats}
        onPlayAgain={resetGame}
      />
    </SafeAreaView>
  );
}
