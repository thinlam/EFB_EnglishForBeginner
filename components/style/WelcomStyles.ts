import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
 logo: {
  width: 200,
  height: 200,
  borderRadius: 12, // bo nhẹ 12px
  marginBottom: 20,
}
,
  content: {
    marginTop: 20, // kéo cụm chữ + nút xuống
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4F46E5',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    letterSpacing: 1,
    color: '#999',
  },
  button: {
    marginTop: 30,
    width: 220,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
