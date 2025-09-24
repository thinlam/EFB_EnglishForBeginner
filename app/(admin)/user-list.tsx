import { styles } from '@/components/style/UserListStyles';
import useUserList from '@/hooks/admin/useUserList'; //Import đúng kiểu bạn đã export

import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserListScreen() {
  const router = useRouter();
  const {
    loading,
    // data (đã phân trang)
    paginatedUsers,
    // filter & search
    searchQuery, setSearchQuery,
    roleFilter, setRoleFilter,
    // pagination
    currentPage, itemsPerPage, totalAfterFilter, toPrevPage, toNextPage,
    // actions
    handleViewDetail, openRoleModal, handleDelete,
    // modal
    showModal, closeModal, selectedUser, newRole, setNewRole, submitNewRole,
  } = useUserList({ onViewDetail: (u) => router.push({ pathname: '/(admin)/user-detail', params: { id: u.id } }) });

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const disableNext = currentPage * itemsPerPage >= totalAfterFilter;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Danh sách người dùng</Text>

        {/* Search */}
        <TextInput
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

        {/* Role filter */}
        <View style={styles.roleFilterContainer}>
          {['all', 'user', 'premium', 'Maxpremium'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleButton, roleFilter === role && { backgroundColor: '#6366F1' }]}
              onPress={() => setRoleFilter(role as any)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{role.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={paginatedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name || 'Chưa đặt tên'}</Text>
              <Text>Email: {item.email || '—'}</Text>
              <Text>Role: {item.role || 'user'}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#6366F1' }]}
                  onPress={() => handleViewDetail(item)}
                >
                  <Text style={styles.buttonText}>Chi tiết</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'orange' }]}
                  onPress={() => openRoleModal(item)}
                >
                  <Text style={styles.buttonText}>Sửa Role</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'red' }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={toPrevPage}
            style={[styles.pageButton, currentPage === 1 && { backgroundColor: '#ccc' }]}
          >
            <Text style={styles.buttonText}>⬅ Trước</Text>
          </TouchableOpacity>

          <Text style={{ marginHorizontal: 10, fontWeight: 'bold' }}>
            Trang {currentPage}
          </Text>

          <TouchableOpacity
            disabled={disableNext}
            onPress={toNextPage}
            style={[styles.pageButton, disableNext && { backgroundColor: '#ccc' }]}
          >
            <Text style={styles.buttonText}>Tiếp ➡</Text>
          </TouchableOpacity>
        </View>

        {/* Back to admin home */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#999', marginTop: 20, alignSelf: 'center' }]}
          onPress={() => router.push('/(admin)/home')}
        >
          <Text style={styles.buttonText}>⬅ Quay về Trang Admin</Text>
        </TouchableOpacity>

        {/* Modal: đổi role */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                Sửa role cho {selectedUser?.name || selectedUser?.email}
              </Text>
              <TextInput
                placeholder="Nhập role mới"
                value={newRole}
                onChangeText={setNewRole}
                style={styles.modalInput}
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'green' }]}
                  onPress={submitNewRole}
                >
                  <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'gray' }]}
                  onPress={closeModal}
                >
                  <Text style={styles.buttonText}>Huỷ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
