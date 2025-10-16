import { BOARD_SIZE } from '@/constants/game/caro';
import { StyleSheet } from 'react-native';

export const caroScreenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, // toàn màn hình
  boardWrap: { flex: 1, padding: 12, justifyContent: 'center', alignItems: 'center' }, // bao quanh bàn cờ
});

export const caroBoardStyles = StyleSheet.create({
  grid: { width: '100%', aspectRatio: 1, maxWidth: 520, borderWidth: 1, borderColor: '#e5e7eb' }, // vuông
  row: { flex: 1, flexDirection: 'row' }, // hàng ngang
  cell: { flex: 1, borderWidth: 0.5, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }, // ô
  cellLast: { backgroundColor: '#f0f9ff' }, // ô mới đánh
  mark: { fontSize: Math.floor(240 / BOARD_SIZE), fontWeight: '800' }, // X hoặc O
  xMark: { color: '#111827' }, // X màu đen
  oMark: { color: '#2563eb' }, // O màu xanh
});

export const quizStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#0006', justifyContent: 'center', padding: 16 }, // full screen
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 }, // card
  center: { alignItems: 'center', gap: 8 }, // center + gap
  modalTitle: { fontSize: 16, fontWeight: '700', marginVertical: 8 }, // tiêu đề
  timer: { alignSelf: 'flex-end', fontSize: 14, fontWeight: '600', color: '#ef4444' }, // đồng hồ
  choice: { padding: 12, borderRadius: 12, backgroundColor: '#f3f4f6', marginVertical: 6 }, // choice btn
  choiceText: { fontSize: 15, fontWeight: '600', color: '#111827' }, // text choice
  dismissBtn: { marginTop: 8, alignSelf: 'center', padding: 10 }, // nút huỷ
  dismissText: { color: '#6b7280', fontWeight: '600' }, // text huỷ
});

export const endgameStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#0006', justifyContent: 'center', padding: 16 }, // full screen
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' }, // card
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 }, // tiêu đề
  star: { fontSize: 20, marginVertical: 6 },// sao
  line: { marginTop: 4, color: '#374151' },// dòng phụ
  playBtn: { marginTop: 12, backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 }, // nút chơi lại
  playText: { color: '#fff', fontWeight: '700' }, // text chơi lại
});

export const levelMapStyles = StyleSheet.create({
  levelContainer: { flex: 1, backgroundColor: '#ffffff' }, // toàn màn hình

  // Header pro
  proHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb',
  },
  proBack: { padding: 6 },
  levelTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },

  progressBarWrap: {
    width: 180, height: 6, backgroundColor: '#eef2ff',
    borderRadius: 999, overflow: 'hidden', marginTop: 6,
  },
  progressBarFill: { height: '100%', backgroundColor: '#60a5fa' },
  progressText: { marginTop: 4, fontSize: 12, color: '#64748b', fontWeight: '600' },

  svg: { position: 'absolute', left: 0, top: 0 },

  levelList: { paddingBottom: 120 },

  // Node pro (glass)
  proNode: {
    position: 'absolute', // 
    width: 96, height: 96, borderRadius: 999, // circular
    backgroundColor: '#f8fbffcc', // light glass
    borderWidth: 1, borderColor: '#e2e8f0', // light border
    justifyContent: 'center', alignItems: 'center', // center content
    shadowColor: '#3b82f6', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4, // android
    backdropFilter: 'blur(6px)' as any, // web sẽ hưởng; native bỏ qua
  },
  proNodeLocked: { backgroundColor: '#f3f4f6aa', borderColor: '#e5e7eb' }, // locked
  proLvText: { fontWeight: '900', color: '#0f172a', fontSize: 16 },// LVx
  proStarRow: { flexDirection: 'row', gap: 4, marginTop: 6 }, // sao

  proLockBadge: {
    position: 'absolute', bottom: 8, right: 8, // góc dưới phải
    backgroundColor: '#e2e8f0', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3, // pill
    borderWidth: 1, borderColor: '#cbd5e1', // viền
  },
});

