// app/(tabs)/writing/editor.tsx

import { WritingEditorStyles as S } from "@/components/style/user/writing/WritingEditorStyles";
import { db } from "@/scripts/firebase";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function WritingEditorScreen() {
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "writing_lessons", String(id)));
        if (snap.exists()) setTask(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
          Không tìm thấy bài viết.
        </Text>
      </View>
    );
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const tooFew = words < task.wordMin;

  const submit = () => {
    if (tooFew) {
      Alert.alert("Thiếu từ", `Bạn cần tối thiểu ${task.wordMin} từ.`);
      return;
    }

    Alert.alert("Đã nộp!", "Bài viết của bạn đã được ghi nhận 🎉");
  };

  return (
    <ScrollView contentContainerStyle={S.container}>
      <Text style={S.label}>Bài viết của bạn</Text>

      <TextInput
        multiline
        style={S.input}
        value={text}
        onChangeText={setText}
        placeholder="Viết bài vào đây..."
      />

      <Text style={[S.count, tooFew && S.countWarn]}>
        {words} / {task.wordMax} từ
      </Text>

      <TouchableOpacity style={S.submit} onPress={submit}>
        <Text style={S.submitText}>Nộp bài</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
