// app/(tabs)/_layout.tsx

/**
 * Dự án: EFB - English For Beginners
 * Mục đích: App học tiếng Anh cơ bản (React Native + Expo Router)
 */

import { styles } from '@/components/style/LayoutStyles';
import { useAuthProfile } from '@/hooks/tab/useAuthProfile';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function TabLayout() {
  const { loading, user, profile } = useAuthProfile();

  // Đang load profile
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❌ Chưa login → không cho vào tabs → quay về Welcome
  if (!user || !profile) {
    return <Redirect href="/Welcome" />;
  }

  // ✅ Đã login → render Tabs bình thường
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { height: 70 },

        tabBarIcon: ({ focused }) => {
          const color = focused ? '#4F46E5' : '#666';
          let icon: React.ReactNode;

          switch (route.name) {
            case 'index':
              icon = <Ionicons name="home" size={24} color={color} />;
              break;
            case 'WordBook':
              icon = <FontAwesome5 name="book" size={22} color={color} />;
              break;
            case 'Premium':
              icon = <Text style={{ fontSize: 24 }}>{'🐵'}</Text>;
              break;
            case 'Profile':
              icon = <Ionicons name="person" size={24} color={color} />;
              break;
            case 'more':
              icon = <MaterialIcons name="more-horiz" size={24} color={color} />;
              break;

            // Các screen ẩn (href:null) sẽ không hiển thị icon/tab
            default:
              icon = null;
          }

          if (!icon) return null;

          return (
            <View style={styles.iconWrapper}>
              <View
                style={[
                  styles.iconCircle,
                  focused && styles.iconCircleFocused,
                ]}
              >
                {icon}
              </View>
              {focused && <View style={styles.underline} />}
            </View>
          );
        },
      })}
    >
      {/* ====== 5 TAB CHÍNH ====== */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="WordBook" />
      <Tabs.Screen name="Premium" />
      <Tabs.Screen name="Profile" />
      <Tabs.Screen name="more" />

      {/* ====== SCREEN PHỤ (ẨN KHỎI TAB BAR) ====== */}
      <Tabs.Screen
        name="listen"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="translate"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="Profile/EditProfile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="playgame"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="game/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="game/Caro/levels"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="game/Caro/[level]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="grammar/detail/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
       name = "reading/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
       name = "reading/questions"
        options={{
          href: null,
        }}
      />
        <Tabs.Screen
       name = "reading"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name= "speaking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="speaking/item/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="study/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
