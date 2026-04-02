import { getUserById, updateUser } from '@/services/admin/userAdminService';
import type { UserAdmin } from '@/types/admin/user';
import React from 'react';
import { Alert } from 'react-native';

type Form = { name: string; email: string; role: string; phone: string };

export function useUserDetail(userId?: string) {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<UserAdmin | null>(null);
  const [form, setForm] = React.useState<Form>({
    name: '', email: '', role: '', phone: '',
  });

  React.useEffect(() => {
    (async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const u = await getUserById(userId);
        setUser(u);
        setForm({
          name: u?.name ?? '',
          email: u?.email ?? '',
          role: (u?.role as string) ?? '',
          phone: (u as any)?.phone ?? (u as any)?.number ?? '',
        });
      } catch (e) {
        console.error('Lỗi khi lấy chi tiết người dùng:', e);
        Alert.alert('Lỗi', 'Không thể tải chi tiết người dùng.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const setField = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    if (!userId) return false;
    // Validate nhẹ
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ.');
      return false;
    }
    try {
      // merge để không mất các field khác
      await updateUser(userId, {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone,
      });
      return true;
    } catch (e) {
      console.error('Lỗi khi cập nhật thông tin:', e);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật thông tin.');
      return false;
    }
  };

  return { loading, user, form, setField, handleSave };
}
