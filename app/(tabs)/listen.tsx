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

/* ✅ Import ảnh placeholder đúng chuẩn (từ app/(tabs) ra assets là ../../) */
import placeholderImg from '../../assets/images/placeholder-image.png';

/* Dummy data (tạm thời) */
const TOPICS = Array.from({ length: 20 }).map((_, i) => ({
  id: `topic-${i + 1}`,
  title: `topic`,
  color: ['#93c5fd', '#86efac', '#e9d5ff', '#fcd34d'][i % 4],
}));

export default function ListenScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 8;

  const filteredAll = React.useMemo(() => {
    const kw = q.trim().toLowerCase();
    return TOPICS.filter(t => t.title.toLowerCase().includes(kw));
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));

  const filtered = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAll.slice(start, start + PAGE_SIZE);
  }, [filteredAll, page]);

  const onPressStart = (id: string) => {
    // TODO: điều hướng sang màn chi tiết
    // router.push(`/(tabs)/listen/${id}`);
    router.back(); // hoặc router.push('/(tabs)')
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
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            value={q}
            onChangeText={(t) => { setPage(1); setQ(t); }}
            autoCorrect={false}
          />
        </View>

        {/* Header back + title (giữa, kiểu giống mock) */}
        <View style={S.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={S.iconBtn} accessibilityLabel="Quay lại">
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={S.title}>FULL TOPIC LISTEN</Text>
          <View style={{ width: 32, height: 32 }} />
        </View>

        {/* List topics */}
        <View style={{ gap: 14 }}>
          {filtered.map(item => (
            <View key={item.id} style={[S.card, { backgroundColor: item.color }]}>
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
                style={S.startBtn}
                accessibilityLabel={`Start ${item.title}`}
              >
                <Text style={S.startBtnText}>Start</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pagination */}
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
            {/* Left edge: 1 + maybe ... */}
            {page > 2 && (
              <>
                <TouchableOpacity
                  key="p-1"
                  onPress={() => setPage(1)}
                  style={[S.pageDot, page === 1 && S.pageDotActive]}
                >
                  <Text style={S.pageDotText}>1</Text>
                </TouchableOpacity>
                {/* show ellipsis only if the first middle page is >2 */}
                {(() => {
                  const middle = [page - 1, page, page + 1]
                    .filter(n => n > 1 && n < totalPages);
                  const leftmost = Math.min(...middle);
                  return leftmost > 2 ? <Text key="ellipsis-left" style={S.ellipsis}>…</Text> : null;
                })()}
              </>
            )}

            {/* Middle: unique pages around current (no duplicates) */}
            {(() => {
              const around = [page - 1, page, page + 1]
                .filter(n => n > 1 && n < totalPages);
              const pageNumbers = Array.from(new Set(around)); // remove duplicates
              return pageNumbers.map(n => (
                <TouchableOpacity
                  key={`p-${n}`}
                  onPress={() => setPage(n)}
                  style={[S.pageDot, page === n && S.pageDotActive]}
                >
                  <Text style={S.pageDotText}>{n}</Text>
                </TouchableOpacity>
              ));
            })()}

            {/* Right edge: maybe ... + last */}
            {totalPages > 1 && (
              <>
                {(() => {
                  const middle = [page - 1, page, page + 1]
                    .filter(n => n > 1 && n < totalPages);
                  const rightmost = Math.max(...middle);
                  return rightmost < totalPages - 1
                    ? <Text key="ellipsis-right" style={S.ellipsis}>…</Text>
                    : null;
                })()}
                <TouchableOpacity
                  key={`p-${totalPages}`}
                  onPress={() => setPage(totalPages)}
                  style={[S.pageDot, page === totalPages && S.pageDotActive]}
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
