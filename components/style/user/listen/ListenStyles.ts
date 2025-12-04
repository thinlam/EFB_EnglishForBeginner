// components/style/user/ListenStyles.ts
import { StyleSheet } from 'react-native';

export const ListenStyles = StyleSheet.create({
  /* ==== Root / Container ==== */
  wrap: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* ==== Header ==== */
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },

  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  backBtnPressed: {
    opacity: 0.85,
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },

  headerRightPlaceholder: {
    width: 36,
    height: 36,
  },

  /* ==== Level selector ==== */
  levelsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },

  levelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  levelBtnActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },

  levelBtnLocked: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },

  levelBtnPressed: {
    opacity: 0.85,
  },

  levelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  levelTextActive: {
    color: '#F9FAFB',
  },

  levelTextLocked: {
    color: '#9CA3AF',
  },

  /* ==== Search ==== */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginTop: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  /* ==== List ==== */
  loading: {
    padding: 24,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },

  listFooter: {
    paddingVertical: 12,
  },

  empty: {
    padding: 24,
    alignItems: 'center',
  },

  emptyText: {
    color: '#6B7280',
  },

  /* ==== Card ==== */
  card: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.96,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cardThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#11182712',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },

  cardSubtitle: {
    color: '#4b5563',
    fontSize: 13,
    marginTop: 2,
  },

  cardMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },

  cardLevelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1118270C',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardLevelText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },

  cardExerciseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardExerciseText: {
    fontSize: 12,
    color: '#374151',
  },

  /* ==== Extra cho item screen ==== */
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  title: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
});
