import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/components/style/admin/TestListStyles';
import { useTestList } from '@/hooks/admin/useTestList';

export default function TestListScreen() {
  const router = useRouter();
  const { questions, loading, refresh, deleteById } = useTestList();

  const renderItem = ({ item, index }: any) => (
    <View style={styles.card}>
      <Text style={styles.index}>
        Câu {index + 1}: <Text style={styles.type}>[{item.type}]</Text>
      </Text>
      <Text style={styles.question}>{item.question}</Text>

      <View style={styles.options}>
        {item.options?.map((opt: string, idx: number) => (
          <Text key={idx}>• {opt}</Text>
        ))}
      </View>

      <Text style={styles.answer}>✅ Đáp án đúng: {item.correctAnswer}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
          onPress={() => router.push({ pathname: '/(admin)/editTest', params: { id: item.id } })}
        >
          <Text style={styles.actionText}> Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
          onPress={() => deleteById(item.id)}
        >
          <Text style={styles.actionText}> Xoá</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>📋 Danh sách câu hỏi kiểm tra</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(admin)/testForm')}>
          <Text style={styles.addButtonText}>➕ Thêm câu hỏi mới</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(admin)/home')}>
          <Text style={styles.link}>🏁 Trở về trang chủ</Text>
        </TouchableOpacity>

        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          onRefresh={refresh}
          refreshing={loading}
        />
      </View>
    </SafeAreaView>
  );
}
