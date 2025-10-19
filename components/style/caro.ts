import { BOARD_SIZE } from '@/constants/game/caro';
import { Platform, StyleSheet } from 'react-native';

/* =============== PLAY SCREEN (board) =============== */
export const caroScreenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' }, // dark để thống nhất vibe
  boardWrap: { flex: 1, padding: 12, justifyContent: 'center', alignItems: 'center' },
});

export const caroBoardStyles = StyleSheet.create({
  grid: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 520,
    borderWidth: 1,
    borderColor: '#1f2a44',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellLast: { backgroundColor: '#0ea5e922' }, // ô mới đánh có tint xanh
  mark: { fontSize: Math.floor(240 / BOARD_SIZE), fontWeight: '800' },
  xMark: { color: '#e2e8f0' },           // X sáng
  oMark: { color: '#60a5fa' },           // O xanh neon
});

/* =============== QUIZ MODAL (câu hỏi) =============== */
export const quizStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 16 },
  modalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2a44',
  },
  center: { alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginVertical: 8, color: '#e2e8f0' },
  timer: { alignSelf: 'flex-end', fontSize: 14, fontWeight: '700', color: '#f87171' },
  choice: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#1f2a44',
  },
  choiceText: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  dismissBtn: { marginTop: 8, alignSelf: 'center', padding: 10 },
  dismissText: { color: '#93a2b1', fontWeight: '700' },
});

/* =============== ENDGAME MODAL =============== */
export const endgameStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 16 },
  modalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2a44',
  },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 8, color: '#e2e8f0' },
  star: { fontSize: 20, marginVertical: 6, color: '#fbbf24' },
  line: { marginTop: 4, color: '#93a2b1' },
  rowBtn: { flexDirection: 'row', gap: 10, marginTop: 12 },
  playBtn: {
    backgroundColor: '#93c5fd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  playText: { color: '#0b1220', fontWeight: '900' },
});

/* =============== LEVEL MAP =============== */
export const levelMapStyles = StyleSheet.create({
  // nền & parallax
  levelContainer: { flex: 1, backgroundColor: '#0b1220' },
  absFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  parallaxLayer: { position: 'absolute', left: 0, right: 0, top: 0, height: '200%' },

  // Header
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  proBack: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b',
  },
  levelTitle: { fontSize: 16, fontWeight: '900', color: '#e2e8f0', letterSpacing: 0.3 },
  progressBarWrap: {
    width: 200, height: 8, backgroundColor: '#0f172a',
    borderRadius: 999, overflow: 'hidden', marginTop: 6, borderWidth: 1, borderColor: '#1f2a44',
  },
  progressBarFill: { height: '100%' }, // màu được fill bằng LinearGradient trong component
  progressText: { marginTop: 4, fontSize: 12, color: '#93a2b1', fontWeight: '700' },
  ctaContinue: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#93c5fd',
  },
  ctaText: { color: '#0b1220', fontWeight: '900' },

  // Scroll layer (svg path)
  svg: { position: 'absolute', left: 0, top: 0 },
  levelList: { position: 'relative' },

  // Node
  nodeWrap: { position: 'absolute', width: 96, height: 96 },
  proNode: {
    width: 96,
    height: 96,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220cc',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  proNodeLocked: { opacity: 0.85 },
  nodeGlass: {
    position: 'absolute',
    left: 1, right: 1, top: 1, bottom: 1,
    borderRadius: 22,
    paddingTop: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' as any } : null),
  },
  proLvText: { fontWeight: '900', color: '#e2e8f0', fontSize: 16, letterSpacing: 0.5 },

  ringStars: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  proStarRow: { flexDirection: 'row', gap: 4, marginTop: 6 },

  // meta/lock rows trong node
  metaRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  lockRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  lockText: { color: '#93a2b1', fontSize: 12, fontWeight: '700' },

  // badge & pulse
  bossBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: '#facc15',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ca8a04',
  },
  proLockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  pulseRing: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
    borderRadius: 24,
    backgroundColor: '#60a5fa55',
  },
});

/* =============== RULES MODAL =============== */
export const rulesModalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 18 },
  card: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#1f2a44',
  },
  title: { fontSize: 18, fontWeight: '900', marginBottom: 8, color: '#e2e8f0' },
  item: { fontSize: 14, color: '#e2e8f0', marginVertical: 4, lineHeight: 20 },
  bold: { fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'flex-end' },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1f2a44' },
  btnPrimary: { backgroundColor: '#93c5fd', borderColor: '#93c5fd' },
  btnGhost: { backgroundColor: '#111827' },
  btnText: { color: '#0b1220', fontWeight: '900' },
  ghostText: { color: '#e2e8f0', fontWeight: '800' },
});
