import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Firebase */
import { auth, db, storage } from "@/scripts/firebase";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/** Styles */
import { EditProfileStyles as S } from "@/components/style/EditProfile/Styles";

type UserDoc = {
  name?: string;
  bio?: string;
  photoURL?: string;
  email?: string | null;
  updatedAt?: any;
  createdAt?: any;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /** Tải hồ sơ ban đầu */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để chỉnh sửa hồ sơ.");
        router.back();
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = (snap.exists() ? snap.data() : {}) as UserDoc;
        if (!mounted) return;

        const profileName = data.name ?? user.displayName ?? "";
        const profileBio = data.bio ?? "";
        const profilePhoto = data.photoURL ?? user.photoURL ?? null;

        setName(profileName);
        setBio(profileBio);
        setAvatar(profilePhoto);
        setOriginalAvatar(profilePhoto);
      } catch (e: any) {
        Alert.alert("Lỗi", e?.message ?? "Không thể tải hồ sơ.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user, router]);

  /** Xin quyền & chọn ảnh (API mới: mediaTypes là mảng MediaType) */
  const onPickAvatar = async () => {
    try {
      // iOS & Android cần xin quyền; web tự mở file picker
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Quyền bị từ chối", "Cần quyền truy cập thư viện ảnh để chọn avatar.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.image],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message ?? "Không thể mở thư viện ảnh.");
    }
  };

  /** Upload avatar lên Firebase Storage (nếu là file cục bộ) */
  const uploadAvatarIfNeeded = async (uri: string | null): Promise<string | null> => {
    if (!uri || !user) return uri;

    // Nếu đã là URL http(s) (đã up), khỏi up lại
    if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;

    // Nếu là file local → upload
    const res = await fetch(uri);
    const blob = await res.blob();
    const storageRef = ref(storage, `avatars/${user.uid}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate đơn giản
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên hiển thị.");
      return;
    }

    setSaving(true);
    try {
      const photoURL = await uploadAvatarIfNeeded(avatar);

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      const payload: UserDoc = {
        name: trimmedName,
        bio: bio.trim(),
        photoURL: photoURL ?? null,
        updatedAt: serverTimestamp(),
        email: user.email ?? null,
      };

      if (snap.exists()) {
        await updateDoc(userRef, payload);
      } else {
        await setDoc(userRef, { ...payload, createdAt: serverTimestamp() });
      }

      Alert.alert("✅ Thành công", "Hồ sơ đã được cập nhật.");
      router.back();
    } catch (e: any) {
      Alert.alert("❌ Lỗi", e?.message ?? "Cập nhật hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const changed =
    name.trim() !== "" &&
    (name.trim() !== "" &&
      (name.trim() !== "" || bio.trim() !== "")) &&
    (name.trim() !== "" || bio.trim() !== "" || avatar !== originalAvatar);

  if (loading) {
    return (
      <SafeAreaView style={S.container}>
        <View style={[S.body, { alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator />
          <Text style={S.mutedText}>Đang tải hồ sơ…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={S.body}
      >
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.iconBtn}>
            <Ionicons name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text style={S.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={S.iconBtn} />
        </View>

        {/* Avatar */}
        <TouchableOpacity onPress={onPickAvatar} style={S.avatarWrap} activeOpacity={0.8}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={S.avatar} />
          ) : (
            <View style={[S.avatar, S.avatarPlaceholder]}>
              <Ionicons name="person" size={48} />
            </View>
          )}
          <View style={S.camBadge}>
            <Ionicons name="pencil" size={14} />
          </View>
        </TouchableOpacity>

        {/* Form */}
        <View style={S.formGroup}>
          <Text style={S.label}>Tên hiển thị</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ví dụ: Jenny Tran"
            placeholderTextColor="#9aa0a6"
            style={S.input}
            returnKeyType="next"
          />
        </View>

        <View style={S.formGroup}>
          <Text style={S.label}>Giới thiệu</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Giới thiệu ngắn gọn về bạn…"
            placeholderTextColor="#9aa0a6"
            style={[S.input, S.textarea]}
            multiline
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !name.trim()}
          style={[S.primaryBtn, (saving || !name.trim()) && S.btnDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={S.primaryBtnText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
