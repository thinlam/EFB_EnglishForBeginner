import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
import { C, S } from '@/components/style/tab/MoreStyles';

/* Data */
import { sections as sectionsConst } from '@/constants/tab/moreSections';

/* Hooks */
import { useLogout } from '@/hooks/tab/useLogout';

export default function MoreScreen() {
  const router = useRouter();
  const { handleLogout } = useLogout({
    onError: () => Alert.alert('Lỗi', 'Không thể đăng xuất.'),
    onDone: () => router.replace('/login'),
  });

  const sections = useMemo(() => sectionsConst, []);

  return (
    <SafeAreaView style={S.safe}>
      <View style={S.headerBar}>
        <Text style={S.screenTitle}>Cài đặt</Text>
      </View>

      <ScrollView contentContainerStyle={S.content}>
        {sections.map((sec, i) => (
          <View key={i} style={S.section}>
            <Text style={S.sectionTitle}>{sec.heading}</Text>
            <View style={S.card}>
              {sec.items.map((it, j) => (
                <TouchableOpacity
                  key={j}
                  onPress={() => it.path && router.push(it.path as any)}
                  activeOpacity={0.75}
                  style={[S.row, j < sec.items.length - 1 && S.rowDivider]}
                >
                  <View style={S.iconWrap}>
                    <FontAwesome5
                      name={it.icon as any}
                      size={18}
                      color={it.danger ? C.danger : C.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.rowTitle, it.danger && { color: C.danger }]}>{it.title}</Text>
                    {it.sub ? <Text style={S.rowSub}>{it.sub}</Text> : null}
                  </View>
                  <FontAwesome5 name="chevron-right" size={14} color={C.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Danger Zone</Text>
          <View style={S.card}>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={S.row}>
              <View style={S.iconWrap}>
                <FontAwesome5 name="sign-out-alt" size={18} color={C.danger} />
              </View>
              <Text style={[S.rowTitle, { color: C.danger }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={S.version}>EFB • v1.0.0 {Platform.OS === 'ios' ? '• iOS' : '• Android'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
