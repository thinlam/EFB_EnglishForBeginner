import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
import { TranslateStyles as S } from '@/components/style/TranslateStyle';

/* Hooks */
import { usePronounce } from '@/hooks/tab/usePronounce';
import { useTranslate } from '@/hooks/tab/useTranslate';
import { useTranslateHistory } from '@/hooks/tab/useTranslateHistory';

/* UI Partials */
import { HistoryList } from '@/components/translate/HistoryList';
import { PronPanel } from '@/components/translate/PronPanel';
import { WordChips } from '@/components/translate/WordChips';

/* Utils */
import { flagOf, langFull } from '@/utils/tab/lang';

export default function TranslateScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const {
    srcLang, tgtLang, srcText, tgtText, MAX,
    onChangeSrc, setTgtText, swapLangs,
    copySource, copyResult, speak,
  } = useTranslate();

  const {
    history, loadHistory, confirmAndClearHistory, pickHistoryItem,
  } = useTranslateHistory({
    onPick: ({ src, res, s, t }) => {
      // khi pick lịch sử → nạp lại vào state dịch
      onChangeSrc(src);
      setTgtText(res);
      // đổi chiều đúng
      if (s !== srcLang || t !== tgtLang) swapLangs(s, t);
    },
  });

  const {
    selectedWord, loadingPron, pron, onPressWord, canShowExtras,
  } = usePronounce({ srcLang, tgtLang });

  React.useEffect(() => { loadHistory(); }, [loadHistory]);

  const Content = (
    <ScrollView
      contentContainerStyle={S.container}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
    >
      {/* Header với nút Back + Title */}
      <View style={[S.langRow, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={S.iconBtn} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={S.sectionTitle}>Translate</Text>
        {/* Spacer để cân đối layout với nút back */}
        <View style={{ width: 32, height: 32 }} />
      </View>

      {/* Header chọn ngôn ngữ */}
      <View style={S.langRow}>
        <TouchableOpacity style={S.langBtn}>
          <View style={S.langBtnCol}>
            <Image source={flagOf(srcLang)} style={S.flag} />
            <Text style={S.langText}>{langFull(srcLang)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={S.swapMid} onPress={() => swapLangs()} accessibilityLabel="Đổi chiều ngôn ngữ">
          <Text style={S.swapMidIcon}>⇆</Text>
        </TouchableOpacity>

        <TouchableOpacity style={S.langBtn}>
          <View style={S.langBtnCol}>
            <Image source={flagOf(tgtLang)} style={S.flag} />
            <Text style={S.langText}>{langFull(tgtLang)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* CARD 1: Source */}
      <View style={S.card}>
        <Text style={S.cardTitle}>Translate from ({langFull(srcLang)})</Text>
        <View style={S.srcBoxWrap}>
          <TextInput
            placeholder={`Nhập ${srcLang === 'en' ? 'English' : 'Vietnamese'}... (≤ ${MAX} ký tự)`}
            value={srcText}
            onChangeText={onChangeSrc}
            multiline
            style={[S.textArea, isWeb ? ({ outlineStyle: 'none', cursor: 'text' } as any) : null]}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={S.counterRow}>
          <Text style={S.hint}>Gõ {srcLang === 'en' ? 'tiếng Anh' : 'tiếng Việt'} ở đây.</Text>
          <Text style={srcText.length >= MAX ? S.counterWarn : S.counter}>
            {srcText.length}/{MAX}
          </Text>
        </View>
        <View style={S.actionRow}>
          <View style={{ flex: 1 }} />
          <View style={S.iconRowRight}>
            <TouchableOpacity style={S.iconBtn} onPress={copySource} accessibilityLabel="Sao chép nguồn">
              <MaterialIcons name="content-copy" size={18} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity
              style={S.iconBtn}
              onPress={() => speak(srcText, srcLang)}
              accessibilityLabel="Đọc to văn bản nguồn"
            >
              <Ionicons name="volume-medium" size={18} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chips EN→VI */}
      {canShowExtras && (
        <WordChips text={srcText} onPressWord={onPressWord} />
      )}

      {/* CARD 2: Target */}
      <View style={S.card}>
        <Text style={S.cardTitle}>Translate to ({langFull(tgtLang)})</Text>
        <TextInput
          placeholder={`Nghĩa ${tgtLang === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}`}
          value={tgtText}
          onChangeText={setTgtText}
          multiline
          style={[S.textArea, isWeb ? ({ outlineStyle: 'none', cursor: 'text' } as any) : null]}
          placeholderTextColor="#9ca3af"
        />
        <View style={S.actionRow}>
          <View style={{ flex: 1 }} />
          <View style={S.iconRowRight}>
            <TouchableOpacity style={S.iconBtn} onPress={copyResult} accessibilityLabel="Sao chép kết quả">
              <MaterialIcons name="content-copy" size={18} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity
              style={S.iconBtn}
              onPress={() => speak(tgtText, tgtLang)}
              accessibilityLabel="Đọc to bản dịch"
            >
              <Ionicons name="volume-medium" size={18} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* IPA Panel */}
      {canShowExtras && (
        <PronPanel
          word={selectedWord}
          loading={loadingPron}
          pron={pron}
          onSpeak={() => speak(selectedWord, 'en')}
        />
      )}

      {/* Lịch sử + Xoá */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={S.sectionTitle}>Lịch sử gần đây</Text>
        <TouchableOpacity
          onPress={confirmAndClearHistory}
          style={[S.iconBtn, { backgroundColor: '#fee2e2' }]}
          accessibilityLabel="Xoá toàn bộ lịch sử dịch"
        >
          <MaterialIcons name="delete" size={18} color="#991b1b" />
        </TouchableOpacity>
      </View>

      <HistoryList
        data={history}
        onPick={(item) => pickHistoryItem(item)}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={S.wrap}>
      {isWeb ? (
        Content
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {Content}
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  );
}
