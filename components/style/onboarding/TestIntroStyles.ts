import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '80%',
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});