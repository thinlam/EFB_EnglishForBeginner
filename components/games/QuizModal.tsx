import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Question =
  | {
      id: string;
      type: 'mcq';
      prompt: string;
      options: string[];
      correctIndex: number;
    }
  | {
      id: string;
      type: 'short';
      prompt: string;
      acceptableAnswers: (string | RegExp)[];
      placeholder?: string;
    };

const QUESTIONS: Question[] = [
  {
    id: 'a1-g-1',
    type: 'mcq',
    prompt: 'Choose the correct option: "She ___ from Spain."',
    options: ['is', 'are', 'am'],
    correctIndex: 0,
  },
  {
    id: 'a2-s-1',
    type: 'short',
    prompt: 'Complete: "I usually go to school ___ bus."',
    acceptableAnswers: [/^by$/i],
    placeholder: 'Type one word',
  },
  {
    id: 'b1-u-1',
    type: 'mcq',
    prompt: 'Choose the correct preposition: "She is interested ___ biology."',
    options: ['on', 'in', 'at'],
    correctIndex: 1,
  },
];

export default function QuizModal({
  cefr,
  timeSec,
  onResult,
  onClose,
}: {
  cefr: 'A1' | 'A2' | 'B1' | 'B2';
  timeSec: number;
  onResult: (ok: boolean) => void;
  onClose: () => void;
}) {
  const q = React.useMemo(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)], []);
  const [left, setLeft] = React.useState(timeSec);
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    if (left <= 0) {
      onResult(false);
      return;
    }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onResult]);

  const checkShort = () => {
    if (q.type !== 'short') return false;
    const user = input.trim().toLowerCase();
    return q.acceptableAnswers.some((a) =>
      typeof a === 'string' ? a.toLowerCase() === user : a.test(user)
    );
  };

  return (
    <View style={s.modal}>
      <Text style={s.timer}>⏱ {left}s</Text>
      <Text style={s.prompt}>{q.prompt}</Text>

      {q.type === 'mcq' &&
        q.options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={s.option}
            onPress={() => onResult(idx === q.correctIndex)}
          >
            <Text style={s.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}

      {q.type === 'short' && (
        <>
          <TextInput
            placeholder={q.placeholder ?? 'Your answer'}
            placeholderTextColor="#9ca3af"
            style={s.input}
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            onSubmitEditing={() => onResult(checkShort())}
          />
          <TouchableOpacity style={s.primaryBtn} onPress={() => onResult(checkShort())}>
            <Text style={s.primaryBtnText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={onClose}>
        <Text style={s.close}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  modal: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '25%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  timer: { color: '#93c5fd', fontWeight: '700', alignSelf: 'flex-end' },
  prompt: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  option: { backgroundColor: '#1f2937', padding: 12, borderRadius: 10, width: '100%' },
  optionText: { color: '#fff', fontSize: 15 },
  input: {
    backgroundColor: '#1f2937',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    width: '100%',
  },
  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 10, alignItems: 'center', width: '100%' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  close: { color: '#9ca3af', marginTop: 8 },
});
