import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
import { styles } from '@/components/style/onboarding/ChooseStartModeStyles';

/* Constants */
import { START_OPTIONS } from '@/constants/onboarding/startModes';

/* Hook */
import { useChooseStartMode } from '@/hooks/onboarding/useChooseStartMode';

export default function ChooseStartModeScreen() {
  const { selected, setSelected, canContinue, handleContinue } = useChooseStartMode();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Giờ mình cùng tìm điểm khởi hành phù hợp nhé!</Text>

        {START_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionCard, selected === opt.key && styles.optionCardSelected]}
            onPress={() => setSelected(opt.key)}
            activeOpacity={0.85}
          >
            <View style={styles.row}>
              <Image source={opt.icon} style={styles.icon} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        disabled={!canContinue}
        onPress={handleContinue}
        style={[styles.continueButton, { backgroundColor: canContinue ? '#2563eb' : '#d1d5db' }]}
      >
        <Text style={styles.continueText}>TIẾP TỤC</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
