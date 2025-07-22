import ChatbotButton from '@/components/ChatbotButton';
import HeaderInfo from '@/components/HeaderInfo';
import LessonButton from '@/components/LessonButton';
import LevelProgress from '@/components/LevelProgress';
import { styles } from '@/components/style/IndexStyles'; // Import styles from the IndexStyles file
import { ScrollView, View } from 'react-native';
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


