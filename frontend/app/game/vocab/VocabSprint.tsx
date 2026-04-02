import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { vocabSprintStyles as S } from '@/components/style/Game/vocabSprint';
import { SprintCard } from '@/components/vocab/sprintCard';
import { SprintHUD } from '@/components/vocab/SprintHUD';
import { ResultModal } from '@/components/vocab/SprintResultModal';
import { useVocabSprint } from '@/hooks/vocab/useVocabSprint';

export default function VocabSprintScreen() {
  const router = useRouter();
  const {
    state, question, shownMeaning, isMatchShown,
    onAnswer, onStart, onRestart,
  } = useVocabSprint();

  return (
    <SafeAreaView style={S.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={S.title}>Vocab Sprint</Text>
        <View style={{ width: 40 }} />
      </View>

      <SprintHUD
        timeLeft={state.timeLeft}
        score={state.score}
        streak={state.streak}
        hearts={state.hearts}
        bestStreak={state.bestStreak}
      />

      <View style={S.body}>
        <SprintCard
          loading={state.phase !== 'playing' || !question}
          word={question?.word ?? ''}
          shownMeaning={shownMeaning}
          isMatch={isMatchShown}
        />

        <View style={S.actions}>
          <TouchableOpacity
            style={[S.btn, S.btnWrong]}
            onPress={() => onAnswer(false)}
            disabled={state.phase !== 'playing'}
          >
            <Ionicons name="close" size={22} color="#fff" />
            <Text style={S.btnLabel}>Sai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.btn, S.btnCorrect]}
            onPress={() => onAnswer(true)}
            disabled={state.phase !== 'playing'}
          >
            <Ionicons name="checkmark" size={22} color="#fff" />
            <Text style={S.btnLabel}>Đúng</Text>
          </TouchableOpacity>
        </View>

        {state.phase === 'ready' && (
          <TouchableOpacity style={S.primary} onPress={onStart}>
            <Text style={S.primaryLabel}>Bắt đầu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ResultModal
        visible={state.phase === 'ended'}
        score={state.score}
        correctCount={state.correct}
        wrongCount={state.wrong}
        bestStreak={state.bestStreak}
        onReplay={onRestart}
        onExit={() => router.back()}
      />
    </SafeAreaView>
  );
}
