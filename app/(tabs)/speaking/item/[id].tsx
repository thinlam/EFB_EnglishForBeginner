// app/(tabs)/speaking/item/[id].tsx

import { useCrossPlatformRecorder } from "@/hooks/tab/useCrossPlatformRecorder";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Platform, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SpeakingItem() {
  const router = useRouter();

  const { 
    isRecording, 
    seconds, 
    startRecording, 
    stopRecording,
    lastWebBlob,
    lastMobileUri
  } = useCrossPlatformRecorder();

  const mobilePlayRef = useRef<Audio.Sound | null>(null);

  async function playAudio() {
    try {
      /** WEB */
      if (Platform.OS === "web") {
        if (!lastWebBlob.current) return;

        const url = URL.createObjectURL(lastWebBlob.current);
        const audio = new window.Audio(url);
        audio.play();
        return;
      }

      /** MOBILE */
      if (mobilePlayRef.current) {
        await mobilePlayRef.current.stopAsync();
        await mobilePlayRef.current.unloadAsync();
      }

      if (!lastMobileUri.current) return;

      const { sound } = await Audio.Sound.createAsync({
        uri: lastMobileUri.current,
      });

      mobilePlayRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Play error", e);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Text style={{ color: "white", fontSize: 24, marginTop: 20 }}>
          Demo Speaking Ngày 24
        </Text>

        <Text style={{ color: "white", marginTop: 20 }}>
          Thời gian: {seconds}s
        </Text>

        <TouchableOpacity
          onPress={() => (isRecording ? stopRecording() : startRecording())}
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: "#6366f1",
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Ionicons
            name={isRecording ? "stop-circle" : "mic-circle"}
            size={28}
            color="white"
          />
          <Text style={{ color: "white", marginLeft: 8 }}>
            {isRecording ? "Dừng" : "Bắt đầu nói"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playAudio}
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#1e293b",
            borderRadius: 999,
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <Ionicons name="play" size={20} color="white" />
          <Text style={{ color: "white", marginLeft: 6 }}>Nghe lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
