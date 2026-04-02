import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 80 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 10, marginTop: 6, backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    marginTop: 6, marginBottom: 12, overflow: 'hidden',
  },
  picker: { height: 120, backgroundColor: '#f9fafb' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 12, marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  success: { marginTop: 16, color: 'green', fontSize: 14 },
  link: { marginTop: 8, color: '#2563eb', textDecorationLine: 'underline', fontSize: 14 },
});
