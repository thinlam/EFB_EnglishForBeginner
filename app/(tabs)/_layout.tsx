// app/(tabs)/_layout.tsx
/**
 * Dự án: EFB - English For Beginners
 * Tab Layout (Expo Router)
 */

import { COLORS } from "@/components/style/colors/AppColors";
import { styles } from "@/components/style/LayoutStyles";
import { useAuthProfile } from "@/hooks/tab/useAuthProfile";

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function TabLayout() {
  const { loading, user, profile } = useAuthProfile();

  // Loading profile
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.bgScreen, // nền sáng
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Chưa login → chuyển Welcome
  if (!user || !profile) {
    return <Redirect href="/Welcome" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,

        /** ⭐ FIX NỀN BỊ TỐI */
        sceneContainerStyle: { backgroundColor: COLORS.bgScreen },
        tabBarStyle: {
          height: 70,
          backgroundColor: COLORS.bg, // màu trắng
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },

        tabBarIcon: ({ focused }) => {
          const color = focused ? COLORS.primary : "#666";
          let icon: React.ReactNode = null;

          switch (route.name) {
            case "index":
              icon = <Ionicons name="home" size={24} color={color} />;
              break;

            case "WordBook":
              icon = <FontAwesome5 name="book" size={22} color={color} />;
              break;

            case "Premium":
              icon = <Text style={{ fontSize: 24 }}>🐵</Text>;
              break;

            case "Profile":
              icon = <Ionicons name="person" size={24} color={color} />;
              break;

            case "more":
              icon = <MaterialIcons name="more-horiz" size={24} color={color} />;
              break;
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
      <Tabs.Screen name="listen" options={{ href: null }} />
      <Tabs.Screen name="translate" options={{ href: null }} />

      <Tabs.Screen name="Profile/EditProfile" options={{ href: null }} />

      <Tabs.Screen name="playgame" options={{ href: null }} />

      {/* Game caro */}
      <Tabs.Screen name="game/index" options={{ href: null }} />
      <Tabs.Screen name="game/Caro/levels" options={{ href: null }} />
      <Tabs.Screen name="game/Caro/[level]" options={{ href: null }} />

      {/* Grammar */}
      <Tabs.Screen name="grammar/detail/[id]" options={{ href: null }} />

      {/* Reading */}
      <Tabs.Screen name="reading/[id]" options={{ href: null }} />
      <Tabs.Screen name="reading/questions" options={{ href: null }} />
      <Tabs.Screen name="reading" options={{ href: null }} />

      {/* Speaking */}
      <Tabs.Screen name="speaking" options={{ href: null }} />
      <Tabs.Screen name="speaking/item/[id]" options={{ href: null }} />

      {/* Study */}
      <Tabs.Screen name="study/[id]" options={{ href: null }} />

      {/* Notifications */}
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="notifications/[id]" options={{ href: null }} />

      {/* Test */}
      <Tabs.Screen name="test" options={{ href: null }} />

      {/* Listen */}
      <Tabs.Screen name="listen/listen" options={{ href: null }} />
      <Tabs.Screen name="listen/[id]" options={{ href: null }} />
      <Tabs.Screen name="listen/questions/[id]" options={{ href: null }} />

      {/* Writing */}
      <Tabs.Screen name="writing/index" options={{ href: null }} />
      <Tabs.Screen name="writing/detail" options={{ href: null }} />
      <Tabs.Screen name="writing/editor" options={{ href: null }} />
    </Tabs>
  );
}
