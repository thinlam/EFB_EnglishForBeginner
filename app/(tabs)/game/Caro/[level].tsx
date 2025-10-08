import QuizModal from '@/components/games/QuizModal';
import Screen from '@/components/ui/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Cell = 'X' | 'O';
type Key = string;
const keyOf = (r: number, c: number) => `${r},${c}`;

// ✅ Hàm kiểm tra thắng độc lập (pure)
const checkWinOn = (map: Map<Key, Cell>, r: number, c: number, s: Cell) => {
  const dirs = [
    [0, 1],   // ngang
    [1, 0],   // dọc
    [1, 1],   // chéo chính
    [1, -1],  // chéo phụ
  ] as const;

  const has = (rr: number, cc: number) => map.get(keyOf(rr, cc)) === s;

  for (const [dr, dc] of dirs) {
    let cnt = 1;
    for (let k = 1; has(r + dr * k, c + dc * k); k++) cnt++;
    for (let k = 1; has(r - dr * k, c - dc * k); k++) cnt++;
    if (cnt >= 5) return true;
  }
  return false;
};

export default function CaroPlay() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [board, setBoard] = useState<Map<Key, Cell>>(() => new Map());
  const [turn, setTurn] = useState<Cell>('X');
  const [bounds, setBounds] = useState({ minR: -6, maxR: 6, minC: -6, maxC: 6 });
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [winner, setWinner] = useState<Cell | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // ✅ Đặt quân + kiểm tra thắng
  const place = useCallback((r: number, c: number, s: Cell) => {
    setBoard((prev) => {
      const next = new Map(prev);
      next.set(keyOf(r, c), s);
      if (checkWinOn(next, r, c, s)) setWinner(s);
      return next;
    });

    setBounds((b) => ({
      minR: Math.min(b.minR, r - 1),
      maxR: Math.max(b.maxR, r + 1),
      minC: Math.min(b.minC, c - 1),
      maxC: Math.max(b.maxC, c + 1),
    }));
  }, []);

  // ✅ Bot X đi
  const botTurn = useCallback(() => {
    const candidates: { r: number; c: number; d: number }[] = [];
    for (let rr = bounds.minR; rr <= bounds.maxR; rr++) {
      for (let cc = bounds.minC; cc <= bounds.maxC; cc++) {
        const k = keyOf(rr, cc);
        if (!board.has(k)) candidates.push({ r: rr, c: cc, d: Math.abs(rr) + Math.abs(cc) });
      }
    }
    candidates.sort((a, b) => a.d - b.d);
    const pick = candidates[0];
    if (!pick) return;
    place(pick.r, pick.c, 'X');
    setTurn('O');
  }, [board, bounds, place]);

  // ✅ Khi người chơi chọn ô
  const onTapCell = (r: number, c: number) => {
    if (winner || turn !== 'O') return;
    const k = keyOf(r, c);
    if (board.has(k)) return Alert.alert('Ô đã có quân!');
    setSelected({ r, c });
    setShowQuiz(true);
  };

  // ✅ Kết quả quiz
  const onQuizResult = (correct: boolean) => {
    setShowQuiz(false);
    if (!selected) return;

    if (correct) {
      place(selected.r, selected.c, 'O');
    } else {
      const empties: { r: number; c: number; d: number }[] = [];
      for (let rr = bounds.minR; rr <= bounds.maxR; rr++) {
        for (let cc = bounds.minC; cc <= bounds.maxC; cc++) {
          const k = keyOf(rr, cc);
          if (!board.has(k)) {
            const d = (rr - selected.r) ** 2 + (cc - selected.c) ** 2;
            empties.push({ r: rr, c: cc, d });
          }
        }
      }
      empties.sort((a, b) => a.d - b.d);
      const pick = empties[0] ?? { r: selected.r, c: selected.c };
      place(pick.r, pick.c, 'O');
    }

    setSelected(null);
    setTurn('X');
  };

  React.useEffect(() => {
    if (!winner && turn === 'X') botTurn();
  }, [turn, winner, botTurn]);

  const cells = useMemo(() => {
    const arr: { r: number; c: number; val: Cell | undefined }[] = [];
    for (let rr = bounds.minR; rr <= bounds.maxR; rr++) {
      for (let cc = bounds.minC; cc <= bounds.maxC; cc++) {
        arr.push({ r: rr, c: cc, val: board.get(keyOf(rr, cc)) });
      }
    }
    return arr;
  }, [board, bounds]);

  return (
    <Screen>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/game/Caro/levels')} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.h1}>Caro – Level {level}</Text>
      </View>

      <View style={[s.grid, { paddingBottom: 12 + insets.bottom }]}>
        {cells.map(({ r, c, val }) => (
          <TouchableOpacity
            key={keyOf(r, c)}
            style={[s.cell, selected && selected.r === r && selected.c === c && s.sel]}
            onPress={() => onTapCell(r, c)}
            disabled={!!val || turn !== 'O' || !!winner}
          >
            <Text style={s.mark}>{val ?? ''}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {winner && (
        <View style={[s.footer, { paddingBottom: 16 + insets.bottom }]}>
          <Text style={s.result}>{winner === 'O' ? 'Bạn thắng!' : 'Bạn thua :('}</Text>
          <TouchableOpacity style={s.btn} onPress={() => router.replace('/game/Caro/levels')}>
            <Text style={s.btnText}>Về Level Map</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ QuizModal trắc nghiệm CEFR Cambridge */}
      {showQuiz && (
        <QuizModal
          cefr="A2"
          timeSec={15}
          onResult={onQuizResult}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 6, marginLeft: -6 },
  h1: { color: '#fff', fontWeight: '700', fontSize: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 12 },
  cell: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sel: { backgroundColor: '#111827' },
  mark: { color: '#fff', fontWeight: '800' },
  footer: { paddingHorizontal: 16, alignItems: 'center' },
  result: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  btn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
