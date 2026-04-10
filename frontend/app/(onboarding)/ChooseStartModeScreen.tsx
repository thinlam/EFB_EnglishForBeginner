import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* Styles */
// eslint-disable-next-line import/no-unresolved
import { styles } from '@/components/style/onboarding/ChooseStartModeStyles';

/* Constants */
// eslint-disable-next-line import/no-unresolved
import { START_OPTIONS } from '@/constants/onboarding/startModes';

/* Hook */
// eslint-disable-next-line import/no-unresolved
import { useChooseStartMode } from '@/hooks/onboarding/useChooseStartMode';

export default function ChooseStartModeScreen() {
  const { selected, setSelected, canContinue, handleContinue } = useChooseStartMode();

  const handleSelect = (opt: any) => {
    if (opt.locked) {
      Alert.alert("Coming Soon", "Tính năng này đang phát triển.");
      return;
    }
    setSelected(opt.key);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Giờ mình cùng tìm điểm khởi hành phù hợp nhé!</Text>

        {START_OPTIONS.map((opt) => {
          const isLocked = opt.locked;
          const isSelected = selected === opt.key && !isLocked;

          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.85}
              disabled={isLocked}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                isLocked && { opacity: 0.45 },
              ]}
            >
              <View style={styles.row}>
                <Image source={opt.icon} style={styles.icon} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>

                  {opt.comingSoon && (
                    <View style={styles.badgeSoon}>
                      <Text style={styles.badgeSoonText}>COMING SOON</Text>
                    </View>
                  )}
                </View>

                {isLocked && (
                  <Text style={{ fontSize: 18, color: '#666', marginLeft: 6 }}>🔒</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        disabled={!canContinue}
        onPress={handleContinue}
        style={[
          styles.continueButton,
          { backgroundColor: canContinue ? '#2563eb' : '#d1d5db' },
        ]}
      >
        <Text style={styles.continueText}>TIẾP TỤC</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
