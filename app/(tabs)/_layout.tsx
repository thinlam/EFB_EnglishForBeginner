import { styles } from '@/components/style/LayoutStyles'; // Import styles from the LayoutStyles file  
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
        },
        tabBarIcon: ({ focused }) => {
          const color = focused ? '#4F46E5' : '#666';
          let icon = null;

          switch (route.name) {
            case 'index':
              icon = <Ionicons name="home" size={24} color={color} />;
              break;
            case 'WordBook':
              icon = <FontAwesome5 name="book" size={22} color={color} />;
              break;
            case 'rankings':
              icon = <FontAwesome5 name="trophy" size={22} color={color} />;
              break;
            case 'Premium':
              icon = <Text style={{ fontSize: 24 }}>{'🐵'}</Text>;
              break;
            case 'more':
              icon = <MaterialIcons name="more-horiz" size={24} color={color} />;
              break;
          }

          return (
            <View style={styles.iconWrapper}>
              <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
                {icon}
              </View>
              {focused && <View style={styles.underline} />}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
    name="index"
    options={{
      headerShown: false,
    }}
  />
  <Tabs.Screen
    name="WordBook"
    options={{
      headerShown: false,
    }}
  />
  <Tabs.Screen
    name="rankings"
    options={{
      headerShown: false,
    }}
  />
  <Tabs.Screen
    name="Premium"
    options={{
      headerShown: false,
    }}
  />
  <Tabs.Screen
    name="more"
    options={{
      headerShown: false,
    }}
  />
    </Tabs>
  );
}

