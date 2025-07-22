import ChatbotButton from '@/components/ChatbotButton';
import HeaderInfo from '@/components/HeaderInfo';
import LessonButton from '@/components/LessonButton';
import LevelProgress from '@/components/LevelProgress';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <HeaderInfo />
        <LevelProgress />
        
        <LessonButton title="Lesson 01" icon="pencil" />
        <LessonButton title="Play Game" icon="game-controller" />
        <LessonButton title="Từ điển" icon="book" />
        </ScrollView>

      <ChatbotButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});
