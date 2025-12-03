// app/speaking/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthProfile } from "@/hooks/tab/useAuthProfile";
import { db } from "@/scripts/firebase";

type CEFR = "A1" | "A2" | "B1" | "B2" | "C1";

type SpeakingType = "repeat" | "qa" | "dialogue" | "monologue";

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

type SpeakingLesson = {
  id: string;
  title: string;
  prompt?: string;
  sampleAnswer?: string;
  audioUrl?: string;
  level: CEFR;
  topic: Topic;
  type: SpeakingType;
  createdAt?: Date | null;
};

const LEVELS: (CEFR | "ALL")[] = ["ALL", "A1", "A2", "B1", "B2", "C1"];

function cefrColor(level: CEFR) {
  switch (level) {
    case "A1":
      return "#6366f1";
    case "A2":
      return "#22c55e";
    case "B1":
      return "#0ea5e9";
    case "B2":
      return "#f59e0b";
    case "C1":
      return "#a855f7";
    default:
      return "#6b7280";
  }
}

function snippet(s?: string, max = 80) {
  if (!s) return "";
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > max ? one.slice(0, max) + "…" : one;
}

export default function SpeakingListScreen() {
  const router = useRouter();
  const { level: userLevel } = useAuthProfile() || {};

  const [items, setItems] = useState<SpeakingLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterLevel, setFilterLevel] = useState<CEFR | "ALL">("ALL");

  // auto-level filter
  useEffect(() => {
    if (userLevel && ["A1", "A2", "B1", "B2", "C1"].includes(userLevel)) {
      setFilterLevel(userLevel as CEFR);
    }
  }, [userLevel]);

  // fetch lessons
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const colRef = collection(db, "speaking_lessons");
      const q = query(colRef, orderBy("createdAt", "desc"));

      const snap = await getDocs(q);
      const data: SpeakingLesson[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          title: raw.title ?? "(No title)",
          prompt: raw.prompt ?? "",
          sampleAnswer: raw.sampleAnswer ?? "",
          audioUrl: raw.audioUrl ?? "",
          level: raw.level ?? "A1",
          topic: raw.topic ?? "Daily Life",
          type: raw.type ?? "repeat",
          createdAt:
            raw.createdAt instanceof Timestamp
              ? raw.createdAt.toDate()
              : null,
        };
      });

      setItems(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    const text = searchText.toLowerCase();

    return items.filter((it) => {
      const matchLevel =
        filterLevel === "ALL" ? true : it.level === filterLevel;
      const matchSearch =
        !text ||
        it.title.toLowerCase().includes(text) ||
        it.prompt?.toLowerCase().includes(text) ||
        it.topic?.toLowerCase().includes(text);

      return matchLevel && matchSearch;
    });
  }, [items, searchText, filterLevel]);

  const handleOpen = (id: string) => {
    router.push(`/speaking/item/${id}`);
  };

  const renderItem = ({ item }: { item: SpeakingLesson }) => {
    return (
      <TouchableOpacity
        onPress={() => handleOpen(item.id)}
        activeOpacity={0.85}
        style={{
          width: "92%",
          alignSelf: "center",
          backgroundColor: "white",
          padding: 16,
          borderRadius: 16,
          marginBottom: 14,
          borderColor: "#e5e7eb",
          borderWidth: 1,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 12,
              backgroundColor: "#f1f5f9",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="mic-outline" size={22} color="#475569" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#0f172a" }}>
              {item.title}
            </Text>
            <Text
              style={{
                marginTop: 2,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              {item.topic} • {item.type}
            </Text>

            {/* Level pill */}
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: cefrColor(item.level) + "22",
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: cefrColor(item.level),
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {item.level}
                </Text>
              </View>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* HEADER */}
      <View
        style={{
          paddingTop: 12,
          paddingBottom: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
          SPEAKING • {filterLevel === "ALL" ? "ALL" : filterLevel}
        </Text>
      </View>

      {/* SEARCH */}
      <View
        style={{
          width: "92%",
          alignSelf: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            placeholder="Tìm bài nói..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: "#0f172a",
            }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4f46e5" />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}
