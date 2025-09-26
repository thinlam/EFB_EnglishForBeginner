import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";

const CLOUD_NAME = 'djf9vnngm';
const UPLOAD_PRESET = 'upload_avatars_unsigned';
const CLOUD_FOLDER = 'avatars';
const USE_FIXED_PUBLIC_ID = false; // Sử dụng thư mục trong Cloudinary
export default function EditProfileScreen() {
    const router = useRouter();
    const {user} = useAuth();
    const [displayName , setDisplayName] = useState(user?.displayName || '');
    const [bio , setBio] = useState(user?.bio || '');
    const [photoURL , setPhotoURL] = useState(user?.photoURL || '');
    const [loading , setLoading] = useState(false);
    
    //pick image from device
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if(!result.canceled){
            setPhotoURL(result.assets [0]. uri);
        }
    };
    // upload avatar to cloudinary
   const uploadAvatarToCloudinary = async (uri: string, publicId?: string): Promise<string> => {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const rnFile: any = { uri, name: `avatar.${ext}`, type: 'image/jpeg' };

    const form = new FormData();
    form.append('file', rnFile as any);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', CLOUD_FOLDER);
    if (publicId) form.append('public_id', publicId);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const resp = await fetch(endpoint, { method: 'POST', body: form });

    if (!resp.ok) {
      const text = await resp.text();
      console.log('Cloudinary status:', resp.status);
      console.log('Cloudinary response:', text);
      throw new Error(`Cloudinary upload failed: ${resp.status}`);
    }

    const json = await resp.json();
    return json.secure_url as string;
  };

  //save profile changes
  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      alert('Tên hiển thị không được để trống');
      return;
    }
    setLoading(true);
    try {
      let finalPhotoURL = photoURL;
      if (photoURL && photoURL !== user.photoURL) {
        const publicId = USE_FIXED_PUBLIC_ID ? `user_${user.id}` : undefined;
        finalPhotoURL = await uploadAvatarToCloudinary(photoURL, publicId);
      }
      await user.updateProfile({ displayName: displayName.trim(), photoURL: finalPhotoURL, bio: bio.trim() });
      router.back();
    } catch (e) {
      console.error('Lỗi khi cập nhật hồ sơ:', e);
      alert('Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  

}



