// components/ui/Screen.tsx
import React from 'react';
import { Platform, StatusBar, View, ViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ViewProps & {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  barStyle?: 'light-content' | 'dark-content';
  translucentStatusBar?: boolean;
  bg?: string;
};

export default function Screen({
  children,
  style,
  edges = ['top', 'bottom'],
  barStyle = 'light-content',
  translucentStatusBar = true,
  bg = '#0b0b0b',
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: bg }, style]}
      {...rest}
    >
      <StatusBar
        translucent={Platform.OS === 'android' ? translucentStatusBar : false}
        backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
        barStyle={barStyle}
      />
      {/* Đệm cho Android khi dùng translucent */}
      {Platform.OS === 'android' && translucentStatusBar ? (
        <View style={{ height: StatusBar.currentHeight ?? 0 }} />
      ) : null}

      {children}

      {/* Đệm home indicator nếu không dùng edges bottom */}
      {!edges.includes('bottom') && <View style={{ height: insets.bottom }} />}
    </SafeAreaView>
  );
}
