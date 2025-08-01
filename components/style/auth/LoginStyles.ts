// components/LoginStyles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    marginBottom: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  switch: {
    marginTop: 20,
    textAlign: 'center',
    color: '#4F46E5',
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    width: '60%',
    backgroundColor: '#444',
    marginVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  backText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  socialButtonWhite: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  marginBottom: 12,
},

googleText: {
  color: '#4285F4',
  fontSize: 15,
  fontWeight: '600',
},

});
