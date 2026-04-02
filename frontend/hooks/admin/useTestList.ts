import { deleteQuestion, getAllQuestions } from '@/services/admin/testService';
import type { TestQuestion } from '@/types/admin/test';
import React from 'react';
import { Alert } from 'react-native';

export function useTestList() {
  const [questions, setQuestions] = React.useState<TestQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (e) {
      console.error('Lỗi khi lấy danh sách câu hỏi:', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách câu hỏi.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const deleteById = React.useCallback((id: string) => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc muốn xoá câu hỏi này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuestion(id);
              await refresh();
            } catch (e) {
              console.error('Lỗi khi xoá câu hỏi:', e);
              Alert.alert('Lỗi', 'Không thể xoá câu hỏi. Vui lòng thử lại.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  }, [refresh]);

  return { questions, loading, refresh, deleteById };
}
