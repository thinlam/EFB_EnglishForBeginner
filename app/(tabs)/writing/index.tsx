// app/(tabs)/writing/index.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthProfile } from "@/hooks/tab/useAuthProfile";
import { db } from "@/scripts/firebase";

// ⭐ ĐÚNG đường dẫn
import { WritingListStyles as S } from "@/components/style/user/writing/WritingListStyles";

type CEFR = "A1" | "A2" | "B1" | "B2" | "C1";
type Topic =
  | "Work & Office"
  | "Travel & Transport"
  | "Daily Life"
  | "Shopping & Service"
  | "Education"
  | "Technology"
  | "Entertainment"
  | "Health & Food"
  | "Business";

type Writing = {
  id: string;
  title: string;
  prompt: string;
  imageUrl?: string;
  topic?: Topic;
  level?: CEFR;
  wordMin?: number;
  wordMax?: number;
  createdAt?: Date | null;
};

export default function WritingListScreen() {
  const router = useRouter();
  const { level: userLevel } = useAuthProfile();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Writing[]>([]);

  useEffect(() => {
    const qBase = query(
      collection(db, "writing_lessons"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(qBase, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          title: raw.title ?? "",
          prompt: raw.prompt ?? "",
          imageUrl: raw.imageUrl ?? "",
          topic: raw.topic,
          level: raw.level,
          wordMin: raw.wordMin,
          wordMax: raw.wordMax,
          createdAt:
            raw.createdAt instanceof Timestamp
              ? raw.createdAt.toDate()
              : null,
        };
      });

      setItems(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!userLevel) return items;
    return items.filter((it) => it.level === userLevel);
  }, [items, userLevel]);

  const Card = ({ item }: { item: Writing }) => (
    <Pressable
      style={S.card}
      onPress={() =>
        router.push({
          pathname: "/writing/detail",
          params: { id: item.id },
        })
      }
    >
      {item.imageUrl ? (
        <View style={S.thumbWrap}>
          <Image source={{ uri: item.imageUrl }} style={S.thumb} />
        </View>
      ) : (
        <View style={S.thumbPlaceholder}>
          <Ionicons name="image-outline" size={28} color="#9CA3AF" />
        </View>
      )}

      <Text style={S.title} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={S.row}>
        <Text style={S.topic}>{item.topic || "General"}</Text>
        <View style={S.levelBadge}>
          <Text style={S.levelText}>{item.level}</Text>
        </View>
      </View>

      {item.wordMin && (
        <Text style={S.words}>
          {item.wordMin} – {item.wordMax} từ
        </Text>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={S.screen}>
      <View style={S.header}>
        <Text style={S.headerTitle}>WRITING • {userLevel ?? "All"}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} />}
          contentContainerStyle={S.list}
        />
      )}
    </SafeAreaView>
  );
}
