// app/(tabs)/writing/detail.tsx

import { WritingDetailStyles as S } from "@/components/style/user/writing/WritingDetailStyles";
import { db } from "@/scripts/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function WritingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSample, setShowSample] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "writing_lessons", String(id)));
        if (snap.exists()) setTask(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  // ========= LOADING =========
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
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
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 17, marginBottom: 16 }}>
          Không tìm thấy bài Writing.
        </Text>

        <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
          <Text style={S.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 50,
        }}
      >

        {/* ================= HEADER HERO ================= */}
        <View style={S.heroContainer}>
          <Image source={{ uri: task.imageUrl }} style={S.heroImage} />

          <View style={S.heroOverlay} />
          <Text style={S.heroTitle}>{task.title}</Text>
        </View>

        {/* ================= CONTENT AREA ================= */}
        <View style={S.contentCard}>
          {/* Prompt */}
          <Text style={S.sectionLabel}>Prompt</Text>
          <Text style={S.sectionText}>{task.prompt}</Text>

          {/* Tips */}
          {task.writingTips && (
            <>
              <Text style={S.sectionLabel}>Gợi ý</Text>
              <Text style={S.tipsText}>{task.writingTips}</Text>
            </>
          )}

          {/* Sample */}
          <TouchableOpacity
            onPress={() => setShowSample(!showSample)}
            style={S.sampleBtn}
          >
            <Text style={S.sampleBtnText}>
              {showSample ? "Ẩn sample" : "Xem sample"}
            </Text>
          </TouchableOpacity>

          {showSample && (
            <View style={S.sampleCard}>
              <Text style={S.sampleText}>
                {task.sampleAnswer || "Không có sample."}
              </Text>
            </View>
          )}

          {/* Start Button */}
          <TouchableOpacity
            style={S.ctaBtn}
            onPress={() =>
              router.push({
                pathname: "/writing/editor",
                params: { id },
              })
            }
          >
            <Text style={S.ctaText}>Bắt đầu viết</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
