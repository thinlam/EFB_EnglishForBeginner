// hooks/admin/useUserList.ts
import { deleteUserById, listUsers, updateUserRole } from '@/services/admin/userAdminService';
import type { UserAdmin } from '@/types/admin/user';
import React from 'react';
import { Alert } from 'react-native';

type Opts = { onViewDetail?: (u: UserAdmin) => void; itemsPerPage?: number };

export function useUserList(opts: Opts = {}) {
  const itemsPerPage = opts.itemsPerPage ?? 5;
  const [users, setUsers] = React.useState<UserAdmin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'user' | 'premium' | 'Maxpremium'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  const [showModal, setShowModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserAdmin | null>(null);
  const [newRole, setNewRole] = React.useState('');

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await listUsers();
      setUsers(list);
    } catch (e) {
      console.error('Lỗi khi lấy danh sách người dùng:', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(u => {
      const matchText = (u.name?.toLowerCase() || '').includes(q) || (u.email?.toLowerCase() || '').includes(q);
      const matchRole = roleFilter === 'all' ? true : (u.role === roleFilter);
      return matchText && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalAfterFilter = filteredUsers.length;
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleViewDetail = (u: UserAdmin) => opts.onViewDetail?.(u);

  const openRoleModal = (u: UserAdmin) => { setSelectedUser(u); setNewRole(u.role || ''); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const submitNewRole = async () => {
    if (!selectedUser) return;
    if (!newRole.trim()) return;
    try {
      await updateUserRole(selectedUser.id, newRole.trim());
      setShowModal(false);
      await fetchUsers();
    } catch (e) {
      Alert.alert('Lỗi', 'Lỗi khi cập nhật role');
      console.error(e);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUserById(userId);
      await fetchUsers();
    } catch (e) {
      Alert.alert('Lỗi', 'Lỗi khi xoá người dùng.');
      console.error(e);
    }
  };

  const toPrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
  const toNextPage = () => { if (currentPage * itemsPerPage < totalAfterFilter) setCurrentPage(p => p + 1); };

  // reset page khi đổi filter/search
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter]);

  return {
    loading,
    paginatedUsers,
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    currentPage, itemsPerPage, totalAfterFilter, toPrevPage, toNextPage,
    handleViewDetail, openRoleModal, handleDelete,
    showModal, closeModal, selectedUser, newRole, setNewRole, submitNewRole,
  };
}

export default useUserList;
