import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
 