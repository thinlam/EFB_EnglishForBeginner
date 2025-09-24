import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 24 },
  centerWrap: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10, fontSize: 16,
    shadowColor: '#ccc', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2, marginBottom: 12,
  },
  helper: { color: '#888', marginBottom: 16, fontSize: 13 },
  otpLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#444' },
  otpInput: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10, fontSize: 16,
    letterSpacing: 4, shadowColor: '#ccc', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2, marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#6C63FF', paddingVertical: 14, borderRadius: 10,
    shadowColor: '#6C63FF', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4, marginBottom: 10,
  },
  primaryBtnText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  backLink: { color: '#6C63FF', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
});

