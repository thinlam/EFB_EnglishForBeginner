// app/(tabs)/profile/EditProfile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Firebase */
import { auth, db, storage } from "@/scripts/firebase";
import {
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/** Styles */
import { EditProfileStyles as S } from "@/components/style/EditProfile/Styles";

type UserDoc = {
  name?: string;
  bio?: string;
  photoURL?: string | null;
  email?: string | null;
  updatedAt?: any;
  createdAt?: any;
};

// =========================================
// UPLOAD AVATAR TO FIREBASE STORAGE (web + mobile)
// =========================================
const uploadAvatarToFirebase = async (uri: string, uid: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const avatarRef = ref(
    storage,
    `avatars/${uid}/avatar_${Date.now()}.jpg`
  );

  await uploadBytes(avatarRef, blob);
  return await getDownloadURL(avatarRef);
};

// =========================================
// MAIN SCREEN
// =========================================
export default function EditProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState("");
  const [originalBio, setOriginalBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================
  // LOAD PROFILE
  // =========================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setLoading(false);
        Alert.alert("Notice", "You must login to edit profile", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      setEmail(u.email ?? null);

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = (snap.exists() ? snap.data() : {}) as UserDoc;

        const profileName = data.name ?? u.displayName ?? "";
        const profileBio = data.bio ?? "";
        const profilePhoto = data.photoURL ?? u.photoURL ?? null;

        setName(profileName);
        setBio(profileBio);
        setAvatar(profilePhoto);

        setOriginalName(profileName);
        setOriginalBio(profileBio);
        setOriginalAvatar(profilePhoto);
      } catch (err: any) {
        Alert.alert("Error", err.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // =========================================
  // PICK AVATAR
  // =========================================
  const onPickAvatar = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          return Alert.alert(
            "Permission denied",
            "Allow access to photos to change avatar."
          );
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // =========================================
  // CHECK UNSAVED CHANGES
  // =========================================
  const hasChanges = useMemo(() => {
    if (!user || loading) return false;
    return (
      name.trim() !== originalName ||
      bio.trim() !== originalBio ||
      avatar !== originalAvatar
    );
  }, [name, bio, avatar, originalName, originalBio, originalAvatar]);

  // =========================================
  // SAVE PROFILE
  // =========================================
  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      return Alert.alert("Missing info", "Please enter your name.");
    }

    setSaving(true);
    try {
      let finalPhotoURL: string | null = originalAvatar;

      // upload new avatar if changed
      if (avatar) {
        const isRemote = avatar.startsWith("http");
        if (!isRemote) {
          finalPhotoURL = await uploadAvatarToFirebase(avatar, user.uid);
          setAvatar(finalPhotoURL);
        } else {
          finalPhotoURL = avatar;
        }
      }

      // Update Firebase Auth
      await updateProfile(user, {
        displayName: name.trim(),
        photoURL: finalPhotoURL ?? undefined,
      });

      await auth.currentUser?.reload();
      setUser(auth.currentUser);

      // Update Firestore
      const refUser = doc(db, "users", user.uid);
      const payload: UserDoc = {
        name: name.trim(),
        bio: bio.trim(),
        photoURL: finalPhotoURL,
        email: email,
        updatedAt: serverTimestamp(),
      };

      const snap = await getDoc(refUser);
      if (snap.exists()) {
        await updateDoc(refUser, payload);
      } else {
        await setDoc(refUser, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      // sync local original values
      setOriginalName(name);
      setOriginalBio(bio);
      setOriginalAvatar(finalPhotoURL);

      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================
  if (loading) {
    return (
      <SafeAreaView style={S.container}>
        <View style={[S.body, S.centerContent]}>
          <ActivityIndicator />
          <Text style={S.mutedText}>Loading…</Text>
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
        {/* HEADER */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={S.headerTextWrap}>
            <Text style={S.headerTitle}>Edit Profile</Text>
            <Text style={S.headerSubtitle}>
              Update how your account looks.
            </Text>
          </View>

          <View style={S.iconBtn} />
        </View>

        {/* BODY */}
        <ScrollView
          style={S.scroll}
          contentContainerStyle={S.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* AVATAR */}
          <View style={S.avatarSection}>
            <TouchableOpacity onPress={onPickAvatar} style={S.avatarOuter}>
              <View style={S.avatarBorder}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={S.avatar} />
                ) : (
                  <View style={[S.avatar, S.avatarPlaceholder]}>
                    <Ionicons name="person" size={40} color="#9CA3AF" />
                  </View>
                )}
              </View>

              <View style={S.camBadge}>
                <Ionicons name="pencil" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={S.avatarHint}>
              Tap to change your profile picture
            </Text>
          </View>

          {/* FORM */}
          <View style={S.card}>
            {/* Email */}
            {email && (
              <>
                <Text style={S.label}>Email</Text>
                <View style={[S.input, S.inputReadOnly]}>
                  <Text style={S.mutedText}>{email}</Text>
                </View>
              </>
            )}

            {/* Name */}
            <View style={S.formGroup}>
              <Text style={S.label}>Display name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                style={S.input}
                returnKeyType="next"
              />
            </View>

            {/* Bio */}
            <View style={S.formGroup}>
              <Text style={S.label}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell something about yourself…"
                placeholderTextColor="#9CA3AF"
                style={[S.input, S.textarea]}
                multiline
              />
            </View>
          </View>

          {/* FOOTER */}
          <View style={S.footer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[S.secondaryBtn, saving && S.btnDisabled]}
            >
              <Text style={S.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !hasChanges}
              style={[
                S.primaryBtn,
                (saving || !hasChanges) && S.btnDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={S.primaryBtnText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
