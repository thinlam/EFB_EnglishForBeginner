import { db } from '@/scripts/firebase';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const roleFilteredUsers =
    roleFilter === 'all'
      ? filteredUsers
      : filteredUsers.filter(user => user.role === roleFilter);

  const paginatedUsers = roleFilteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (user) => {
    router.push({
      pathname: '/(admin)/user-detail',
      params: { id: user.id },
    });
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || '');
    setShowModal(true);
  };

  const handleSubmitNewRole = async () => {
    if (!newRole.trim()) return;
    try {
      await setDoc(doc(db, 'users', selectedUser.id), {
        ...selectedUser,
        role: newRole.trim(),
      });
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert('Lỗi khi cập nhật role');
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    } catch (e) {
      alert('Lỗi khi xoá người dùng.');
      console.error(e);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Danh sách người dùng</Text>

        <TextInput
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

        <View style={styles.roleFilterContainer}>
          {['all', 'user', 'premium','Maxpremium'].map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                roleFilter === role && { backgroundColor: '#6366F1' }
              ]}
              onPress={() => {
                setRoleFilter(role);
                setCurrentPage(1);
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{role.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={paginatedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name || 'Chưa đặt tên'}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Role: {item.role}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#6366F1' }]}
                  onPress={() => handleViewDetail(item)}
                >
                  <Text style={styles.buttonText}>Chi tiết</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'orange' }]}
                  onPress={() => handleChangeRole(item)}
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

        {/* Phân trang */}
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            style={[styles.pageButton, currentPage === 1 && { backgroundColor: '#ccc' }]}
          >
            <Text style={styles.buttonText}>⬅ Trước</Text>
          </TouchableOpacity>

          <Text style={{ marginHorizontal: 10, fontWeight: 'bold' }}>
            Trang {currentPage}
          </Text>

          <TouchableOpacity
            disabled={currentPage * itemsPerPage >= roleFilteredUsers.length}
            onPress={() => setCurrentPage(prev => prev + 1)}
            style={[
              styles.pageButton,
              currentPage * itemsPerPage >= roleFilteredUsers.length && { backgroundColor: '#ccc' },
            ]}
          >
            <Text style={styles.buttonText}>Tiếp ➡</Text>
          </TouchableOpacity>
        </View>

        {/* 🔙 Nút quay về trang admin */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#999', marginTop: 20, alignSelf: 'center' }]}
          onPress={() => router.push('/(admin)/home')}
        >
          <Text style={styles.buttonText}>⬅ Quay về Trang Admin</Text>
        </TouchableOpacity>

        {/* Modal sửa role */}
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
                  onPress={handleSubmitNewRole}
                >
                  <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: 'gray' }]}
                  onPress={() => setShowModal(false)}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchInput: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 15,
  },
  roleFilterContainer: {
    flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 10,
  },
  roleButton: {
    backgroundColor: '#aaa', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  card: {
    padding: 15, marginBottom: 12, backgroundColor: '#f2f2f2', borderRadius: 10,
  },
  name: { fontWeight: 'bold', fontSize: 18 },
  actions: { flexDirection: 'row', marginTop: 10, gap: 10 },
  button: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  pagination: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 10,
  },
  pageButton: {
    backgroundColor: '#6366F1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
  },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', elevation: 5,
  },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10,
  },
});
