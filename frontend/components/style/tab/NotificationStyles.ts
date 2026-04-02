import { StyleSheet } from 'react-native';

export const notificationStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },

  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0f172a',
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },

  itemMsg: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },

  itemTime: {
    marginTop: 6,
    fontSize: 12,
    color: '#94a3b8',
  },
});
