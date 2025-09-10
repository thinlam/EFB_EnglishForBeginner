/**
 * HomeScreen.tsx — Grid + hiển thị level hiện tại (ẩn các level khác)
 */

import { auth, db } from '@/scripts/firebase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;

type Item = {
  id: string; title: string; icon: any; color: string;
  topics?: number; subtitle?: string; levels?: string[];
};

const DATA: Item[] = [
  { id: '1', title: 'Listening', icon: 'headset', color: '#77B66E', topics: 20, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '2', title: 'Speaking',  icon: 'mic',     color: '#423D8E', topics: 18, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '3', title: 'Reading',   icon: 'book',    color: '#8E476C', topics: 15, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '4', title: 'Writing',   icon: 'pencil',  color: '#8A6110', topics: 12, levels: ['A1','A2','B1','B2','C1','C2'] },
  { id: '5', title: 'Workbook',  icon: 'document-text-outline', color: '#0F6B70', subtitle: 'Bài tập tổng hợp', levels: ['All'] },
  { id: '6', title: 'Dịch',      icon: 'globe',   color: '#1E6F27', subtitle: 'Dịch văn bản', levels: ['Tool'] },
  { id: '7', title: 'Bảng xếp hạng', icon: 'trophy', color: '#7D0E22', subtitle: 'Xem hạng của bạn', levels: ['Ranking'] },
];

// Bật cái này nếu muốn ẨN HẲN các card không khớp level (ngoại trừ All/Tool/Ranking)
const FILTER_CARDS_BY_LEVEL = true;

export default function HomeScreen() {
  const [level, setLevel] = useState<string>('A1');

  useEffect(() => {
    (async () => {
      // 1) Lấy từ Firestore nếu có user
      const u = auth.currentUser;
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          const cefrFromDb = snap.get('levelCefr');
          if (typeof cefrFromDb === 'string') {
            setLevel(cefrFromDb);
            await AsyncStorage.setItem('efb.level', cefrFromDb); // sync local
            return;
          }
        } catch {}
      }
      // 2) Fallback: AsyncStorage
      const local = await AsyncStorage.getItem('efb.level');
      if (local) setLevel(local);
    })();
  }, []);

  // (Tuỳ chọn) Chỉ giữ các item có chứa level hiện tại hoặc các mục đặc biệt
  const filteredData = useMemo(() => {
    if (!FILTER_CARDS_BY_LEVEL) return DATA;
    return DATA.filter((it) => {
      const lv = it.levels || [];
      return lv.includes('All') || lv.includes('Tool') || lv.includes('Ranking') || lv.includes(level);
    });
  }, [level]);

  // Chỉ render CHIP = level hiện tại nếu item hỗ trợ level đó; ẩn các level khác
  const renderLevels = (levels?: string[]) => {
    if (!levels) return null;
    if (levels.includes('All') || levels.includes('Tool') || levels.includes('Ranking')) return null;
    if (!levels.includes(level)) return null; // item không hỗ trợ level hiện tại thì ẩn hẳn dải level

    return (
      <View style={styles.levelRow}>
        <View style={[styles.levelChip, styles.levelChipActive]}>
          <Text style={[styles.levelText, styles.levelTextActive]}>{level}</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: item.color }]}>
      <Ionicons name={item.icon} size={22} color="#fff" />
      <Text style={styles.title}>{item.title}</Text>
      {renderLevels(item.levels)}
      {item.subtitle
        ? <Text style={styles.subtitle}>{item.subtitle}</Text>
        : <Text style={styles.topics}>{item.topics} Topics</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cấp hiện tại:</Text>
        <View style={styles.headerLevelPill}><Text style={styles.headerLevelText}>{level}</Text></View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' }, // ← đổi nền trắng

  header: { 
    paddingHorizontal:16, 
    paddingTop:12, 
    paddingBottom:4, 
    flexDirection:'row', 
    alignItems:'center' 
  },
  headerTitle: { color:'#374151', fontSize:13, fontWeight:'600' }, // chữ xám đậm
  headerLevelPill: { 
    marginLeft:8, 
    paddingHorizontal:10, 
    paddingVertical:3, 
    backgroundColor:'#F3F4F6', // pill sáng
    borderRadius:999 
  },
  headerLevelText: { color:'#111827', fontWeight:'700' }, // chữ tối

  card: { 
    width: CARD_WIDTH, 
    height:130, 
    borderRadius:16, 
    padding:14, 
    marginBottom:16, 
    justifyContent:'space-between' 
    // giữ màu card = item.color
  },
  title: { fontSize:16, fontWeight:'bold', color:'#fff' },
  topics: { fontSize:12, color:'#F9FAFB' },
  subtitle: { fontSize:12, color:'#F9FAFB', fontStyle:'italic' },

  levelRow: { flexDirection:'row', flexWrap:'wrap', marginTop:6, marginBottom:4 },
  levelChip: { paddingHorizontal:8, paddingVertical:2, borderRadius:999, backgroundColor:'rgba(255,255,255,0.18)', marginRight:6, marginBottom:6 },
  levelChipActive: { backgroundColor:'#fff' },
  levelText: { color:'#fff', fontSize:11, fontWeight:'600' },
  levelTextActive: { color:'#0B1220' },
});
