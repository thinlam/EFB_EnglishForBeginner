// hooks/tab/useCrossPlatformRecorder.ts
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export function useCrossPlatformRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // === WEB ===
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webChunksRef = useRef<Blob[]>([]);
  const lastWebBlob = useRef<Blob | null>(null);

  // === MOBILE ===
  const mobileRef = useRef<Audio.Recording | null>(null);
  const lastMobileUri = useRef<string | null>(null);

  // timer
  useEffect(() => {
    let t: any;
    if (isRecording) {
      t = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  // start
  async function startRecording() {
    setSeconds(0);

    if (Platform.OS === "web") {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const MR = (window as any).MediaRecorder;
      const rec = new MR(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = rec;
      webChunksRef.current = [];
      lastWebBlob.current = null;

      rec.ondataavailable = (e: any) => {
        if (e.data.size > 0) webChunksRef.current.push(e.data);
      };

      rec.start();
      setIsRecording(true);
      return;
    }

    // mobile
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();

    mobileRef.current = rec;
    lastMobileUri.current = null;

    setIsRecording(true);
  }

  // stop
  async function stopRecording() {
    setIsRecording(false);

    if (Platform.OS === "web") {
      const rec = mediaRecorderRef.current;
      if (!rec) return null;

      return new Promise<{ blob: Blob } | null>((resolve) => {
        rec.onstop = () => {
          const blob = new Blob(webChunksRef.current, { type: "audio/webm" });
          lastWebBlob.current = blob;
          resolve({ blob });
        };
        rec.stop();
      });
    }

    // mobile
    const rec = mobileRef.current;
    if (!rec) return null;

    await rec.stopAndUnloadAsync();
    const uri = rec.getURI();
    lastMobileUri.current = uri ?? null;

    return uri ? { uri } : null;
  }

  return {
    isRecording,
    seconds,
    startRecording,
    stopRecording,
    lastWebBlob,
    lastMobileUri,
  };
}
