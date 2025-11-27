// app/test-upload.tsx
import { storage } from "@/scripts/firebase";
import { ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function TestUpload() {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      setLoading(true);

      // fake blob
      const blob = new Blob(["hello firebase"], { type: "text/plain" });

      const fileRef = ref(storage, `test/${Date.now()}.txt`);
      await uploadBytes(fileRef, blob);

      alert("Upload OK!");
    } catch (e) {
      console.log("Upload error:", e);
      alert("Upload FAILED. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#020617",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ color: "white", fontSize: 22, marginBottom: 20 }}>
        🔥 Test Upload Firebase
      </Text>

      <TouchableOpacity
        onPress={handleUpload}
        style={{
          backgroundColor: "#4f46e5",
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 10,
        }}
        disabled={loading}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          {loading ? "Uploading..." : "Upload file"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}
