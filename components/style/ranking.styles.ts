// components/style/ranking.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1220', // ❗ nền tối
  },

  loading: {
    marginTop: 60,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },

  headerTitle: {
  flex: 1,
  textAlign: 'center',
  fontSize: 20,
  fontWeight: '800',
  color: '#FACC15',
},

  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  emptyText: {
    marginTop: 80,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },

  rank: {
    width: 36,
    color: '#FACC15',
    fontWeight: 'bold',
    fontSize: 16,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },

  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },

  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  sub: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 2,
  },

  score: {
    color: '#FACC15',
    fontWeight: '800',
    fontSize: 16,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 10,
},

backBtn: {
  width: 26,
  justifyContent: 'center',
  alignItems: 'center',
},

});
