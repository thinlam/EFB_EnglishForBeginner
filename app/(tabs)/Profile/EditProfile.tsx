// app/(tabs)/profile/EditProfile.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Firebase */
import { auth, db } from '@/scripts/firebase';
import {
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

/** Styles */
import { EditProfileStyles as S } from '@/components/style/EditProfile/Styles';

/* ---------- Cloudinary config ---------- */
const CLOUD_NAME = 'djf9vnngm';                  // change to your own cloud name
const UPLOAD_PRESET = 'upload_avatars_unsigned'; // unsigned upload preset for avatar
const CLOUD_FOLDER = 'avatars';                  // folder to store avatars
const USE_FIXED_PUBLIC_ID = false;               // true = use 'avatar_<uid>'

type UserDoc = {
  name?: string;
  bio?: string;
  photoURL?: string | null;
  email?: string | null;
  updatedAt?: any;
  createdAt?: any;
};

export default function EditProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState<string | null>(null);

  const [avatar, setAvatar] = useState<string | null>(null); // current avatar (local or url)
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState('');
  const [originalBio, setOriginalBio] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /** Load profile + listen to auth changes */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setLoading(false);
        Alert.alert('Notice', 'You need to sign in to edit your profile.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      setEmail(u.email ?? null);

      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const data = (snap.exists() ? snap.data() : {}) as UserDoc;

        const profileName = data.name ?? u.displayName ?? '';
        const profileBio = data.bio ?? '';
        const profilePhoto = data.photoURL ?? u.photoURL ?? null;

        setName(profileName);
        setBio(profileBio);
        setAvatar(profilePhoto);

        setOriginalName(profileName);
        setOriginalBio(profileBio);
        setOriginalAvatar(profilePhoto);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  /** Upload avatar to Cloudinary, return secure_url */
  const uploadAvatarToCloudinary = async (
    uri: string,
    publicId?: string
  ): Promise<string> => {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const rnFile: any = {
      uri,
      name: `avatar.${ext}`,
      type: 'image/jpeg',
    };

    const form = new FormData();
    form.append('file', rnFile as any);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', CLOUD_FOLDER);
    if (publicId) form.append('public_id', publicId);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.log('Cloudinary status:', resp.status);
      console.log('Cloudinary response:', text);
      throw new Error('Avatar upload failed, please try again.');
    }

    const json = await resp.json();
    return json.secure_url as string;
  };

  /** Pick avatar (new expo-image-picker API) */
  const onPickAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission denied',
            'We need access to your photo library to pick an avatar.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setAvatar(result.assets[0].uri); // local file → upload to Cloudinary on Save
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Unable to open photo library.');
    }
  };

  /** Check if there are unsaved changes */
  const hasChanges = useMemo(() => {
    if (!user || loading) return false;

    const n = name.trim();
    const b = bio.trim();
    if (!n) return false;

    return (
      n !== (originalName || '') ||
      b !== (originalBio || '') ||
      avatar !== originalAvatar
    );
  }, [user, loading, name, bio, avatar, originalName, originalBio, originalAvatar]);

  const handleSave = async () => {
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      Alert.alert('Missing information', 'Please enter a display name.');
      return;
    }

    setSaving(true);
    try {
      let finalPhotoURL: string | null = originalAvatar;

      if (avatar) {
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
          // already a remote / Cloudinary URL → keep as is
          finalPhotoURL = avatar;
        } else {
          // local file → upload to Cloudinary
          const publicId =
            USE_FIXED_PUBLIC_ID && user ? `avatar_${user.uid}` : undefined;
          finalPhotoURL = await uploadAvatarToCloudinary(avatar, publicId);
          setAvatar(finalPhotoURL); // update UI with remote URL
        }
      }

      // Update Auth profile
      await updateProfile(user, {
        displayName: trimmedName,
        photoURL: finalPhotoURL ?? undefined,
      });

      await auth.currentUser?.reload();
      setUser(auth.currentUser);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      const payload: UserDoc = {
        name: trimmedName,
        bio: trimmedBio,
        photoURL: finalPhotoURL ?? null,
        updatedAt: serverTimestamp(),
        email: user.email ?? email ?? null,
      };

      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, payload);
      } else {
        await setDoc(userRef, { ...payload, createdAt: serverTimestamp() });
      }

      // Sync original state
      setOriginalName(trimmedName);
      setOriginalBio(trimmedBio);
      setOriginalAvatar(finalPhotoURL ?? null);

      Alert.alert('Success', 'Your profile has been updated.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={S.container}>
        <View style={[S.body, S.centerContent]}>
          <ActivityIndicator />
          <Text style={S.mutedText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={S.body}
      >
        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={S.headerTextWrap}>
            <Text style={S.headerTitle}>Edit profile</Text>
            <Text style={S.headerSubtitle}>
              Update how your account looks to others.
            </Text>
          </View>

          {/* empty view for layout balance */}
          <View style={S.iconBtn} />
        </View>

        <ScrollView
          style={S.scroll}
          contentContainerStyle={S.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={S.avatarSection}>
            <TouchableOpacity
              onPress={onPickAvatar}
              style={S.avatarOuter}
              activeOpacity={0.9}
            >
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
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text style={S.avatarHint}>Tap to change your profile picture</Text>
          </View>

          {/* Content card */}
          <View style={S.card}>
            {/* Email (read-only) */}
            {email && (
              <View style={S.formGroup}>
                <Text style={S.label}>Email</Text>
                <View style={[S.input, S.inputReadOnly]} pointerEvents="none">
                  <Text style={S.mutedText}>{email}</Text>
                </View>
              </View>
            )}

            {/* Display name */}
            <View style={S.formGroup}>
              <Text style={S.label}>Display name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Jenny Tran"
                placeholderTextColor="#9CA3AF"
                style={S.input}
                returnKeyType="next"
              />
            </View>

            {/* Bio */}
            <View style={S.formGroup}>
              <View style={S.labelRow}>
                <Text style={S.label}>Bio</Text>
                <Text style={S.labelHelper}>Optional</Text>
              </View>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Write a short introduction about yourself…"
                placeholderTextColor="#9CA3AF"
                style={[S.input, S.textarea]}
                multiline
              />
            </View>

            {/* Hint */}
            <Text style={S.helperText}>
              A clear profile helps you look more professional and memorable.
            </Text>
          </View>

          {/* Footer buttons */}
          <View style={S.footer}>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={saving}
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
                <ActivityIndicator color="#FFFFFF" />
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
