/**
 * Dự án: EFB - English For Beginners
 * Mục đích: App học tiếng Anh cơ bản (React Native + Expo Router)
 */

import { styles } from '@/components/style/LayoutStyles'
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { height: 70 },

        tabBarIcon: ({ focused }) => {
          const color = focused ? '#4F46E5' : '#666'
          let icon: React.ReactNode

          switch (route.name) {
            case 'index':
              icon = <Ionicons name="home" size={24} color={color} />
              break
            case 'WordBook':
              icon = <FontAwesome5 name="book" size={22} color={color} />
              break
            case 'Premium':
              icon = <Text style={{ fontSize: 24 }}>{'🐵'}</Text>
              break
            case 'Profile':
              icon = <Ionicons name="person" size={24} color={color} />
              break
            case 'more':
              icon = <MaterialIcons name="more-horiz" size={24} color={color} />
              break

            // Các screen ẩn (href:null) sẽ không hiển thị icon/tab
            default:
              icon = null
          }

          // Nếu là screen ẩn, không render wrapper tab item
          if (!icon) return null

          return (
            <View style={styles.iconWrapper}>
              <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
                {icon}
              </View>
              {focused && <View style={styles.underline} />}
            </View>
          )
        },
      })}
    >
      {/* ====== 5 TAB CHÍNH ====== */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="WordBook" />
      <Tabs.Screen name="Premium" />
      <Tabs.Screen name="Profile" />
      <Tabs.Screen name="more" />

      {/* ====== SCREEN PHỤ (ẨN KHỎI TAB BAR) ======
          vẫn có thể vào bằng: <Link href="/(tabs)/listen" /> hoặc router.push('/(tabs)/listen')
       */}
      <Tabs.Screen
        name="listen"
        options={{
          href: null, // Ẩn khỏi tab bar & deep links /tab
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
        name = "playgame"
        options={{
          href: null,
        }}
        />
        <Tabs.Screen
          name = "game/index"
          options={{
            href : null,
          }}
          />
          <Tabs.Screen
          name = "game/Caro/levels"
          options={{
            href : null,
          }}
          />
          <Tabs.Screen
          name = "game/Caro/[level]"
          options={{
            href : null,
          }}
          />
          <Tabs.Screen
          name = "grammar/detail/[id]"
          options={{
            href : null,
          }}
          />
    </Tabs>
    
  )
}
