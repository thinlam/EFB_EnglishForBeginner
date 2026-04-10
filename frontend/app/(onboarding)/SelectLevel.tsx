import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
// eslint-disable-next-line import/no-unresolved
import { styles } from '@/components/style/onboarding/SelectLevelStyles';

/* Hooks */
// eslint-disable-next-line import/no-unresolved
import { useSelectLevel } from '@/hooks/onboarding/useSelectLevel';

/* Constants */
// eslint-disable-next-line import/no-unresolved
import { levels } from '@/constants/onboarding/levels';

export default function SelectLevelScreen() {
  const {
    checking,
    selectedStars,
    feedbackOpacityStyle,
    handleSelect,
    handleContinue,
    handleBackHome,
    renderStars,
    feedbackTextFor,
  } = useSelectLevel();

  if (checking) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#6b7280' }}>Đang tải…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Trình độ tiếng Anh của bạn ở mức nào?</Text>

      <FlatList
        data={levels}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.optionCard, selectedStars === item.stars && styles.optionCardSelected]}
            onPress={() => handleSelect(item.stars)}
            activeOpacity={0.85}
          >
            {renderStars(item.stars, FontAwesome as React.ComponentType<any>)}
            <Text style={styles.optionLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedStars !== null && (
        <View style={[styles.feedbackBox, feedbackOpacityStyle]}>
          <Text style={styles.feedbackText}>{feedbackTextFor(selectedStars)}</Text>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>TIẾP TỤC</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBackHome}>
            <Text style={styles.backButtonText}>← Trở về trang chính</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
