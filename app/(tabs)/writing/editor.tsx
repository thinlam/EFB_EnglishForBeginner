// app/(tabs)/writing/editor.tsx

import { WritingEditorStyles as S } from "@/components/style/user/writing/WritingEditorStyles";
import { db } from "@/scripts/firebase";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function WritingEditorScreen() {
  const { id } = useLocalSearchParams();

  const insets = useSafeAreaInsets(); // 🔥 xử lý tai thỏ, giọt nước

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
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
        }}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          padding: 20,
          justifyContent: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <Text style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
          Không tìm thấy bài viết.
        </Text>
      </SafeAreaView>
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top, // 🛡 tránh tai thỏ iPhone
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            S.container,
            {
              paddingBottom: insets.bottom + 50, // 🛡 tránh giọt nước + nâng UI
              paddingTop: 10,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={S.label}>Bài viết của bạn</Text>

          <TextInput
            multiline
            style={[
              S.input,
              {
                paddingTop: 14,
                paddingBottom: 14,
                minHeight: 200, // tránh bị ép quá nhỏ
              },
            ]}
            value={text}
            onChangeText={setText}
            placeholder="Viết bài vào đây..."
            textAlignVertical="top"
          />

          <Text style={[S.count, tooFew && S.countWarn]}>
            {words} / {task.wordMax} từ
          </Text>

          <TouchableOpacity
            style={[S.submit, { marginBottom: 20 }]}
            onPress={submit}
          >
            <Text style={S.submitText}>Nộp bài</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
