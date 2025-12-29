import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },

  loading: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  backBtn: {
    width: 26,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#FACC15',
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  rank: {
    width: 38,
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },

  avatarTop: {
    borderWidth: 2,
    borderColor: '#FACC15',
  },

  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 18,
  },

  name: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },

  sub: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 2,
  },

  scoreBox: {
    alignItems: 'center',
    minWidth: 48,
  },

  scoreValue: {
    color: '#FACC15',
    fontSize: 18,
    fontWeight: '800',
  },

  scoreLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: -2,
  },
});
