import { addQuestion } from '@/services/admin/testService';
import type { TestQuestionBase } from '@/types/admin/test';
import React from 'react';
import { Alert } from 'react-native';

export function useTestForm() {
  const [type, setType] = React.useState<TestQuestionBase['type']>('vocabulary');
  const [question, setQuestion] = React.useState('');
  const [options, setOptions] = React.useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = React.useState('');
  const [addedCount, setAddedCount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);

  const setOptionAt = (idx: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSubmit = async () => {
    // Trim dữ liệu
    const q = question.trim();
    const opts = options.map((o) => o.trim());
    const ans = answer.trim();

    if (!q || opts.some((o) => !o) || !ans) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!opts.includes(ans)) {
      Alert.alert('Lỗi', 'Đáp án phải trùng với 1 trong 4 lựa chọn.');
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    try {
      await addQuestion({
        type,
        question: q,
        options: opts,
        correctAnswer: ans,
        createdAt: new Date(),
      });
      setQuestion('');
      setOptions(['', '', '', '']);
      setAnswer('');
      setAddedCount((p) => p + 1);
      Alert.alert('✅ Thành công', 'Đã thêm câu hỏi.');
    } catch (e) {
      console.error('[addQuestion]', e);
      Alert.alert('❌ Lỗi', 'Không thể thêm câu hỏi.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    type, setType,
    question, setQuestion,
    options, setOptionAt,
    answer, setAnswer,
    addedCount,
    handleSubmit,
  };
}
