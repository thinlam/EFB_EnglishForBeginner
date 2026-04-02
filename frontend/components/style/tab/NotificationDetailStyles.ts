import { StyleSheet } from 'react-native';

export const notificationDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  backBtn: {
    marginRight: 10,
    padding: 4,
  },

  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },

  time: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },

  message: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
});
