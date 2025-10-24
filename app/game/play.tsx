import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaroBoard } from '@/components/game/CaroBoard';
import { EndgameModal } from '@/components/game/EndgameModal';
import { QuestionModal } from '@/components/game/QuestionModal';
import { RulesModal } from '@/components/game/RulesModal';
import { caroScreenStyles as S } from '@/components/style/caro';
import { useCaro } from '@/hooks/game/useCaro';
import { useCaroProgress } from '@/hooks/game/useCaroProgress';
import { useQuiz } from '@/hooks/game/useQuiz';

// NEW: helper quy tắc khó + boss mỗi 10 level
import { levelTuning } from '@/game/caro/difficulty';

export default function CaroPlayScreen() {
  const router = useRouter();
  const { level = '1' } = useLocalSearchParams();
  const lv = Number(level);

  // tuning theo level
  const { difficulty, isBoss, timeLimit /*, reward*/ } = levelTuning(lv);

  const { saveResult } = useCaroProgress();

  // Nếu hook useCaro hỗ trợ truyền difficulty, giữ lại dòng dưới; nếu chưa, có thể bỏ prop này.
  const { board, turn, winner, stars, exp, stats, lastPick,
    handleHumanTap, resetGame, botFirstMoveIfNeeded
  } = useCaro({ level: lv /*, difficulty*/ });

  // Truyền difficulty + timeLimit cho quiz (hook của bạn đã hỗ trợ visible/seconds…)
  const {
    visible, question, secondsLeft, showQuestionForCell,
    submitAnswer, dismissQuestion, loading
  } = useQuiz({
    onCorrect: (cell) => handleHumanTap(cell, true),
    onTimeoutOrWrong: (cell) => handleHumanTap(cell, false),
    difficulty,             // NEW: lấy câu theo độ khó của level
    timeLimitSeconds: timeLimit, // NEW: countdown rút ngắn khi khó/boss
  });

  useEffect(() => { botFirstMoveIfNeeded(); }, [botFirstMoveIfNeeded]);

  // Lưu sao khi xong ván
  useEffect(() => {
    if (winner) saveResult(lv, stars);
  }, [winner, stars, lv, saveResult]);

  const [showRules, setShowRules] = useState(true);
  const [started, setStarted] = useState(false);

  return (
    <SafeAreaView style={S.container}>
      {/* Nền dark => dùng light-content để chữ/icon trắng */}
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 4 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>
          Level {lv} — Bạn: X · Bot: O
        </Text>

        {/* Badge hiển thị độ khó + Boss */}
        <View style={{ flexDirection: 'row', marginLeft: 'auto', alignItems: 'center', gap: 8 }}>
          {isBoss ? (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 10, height: 28, borderRadius: 999,
              backgroundColor: '#facc15',
            }}>
              <Ionicons name="trophy" size={14} color="#0b1220" />
              <Text style={{ color: '#0b1220', fontWeight: '900' }}>BOSS</Text>
            </View>
          ) : (
            <View style={{
              paddingHorizontal: 10, height: 28, borderRadius: 999,
              backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontWeight: '700', textTransform: 'capitalize' }}>
                {difficulty}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bàn cờ */}
      <View style={S.boardWrap}>
        <CaroBoard
          board={board}
          turn={turn}
          lastPick={lastPick}
          onCellPress={(cell) => {
            if (!started || winner) return; // chưa start thì chặn bấm
            showQuestionForCell(cell);
          }}
        />
      </View>

      {/* Quiz */}
      <QuestionModal
        visible={visible}
        loading={loading}
        secondsLeft={secondsLeft}
        question={question}
        onSubmit={(isCorrect) => submitAnswer(isCorrect)}
        onDismiss={dismissQuestion}
      />

      {/* Kết thúc ván */}
      <EndgameModal
        visible={!!winner}
        winner={winner}
        stars={stars}
        exp={exp}
        stats={stats}
        onPlayAgain={() => {
          setStarted(false);
          setShowRules(true);
          resetGame();
        }}
      />

      {/* Luật & Thể lệ */}
      <RulesModal
        visible={showRules}
        onStart={() => { setShowRules(false); setStarted(true); }}
        onExit={() => router.back()}
      />
    </SafeAreaView>
  );
}
