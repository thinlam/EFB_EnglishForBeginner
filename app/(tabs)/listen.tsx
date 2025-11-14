import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
import { ListenStyles as S } from '@/components/style/tabs/ListenStyles';

/* ✅ Ảnh placeholder (đường dẫn từ app/(tabs) ra assets) */
import placeholderImg from '../../assets/images/placeholder-image.png';

/* ✅ 5 level CEFR: A1 → C1 */
const TOPICS = [
  { id: 'A1', title: 'A1', color: '#93c5fd' },
  { id: 'A2', title: 'A2', color: '#86efac' },
  { id: 'B1', title: 'B1', color: '#e9d5ff' },
  { id: 'B2', title: 'B2', color: '#fcd34d' },
  { id: 'C1', title: 'C1', color: '#93c5fd' },
] as const;

/* ✅ Level hiện tại: CHỈ level này được bấm (ví dụ: đang ở A1) 
   Sau này bạn có thể thay bằng hook tiến độ (Firestore/AsyncStorage) */
const CURRENT_LEVEL: (typeof TOPICS)[number]['id'] = 'A1';

export default function ListenScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);

  /* Với 5 item, để PAGE_SIZE = 5 hiển thị hết trong 1 trang */
  const PAGE_SIZE = 5;

  /* Lọc theo ô Search (A1…C1) */
  const filteredAll = React.useMemo(() => {
    const kw = q.trim().toLowerCase();
    return TOPICS.filter((t) => t.title.toLowerCase().includes(kw));
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));

  const filtered = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAll.slice(start, start + PAGE_SIZE);
  }, [filteredAll, page]);

  /* ✅ Chỉ được vào level hiện tại */
  const canEnter = (id: string) => id === CURRENT_LEVEL;
 // Xử lý bấm vào Start button
 const onPressStart = (id: string) => {
  if (!canEnter(id)) return;
  router.push({ pathname: '/listien/[level]', params: { level: id } });
};


  return (
    <SafeAreaView style={S.wrap}>
      <ScrollView
        contentContainerStyle={S.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={S.searchWrap}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            style={S.searchInput}
            placeholder="Search level (A1…C1)"
            placeholderTextColor="#9ca3af"
            value={q}
            onChangeText={(t) => {
              setPage(1);
              setQ(t);
            }}
            autoCorrect={false}
          />
        </View>

        {/* Header: Back + Title (giữa) */}
        <View style={S.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={S.iconBtn}
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={S.title}>FULL TOPIC LISTEN</Text>
          <View style={{ width: 32, height: 32 }} />
        </View>

        {/* Danh sách level */}
        <View style={{ gap: 14 }}>
          {filtered.map((item) => {
            const locked = !canEnter(item.id);
            return (
              <View
                key={item.id}
                style={[
                  S.card,
                  { backgroundColor: item.color, opacity: locked ? 0.6 : 1 },
                ]}
                accessibilityState={{ disabled: locked }}
              >
                <View style={S.cardLeft}>
                  <View style={S.thumb}>
                    <Image
                      source={placeholderImg}
                      style={{ width: '100%', height: '100%', opacity: 0.25 }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={S.cardTitle}>{item.title}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => onPressStart(item.id)}
                  style={[S.startBtn, locked && { backgroundColor: '#d1d5db' }]}
                  disabled={locked}
                  accessibilityLabel={
                    locked ? `Locked ${item.title}` : `Start ${item.title}`
                  }
                >
                  <Text
                    style={[S.startBtnText, locked && { color: '#6b7280' }]}
                  >
                    {locked ? 'Locked' : 'Start'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Phân trang (với 5 item thì chỉ có 1 trang, vẫn giữ để tái dùng sau) */}
        <View style={S.pagingRow}>
          {/* Prev */}
          <TouchableOpacity
            style={[S.pageBtn, page === 1 && S.pageBtnDisabled]}
            disabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Text style={S.pageBtnText}>{'<'}</Text>
          </TouchableOpacity>

          {/* Numbers */}
          <View style={S.pageNumbers}>
            {page > 2 && (
              <>
                <TouchableOpacity
                  key="p-1"
                  onPress={() => setPage(1)}
                  style={[S.pageDot, page === 1 && S.pageDotActive]}
                >
                  <Text style={S.pageDotText}>1</Text>
                </TouchableOpacity>
                {(() => {
                  const middle = [page - 1, page, page + 1].filter(
                    (n) => n > 1 && n < totalPages
                  );
                  const leftmost = Math.min(...middle);
                  return leftmost > 2 ? (
                    <Text key="ellipsis-left" style={S.ellipsis}>
                      …
                    </Text>
                  ) : null;
                })()}
              </>
            )}

            {(() => {
              const around = [page - 1, page, page + 1].filter(
                (n) => n > 1 && n < totalPages
              );
              const pageNumbers = Array.from(new Set(around));
              return pageNumbers.map((n) => (
                <TouchableOpacity
                  key={`p-${n}`}
                  onPress={() => setPage(n)}
                  style={[S.pageDot, page === n && S.pageDotActive]}
                >
                  <Text style={S.pageDotText}>{n}</Text>
                </TouchableOpacity>
              ));
            })()}

            {totalPages > 1 && (
              <>
                {(() => {
                  const middle = [page - 1, page, page + 1].filter(
                    (n) => n > 1 && n < totalPages
                  );
                  const rightmost = Math.max(...middle);
                  return rightmost < totalPages - 1 ? (
                    <Text key="ellipsis-right" style={S.ellipsis}>
                      …
                    </Text>
                  ) : null;
                })()}
                <TouchableOpacity
                  key={`p-${totalPages}`}
                  onPress={() => setPage(totalPages)}
                  style={[
                    S.pageDot,
                    page === totalPages && S.pageDotActive,
                  ]}
                >
                  <Text style={S.pageDotText}>{totalPages}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Next */}
          <TouchableOpacity
            style={[S.pageBtn, page === totalPages && S.pageBtnDisabled]}
            disabled={page === totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={S.pageBtnText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
