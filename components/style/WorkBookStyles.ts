import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // màu nền ăn theo status bar
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* HEADER */

  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // cố định 2 bên → không lệch dù giọt nước hay tai thỏ
    paddingTop: 4,
    paddingBottom: 12,
  },

  headerAccent: {
    width: 6,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#0F766E',
    marginRight: 12,
  },

  headerTextWrap: {
    flex: 1,
  },

  headerRightSpace: {
    width: 32, // giữ cân bằng, sau này gắn avatar/icon cũng ok
    alignItems: 'flex-end',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B1220',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },

  /* FILTER CHIPS */

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    columnGap: 8,
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  filterChipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },

  filterChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },

  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* LIST */

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  listEmptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* CARD */

  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  wordBlock: {
    flexShrink: 1,
    paddingRight: 8,
  },

  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  phoneticText: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },

  cardRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },

  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
    columnGap: 4,
  },

  topicText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },

  meaningText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },

  exampleBlock: {
    marginTop: 4,
  },

  exampleEnText: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
  },

  exampleViText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  /* EMPTY STATE */

  emptyWrap: {
    alignItems: 'center',
  },

  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
    topicTabsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    columnGap: 8,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  topicChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  topicChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  topicChipTextActive: {
    color: '#166534',
    fontWeight: '600',
  },
    /* Topic vertical cards */
  topicCard: {
    width: '100%',
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  topicCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1220',
  },
  topicCardBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#00000020',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicCardBadgeText: {
    fontSize: 12,
    color: '#444',
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    gap: 6,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
    topicListContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },

  
});
