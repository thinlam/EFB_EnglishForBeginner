// ===============================
// SCREEN: Create Listen (Firebase Storage Version)
// ===============================

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Styles */
import { ListenCreateStyles as CS } from '@/components/style/admin/listen/listen-create-styles';
import { COLORS, ListenStyles as S } from '@/components/style/admin/listen/listen-screen-styles';

/* Firebase */
import { db, storage } from "@/scripts/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

/* expo-video */
import { VideoView, useVideoPlayer } from 'expo-video';

<<<<<<< HEAD
/* ================== Cloudinary Config ================== */
const CLOUD_NAME = 'djf9vnngm';
const CLOUD_PRESET = 'unsigned_mobile';
const CLOUD_FOLDER = 'lessons';
=======
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07

// ======================
// UTILS
// ======================
type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

<<<<<<< HEAD
const EXERCISE_BY_LEVEL: Record<CEFR, ExerciseType> = {
  A1: 'fill_gaps',
  A2: 'guess_object',
  B1: 'phoneme_choice',
  B2: 'phrase_gaps',
  C1: 'reading_mcq',
};

type QuestionKind = 'dictation' | 'fill_blank' | 'mcq' | 'summary';

type ListeningQuestion = {
  id: string;
  kind: QuestionKind;
  startSec: number;
  endSec: number;
  prompt: string;
  answer: string | string[];
  options?: string[];
};

type ListeningPayload = {
  kind: 'listening_template';
  level: CEFR;
  note?: string;
  questions: ListeningQuestion[];
};

/* Các dạng payload legacy (dạng cũ theo exerciseType) */
type LegacyFillGapsPayload = {
  sentence: string;
  answer: string;
};

type LegacyGuessObjectPayload = {
  options: string[];
  correctIndex: number;
};

type LegacyPhonemeChoicePayload = {
  word: string;
  ipaOptions: string[];
};

type LegacyPhraseGapsPayload = {
  paragraph: string;
  gaps: any[];
};

type LegacyReadingMcqPayload = {
  passage: string;
  questions: any[];
};

type ListenPayload =
  | ListeningPayload
  | LegacyFillGapsPayload
  | LegacyGuessObjectPayload
  | LegacyPhonemeChoicePayload
  | LegacyPhraseGapsPayload
  | LegacyReadingMcqPayload;

type ListenDoc = {
  title: string;
  transcript: string;
  audioUrl?: string | null;
  mediaType?: string | null;
  level: CEFR;
  exerciseType?: ExerciseType;
  payload?: ListenPayload | null;
  isPublished?: boolean;

  // file tài liệu bài tập
  exerciseFileUrl?: string | null;
  exerciseFileName?: string | null;
};

/* ================= Utils ================= */
=======
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 60);
}
function isHlsUrl(u: string) {
  return (u || '').toLowerCase().endsWith('.m3u8');
}
<<<<<<< HEAD
function isCloudinaryVideoUrl(u: string) {
  const lower = (u || '').toLowerCase();
  return lower.includes('res.cloudinary.com') && lower.includes('/video/upload/');
}
function isVideoUrl(u: string) {
  const l = (u || '').toLowerCase();
  return (
    l.endsWith('.mp4') ||
    l.endsWith('.m4v') ||
    l.endsWith('.mov') ||
    isHlsUrl(l) ||
    isCloudinaryVideoUrl(l)
  );
}
function inferMediaTypeFromUrl(u: string): string {
  const lower = (u || '').toLowerCase();
  if (isHlsUrl(lower)) return 'application/x-mpegURL';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/x-m4a';
  if (lower.endsWith('.mp3') || lower.endsWith('.mpeg')) return 'audio/mpeg';
  if (isVideoUrl(lower)) return 'video/mp4';
  return 'audio/mpeg';
}
function getExt(uriOrName: string, fallback = 'mp3') {
  const clean = (uriOrName || '').split('?')[0];
  const ext = (clean.split('.').pop() || fallback).toLowerCase();
  return ext;
}
function isAudioExt(ext: string) {
  return ['mp3', 'mpeg', 'm4a', 'wav'].includes(ext);
}
function guessAudioMime(ext: string) {
  if (ext === 'wav') return 'audio/wav';
  if (ext === 'm4a') return 'audio/x-m4a';
  return 'audio/mpeg';
}
function guessVideoMime(ext: string) {
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'm4v') return 'video/x-m4v';
  if (ext === 'webm') return 'video/webm';
  return 'video/mp4';
=======

function inferMediaType(url: string) {
  const l = url.toLowerCase();
  if (l.endsWith(".mp3")) return "audio/mpeg";
  if (l.endsWith(".wav")) return "audio/wav";
  if (l.endsWith(".m4a")) return "audio/x-m4a";
  if (l.endsWith(".mp4")) return "video/mp4";
  if (l.endsWith(".mov")) return "video/quicktime";
  return "audio/mpeg";
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
}


// ======================
// MEDIA PREVIEW
// ======================
function MediaPreview({ uri, mediaType }: { uri: string | null; mediaType?: string | null }) {

  // ALWAYS INIT player with a safe source
  const player = useVideoPlayer(
    null, // <— MUST be null, NOT undefined
    (p) => {
      p.loop = false;
    }
<<<<<<< HEAD
  } else {
    if (videoDelivery === 'hls') {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_auto,q_auto:good/${public_id}.m3u8`;
      mediaType = 'application/x-mpegURL';
    } else {
      deliveryUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_mp4,q_auto:good/${public_id}.mp4`;
      mediaType = 'video/mp4';
    }
  }

  return { secure_url, public_id, deliveryUrl, mediaType, isAudio };
}

/* Upload raw file (Word / Excel / PDF) */
async function uploadRawFileToCloudinary(
  localUri: string,
  folder: string,
  baseName?: string,
  onProgress?: (pct: number) => void
): Promise<{ secure_url: string; public_id: string }> {
  const fileName = `${baseName || 'file'}_${Date.now()}`;

  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: fileName,
    type: 'application/octet-stream',
  } as any);
  form.append('upload_preset', CLOUD_PRESET);
  form.append('folder', `${CLOUD_FOLDER}/${folder}`);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

  const res = await new Promise<{ status: number; text: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / Math.max(e.total, 1)) * 100));
      }
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) resolve({ status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = (err) => reject(err);
    xhr.open('POST', url);
    xhr.send(form);
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${res.text}`);
  }

  const json = JSON.parse(res.text);
  return {
    secure_url: json.secure_url as string,
    public_id: json.public_id as string,
  };
}

/* ================= Listening templates theo Level ================= */
function getDefaultPayloadForLevel(level: CEFR): ListeningPayload {
  switch (level) {
    // ... giữ nguyên toàn bộ switch như bạn đã có ...
    // (mình không rút gọn để bạn dễ copy; đoạn này y hệt code bạn gửi)
    case 'A1':
      return {
        kind: 'listening_template',
        level,
        note: 'A1 – nghe câu ngắn, điền từ và chọn đáp án đơn giản. Điền startSec/endSec theo audio.',
        questions: [
          {
            id: 'a1_q1',
            kind: 'dictation',
            startSec: 0,
            endSec: 4,
            prompt: 'Type what you hear.',
            answer: 'Billy, are you able to send emails?',
          },
          {
            id: 'a1_q2',
            kind: 'fill_blank',
            startSec: 5,
            endSec: 9,
            prompt: 'I can’t _______ to my account.',
            answer: 'connect',
            options: ['connect', 'control', 'continue'],
          },
          {
            id: 'a1_q3',
            kind: 'mcq',
            startSec: 10,
            endSec: 15,
            prompt: 'What problem does the speaker have?',
            answer: 'He can’t send emails.',
            options: ['He can’t send emails.', 'He can’t open a file.', 'The internet is slow.'],
          },
          {
            id: 'a1_q4',
            kind: 'mcq',
            startSec: 16,
            endSec: 20,
            prompt: 'How does the speaker greet the other person?',
            answer: 'Hello.',
            options: ['Hello.', 'Goodbye.', 'Thank you.'],
          },
        ],
      };

    case 'A2':
      return {
        kind: 'listening_template',
        level,
        note: 'A2 – tình huống đơn giản, nghe – điền từ và hỏi ý chính.',
        questions: [
          {
            id: 'a2_q1',
            kind: 'fill_blank',
            startSec: 0,
            endSec: 4,
            prompt: 'Complete the sentence you hear.',
            answer: 'I can’t connect to my account.',
          },
          {
            id: 'a2_q2',
            kind: 'fill_blank',
            startSec: 5,
            endSec: 9,
            prompt: 'I can’t _______ to my account.',
            answer: 'connect',
            options: ['connect', 'control', 'continue'],
          },
          {
            id: 'a2_q3',
            kind: 'mcq',
            startSec: 10,
            endSec: 15,
            prompt: 'What is the main problem?',
            answer: 'He cannot send emails.',
            options: [
              'He cannot send emails.',
              'He cannot open the browser.',
              'He cannot print a document.',
            ],
          },
          {
            id: 'a2_q4',
            kind: 'mcq',
            startSec: 16,
            endSec: 22,
            prompt: 'Where does this conversation probably take place?',
            answer: 'In an office.',
            options: ['In an office.', 'At a restaurant.', 'At a supermarket.'],
          },
        ],
      };

    case 'B1':
      return {
        kind: 'listening_template',
        level,
        note: 'B1 – hội thoại ngắn, nghe – chép câu và chọn nguyên nhân / giải pháp.',
        questions: [
          {
            id: 'b1_q1',
            kind: 'dictation',
            startSec: 0,
            endSec: 5,
            prompt: 'Write down the full sentence you hear.',
            answer: 'An error message keeps popping up that says "Unable to connect".',
          },
          {
            id: 'b1_q2',
            kind: 'dictation',
            startSec: 6,
            endSec: 11,
            prompt: 'Write down what the speaker says.',
            answer: 'I just called down to the IT Department.',
          },
          {
            id: 'b1_q3',
            kind: 'mcq',
            startSec: 12,
            endSec: 18,
            prompt: 'Why did the speaker call the IT Department?',
            answer: 'To report an email problem.',
            options: [
              'To report an email problem.',
              'To buy new software.',
              'To ask for a password reset.',
            ],
          },
          {
            id: 'b1_q4',
            kind: 'mcq',
            startSec: 19,
            endSec: 25,
            prompt: 'What will probably happen next?',
            answer: 'The problem will be fixed soon.',
            options: [
              'The problem will be fixed soon.',
              'The system will be turned off permanently.',
              'The speaker will quit the job.',
            ],
          },
        ],
      };

    case 'B2':
      return {
        kind: 'listening_template',
        level,
        note: 'B2 – đoạn dài hơn, nghe – hoàn thành câu và chọn ý đúng nhất.',
        questions: [
          {
            id: 'b2_q1',
            kind: 'fill_blank',
            startSec: 0,
            endSec: 7,
            prompt: 'Complete the sentence from the audio.',
            answer:
              'The technician explained that sometimes there are outages and they are controlled locally.',
          },
          {
            id: 'b2_q2',
            kind: 'fill_blank',
            startSec: 8,
            endSec: 14,
            prompt: 'Fill in the missing parts.',
            answer: ['sometimes there are outages', 'they are controlled locally'],
          },
          {
            id: 'b2_q3',
            kind: 'mcq',
            startSec: 15,
            endSec: 22,
            prompt: 'What is the technician explaining?',
            answer: 'The reason for the email outage.',
            options: [
              'The reason for the email outage.',
              'How to install new software.',
              'How to change the computer.',
            ],
          },
          {
            id: 'b2_q4',
            kind: 'mcq',
            startSec: 23,
            endSec: 30,
            prompt: 'What is implied about the problem?',
            answer: 'It will be solved at the local level.',
            options: [
              'It will be solved at the local level.',
              'It is a global company-wide problem.',
              'No one is responsible for it.',
            ],
          },
        ],
      };

    case 'C1':
    default:
      return {
        kind: 'listening_template',
        level: 'C1',
        note: 'C1 – nghe đoạn dài, tóm tắt ý chính và trả lời câu hỏi phân tích.',
        questions: [
          {
            id: 'c1_q1',
            kind: 'summary',
            startSec: 0,
            endSec: 20,
            prompt: 'Summarise the main problem with the email system in one sentence.',
            answer:
              'The local control device fails periodically, causing repeated interruptions in the email service.',
          },
          {
            id: 'c1_q2',
            kind: 'summary',
            startSec: 21,
            endSec: 40,
            prompt: 'Summarise the technician’s explanation in one sentence.',
            answer:
              'The technician explains that outages are local and occur during maintenance or hardware failure.',
          },
          {
            id: 'c1_q3',
            kind: 'mcq',
            startSec: 41,
            endSec: 55,
            prompt: 'According to the audio, what is the biggest risk for the company?',
            answer: 'Frequent local outages can disrupt critical communication.',
            options: [
              'Frequent local outages can disrupt critical communication.',
              'The company will lose all of its data.',
              'Employees will stop using email completely.',
            ],
          },
          {
            id: 'c1_q4',
            kind: 'mcq',
            startSec: 56,
            endSec: 70,
            prompt: 'What is the most likely long-term solution mentioned?',
            answer: 'Upgrading the local control system or moving to a more stable platform.',
            options: [
              'Upgrading the local control system or moving to a more stable platform.',
              'Stopping all email communication.',
              'Asking employees to check email less often.',
            ],
          },
        ],
      };
  }
}

/* ================= Level Picker ================= */
const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function LevelPickerRow({ value, onChange }: { value: CEFR; onChange: (v: CEFR) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[S.filterPicker, CS.levelPickerTrigger]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}>
        <Text style={S.filterValueText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={S.filterChevron} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={CS.levelModalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={CS.levelModalContainer}>
            <View style={CS.levelModalHeader}>
              <Text style={CS.levelModalTitle}>Chọn cấp độ</Text>
            </View>

            {LEVELS.map((lv) => (
              <TouchableOpacity
                key={lv}
                style={CS.levelOptionRow}
                activeOpacity={0.9}
                onPress={() => {
                  onChange(lv);
                  setOpen(false);
                }}>
                <Text
                  style={[
                    CS.levelOptionText,
                    value === lv && CS.levelOptionTextActive,
                  ]}>
                  {lv}
                </Text>
                {value === lv && <Ionicons name="checkmark" size={18} color={COLORS.create} />}
              </TouchableOpacity>
            ))}

            <View style={CS.levelModalFooter}>
              <TouchableOpacity onPress={() => setOpen(false)} style={CS.levelModalCloseBtn}>
                <Text style={CS.levelModalCloseText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
=======
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  );

  const isVideo = mediaType?.startsWith("video/");

  // Replace source when uri changes
  useEffect(() => {
<<<<<<< HEAD
    player.replace(uri);
    return () => {
      try {
        player.pause();
      } catch {
        // ignore
      }
    };
  }, [uri, player]);

  return (
    <View style={CS.mediaPreviewWrapper}>
      <View style={CS.mediaPreviewCard}>
        <Text style={CS.mediaPreviewTitle}>Preview {isVideoMedia ? 'Video' : 'Audio'}</Text>
        <View
          style={[
            CS.mediaPreviewPlayerBase,
            isVideoMedia ? CS.mediaPreviewPlayerVideo : CS.mediaPreviewPlayerAudio,
          ]}>
          <VideoView
            player={player}
            style={CS.mediaPreviewVideoView}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="contain"
          />
        </View>
=======
    if (uri) {
      player.replace({ uri });  // expo-video v2 expects an object
    }
  }, [uri]);


  // No media → return empty container (NOT null)
  if (!uri) {
    return <View style={{ height: 10 }} />;
  }

  return (
    <View style={CS.mediaPreviewWrapper}>
      <Text style={CS.mediaPreviewTitle}>
        Preview {isVideo ? "Video" : "Audio"}
      </Text>

      <View
        style={
          isVideo
            ? CS.mediaPreviewPlayerVideo
            : CS.mediaPreviewPlayerAudio
        }
      >
        <VideoView
          player={player}
          style={CS.mediaPreviewVideoView}
          contentFit="contain"
        />
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
      </View>
    </View>
  );
}

<<<<<<< HEAD
/* ================= Payload validation ================= */
function validatePayload(parsedPayload: any, exerciseType: ExerciseType) {
  // Payload kiểu mới: có mảng questions
  if (Array.isArray(parsedPayload?.questions)) {
    if (!parsedPayload.questions.length) {
      throw new Error('Payload cần ít nhất 1 câu hỏi trong mảng "questions".');
    }
    return;
  }

  // Payload kiểu cũ: validate theo exerciseType
  switch (exerciseType) {
    case 'fill_gaps':
      if (!(parsedPayload?.sentence && parsedPayload?.answer)) {
        throw new Error('Bài A1 cần có "sentence" và "answer".');
      }
      break;
    case 'guess_object':
      if (
        !(
          Array.isArray(parsedPayload?.options) &&
          Number.isInteger(parsedPayload?.correctIndex)
        )
      ) {
        throw new Error('Bài A2 cần có "options" (mảng) và "correctIndex".');
      }
      break;
    case 'phoneme_choice':
      if (!(parsedPayload?.word && Array.isArray(parsedPayload?.ipaOptions))) {
        throw new Error('Bài B1 cần "word" và "ipaOptions" (mảng).');
      }
      break;
    case 'phrase_gaps':
      if (!(parsedPayload?.paragraph && Array.isArray(parsedPayload?.gaps))) {
        throw new Error('Bài B2 cần "paragraph" và "gaps" (mảng).');
      }
      break;
    case 'reading_mcq':
      if (!(parsedPayload?.passage && Array.isArray(parsedPayload?.questions))) {
        throw new Error('Bài C1 cần "passage" và "questions" (mảng).');
      }
      break;
    default:
      break;
  }
}

/* ================= Screen ================= */
export default function ListenCreateScreen() {
=======


// ======================
// MAIN SCREEN
// ======================
export default function ListenCreate() {
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params?.id || '';

  const [loadingDoc, setLoadingDoc] = useState(!!editId);

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState<CEFR>('A1');
<<<<<<< HEAD
  const [exerciseType, setExerciseType] = useState<ExerciseType>(EXERCISE_BY_LEVEL['A1']);
  const [payloadText, setPayloadText] = useState('');
  const [payloadError, setPayloadError] = useState<string | null>(null);

  const [picked, setPicked] = useState<{
    name: string;
    uri: string;
    file?: any;
    mimeType?: string | null;
  } | null>(null);

  // file tài liệu bài tập (Word/PDF/Excel)
  const [exerciseFile, setExerciseFile] = useState<{ name: string; uri: string } | null>(null);
  const [originalExerciseFile, setOriginalExerciseFile] = useState<{
    url?: string | null;
    name?: string | null;
  }>({});
  const [exerciseFileRemoved, setExerciseFileRemoved] = useState(false);
=======

  const [picked, setPicked] = useState<{ name: string; uri: string } | null>(null);
  const [exerciseFile, setExerciseFile] = useState<{ name: string; uri: string } | null>(null);

  const [originalMedia, setOriginalMedia] = useState<{ url?: string | null; mediaType?: string | null }>({});
  const [originalExercise, setOriginalExercise] = useState<{ url?: string | null; name?: string | null }>({});
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);


  // LOAD DOC WHEN EDIT
  useEffect(() => {
    if (!editId) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'listens', editId));
        if (!snap.exists()) return router.back();

<<<<<<< HEAD
          setTitle(d.title || '');
          setTranscript(d.transcript || '');
          setLevel(d.level || 'A1');
          setExerciseType(exType);
          setPayloadText(d.payload ? JSON.stringify(d.payload, null, 2) : '');
          setUrlInput(d.audioUrl || '');
          setOriginal({ audioUrl: d.audioUrl ?? undefined, mediaType: d.mediaType ?? null });
          setOriginalExerciseFile({
            url: d.exerciseFileUrl ?? null,
            name: d.exerciseFileName ?? null,
          });
        } else {
          router.back();
        }
      } catch (e: any) {
        Alert.alert('Lỗi', e?.message ?? 'Không tải được dữ liệu.');
=======
        const d = snap.data() as any;

        setTitle(d.title || '');
        setTranscript(d.transcript || '');
        setLevel(d.level || 'A1');

        setOriginalMedia({
          url: d.audioUrl,
          mediaType: d.mediaType || null,
        });

        setOriginalExercise({
          url: d.exerciseFileUrl,
          name: d.exerciseFileName
        });

      } catch (err) {
        Alert.alert("Lỗi", "Không tải được dữ liệu");
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, []);

  // PICK MEDIA
  const pickMedia = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: ["audio/*", "video/*"],
      copyToCacheDirectory: true,
<<<<<<< HEAD
      multiple: false,
      type: [
        'video/mp4',
        'video/quicktime',
        'video/x-m4v',
        'video/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-m4a',
      ],
=======
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
    });

    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) {
      setPicked({
        name: f.name ?? "media",
        uri: f.uri,
      });
    }
  };

  // PICK EXERCISE FILE
  const pickExercise = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (r.canceled) return;
    const f = r.assets?.[0];
    if (f?.uri) {
      setExerciseFile({
        name: f.name!,
        uri: f.uri
      });
    }
  };


  // FIREBASE UPLOAD
  async function uploadToFirebase(localUri: string, path: string, onProgress: (p: number) => void) {
    const response = await fetch(localUri);
    const blob = await response.blob();

<<<<<<< HEAD
    const apply = () => {
      setPayloadError(null);
      setPayloadText(pretty);
    };

    if (payloadText.trim()) {
      Alert.alert(
        'Ghi đè payload?',
        `Payload hiện tại sẽ được thay bằng sườn mẫu cho level ${level}.`,
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Đồng ý', onPress: apply },
        ]
      );
    } else {
      apply();
    }
  };
=======
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress(pct);
        },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  }
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07


  // SAVE
  const onSave = async () => {
    Keyboard.dismiss();

    if (!title.trim()) return Alert.alert("Thiếu Title");
    if (!picked?.uri && !originalMedia.url)
      return Alert.alert("Thiếu file media");

    setBusy(true);
    setProgress(0);

<<<<<<< HEAD
    // Parse payload JSON (admin tự nhập)
    let parsedPayload: ListenPayload | {} = {};
    try {
      setPayloadError(null);
      parsedPayload = payloadText.trim()
        ? (JSON.parse(payloadText) as ListenPayload)
        : {};
    } catch (e) {
      setPayloadError('Payload không hợp lệ. Vui lòng kiểm tra lại cú pháp JSON.');
      setBusy(false);
      return;
    }

    // Validate cơ bản
    try {
      if (Object.keys(parsedPayload).length > 0) {
        validatePayload(parsedPayload, exerciseType);
      }
    } catch (e: any) {
      Alert.alert('Thiếu dữ liệu', e.message);
      setBusy(false);
      return;
    }

    try {
      // xử lý media audio/video
      let finalUrl = urlInput.trim() || original.audioUrl || '';
      let mediaType = original.mediaType ?? null;
=======
    try {
      //-- Upload media
      let finalUrl = originalMedia.url || null;
      let mediaType = originalMedia.mediaType || null;
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07

      if (picked?.uri) {
        const ext = picked.name.toLowerCase().split('.').pop();
        const baseName = slugify(title);

        const path = `listen/${baseName}_${Date.now()}.${ext}`;
        finalUrl = await uploadToFirebase(picked.uri, path, setProgress);
        mediaType = inferMediaType(finalUrl);
      }

      //-- Upload exercise file
      let exerciseFileUrl = originalExercise.url ?? null;
      let exerciseFileName = originalExercise.name ?? null;

      if (exerciseFile?.uri) {
<<<<<<< HEAD
        const { secure_url } = await uploadRawFileToCloudinary(
          exerciseFile.uri,
          'exercise_files',
          slugify(title),
          (pct) => setProgress(pct)
        );
        exerciseFileUrl = secure_url;
=======
        const ext = exerciseFile.name.split('.').pop();
        const path = `listen/files/${slugify(title)}_${Date.now()}.${ext}`;

        exerciseFileUrl = await uploadToFirebase(exerciseFile.uri, path, setProgress);
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
        exerciseFileName = exerciseFile.name;
      }

      //-- SAVE FIRESTORE
      const payload = {
        title: title.trim(),
        transcript: transcript.trim(),
        level,
        audioUrl: finalUrl!,
        mediaType,
        exerciseFileUrl,
        exerciseFileName,
        updatedAt: serverTimestamp(),
      };

      if (editId) {
<<<<<<< HEAD
        // sửa: không đụng vào isPublished → giữ trạng thái publish hiện tại
        await updateDoc(doc(db, 'listens', editId), basePayload);
      } else {
        // tạo mới: luôn là bản nháp, publish ở ListenScreen
        await addDoc(collection(db, 'listens'), {
          ...basePayload,
=======
        await updateDoc(doc(db, "listens", editId), payload);
      } else {
        await addDoc(collection(db, "listens"), {
          ...payload,
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
          isPublished: false,
          createdAt: serverTimestamp(),
        });
      }

      router.replace("/(admin)/listen/listen-screen");

    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể lưu");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

<<<<<<< HEAD
  /* ---------- UI ---------- */
  const effectiveUrl = (urlInput || original.audioUrl || '').trim();
  const effectiveMediaType =
    (picked?.name
      ? isAudioExt(getExt(picked.name))
        ? guessAudioMime(getExt(picked.name))
        : guessVideoMime(getExt(picked.name))
      : original.mediaType ?? null) ||
    (effectiveUrl ? inferMediaTypeFromUrl(effectiveUrl) : null);

  const saveDisabled =
    busy || !title.trim() || (!picked?.uri && !urlInput.trim() && !original.audioUrl);
=======

  // PREVIEW
  const effectiveUrl = picked?.uri || originalMedia.url || null;
  const effectiveMediaType = picked
    ? inferMediaType(picked.name)
    : originalMedia.mediaType;
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07


  // UI
  const Form = (
    <>
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
<<<<<<< HEAD
        <Text style={S.headerTitle}>{editId ? 'Sửa bài nghe' : 'Tạo bài nghe'}</Text>
        <View style={CS.headerRightPlaceholder} />
=======
        <Text style={S.headerTitle}>{editId ? "Sửa bài nghe" : "Tạo bài nghe"}</Text>
        <View />
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
      </View>

      {loadingDoc ? (
        <View style={CS.loadingContainer}>
          <ActivityIndicator color={COLORS.create} />
        </View>
      ) : (
        <ScrollView
          style={CS.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <View style={CS.screen}>
            {/* INFO */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Thông tin</Text>

              <Text style={CS.label}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={CS.input}
                placeholder="Unit 1 - Greetings"
                placeholderTextColor={COLORS.muted}
              />

              <Text style={CS.label}>Level</Text>
              <TextInput
                value={level}
                editable={false}
                style={CS.input}
              />

              <Text style={CS.label}>Transcript</Text>
              <TextInput
                value={transcript}
                onChangeText={setTranscript}
                multiline
                style={[CS.input, CS.inputMultiline]}
                placeholder="A: Hello! How are you?"
                placeholderTextColor={COLORS.muted}
              />
            </View>


<<<<<<< HEAD
              <View style={CS.exerciseHeaderRow}>
                <Text style={CS.label}>Exercise Type</Text>
                <TouchableOpacity
                  style={CS.templateBtn}
                  onPress={applyLevelTemplate}
                  activeOpacity={0.9}>
                  <Ionicons
                    name="flash-outline"
                    size={14}
                    color={COLORS.bg}
                    style={CS.templateBtnIcon}
                  />
                  <Text style={CS.templateBtnText}>Áp dụng sườn</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={exerciseType}
                editable={false}
                style={[CS.input, CS.exerciseTypeInput]}
              />

              <Text style={CS.label}>Payload</Text>
              {payloadError && (
                <Text
                  style={{
                    color: 'red',
                    marginBottom: 4,
                    fontSize: 12,
                  }}>
                  {payloadError}
                </Text>
              )}
              <TextInput
                value={payloadText}
                onChangeText={setPayloadText}
                multiline
                style={[
                  CS.input,
                  CS.inputMultiline,
                  CS.payloadInput,
                  payloadError ? { borderColor: 'red' } : null,
                ]}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Tài liệu kèm theo */}
              <Text style={CS.label}>Tài liệu (Word / Excel / PDF)</Text>
              <TouchableOpacity
                style={[CS.pickBtn, busy && CS.pickBtnDisabled]}
                activeOpacity={0.85}
                onPress={pickExerciseFile}
                disabled={busy}>
                <Text style={CS.pickBtnText}>
                  {exerciseFile ? 'Chọn lại file tài liệu' : 'Chọn file tài liệu'}
                </Text>
              </TouchableOpacity>

              {(exerciseFile || originalExerciseFile.url) && (
                <View style={CS.exerciseFileMetaRow}>
                  <Text style={CS.fileName} numberOfLines={1}>
                    📎 {exerciseFile?.name ?? originalExerciseFile.name ?? originalExerciseFile.url}
                  </Text>
                  <TouchableOpacity
                    onPress={removeExerciseFile}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                    <Text style={CS.removeFileText}>Xoá file</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* SECTION 3: Media */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Media</Text>

              <Text style={CS.label}>URL (mp3/mp4/m3u8)</Text>
              <TextInput
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                placeholder="https://…(.mp3 | .mp4 | .m3u8)"
                placeholderTextColor={COLORS.muted}
                style={CS.input}
              />
              {!!original.audioUrl && !urlInput && !picked && (
                <Text style={CS.fileName}>Giữ nguyên URL cũ: {original.audioUrl}</Text>
              )}

=======
            {/* MEDIA */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Media</Text>

>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
              <TouchableOpacity
                onPress={pickMedia}
                style={CS.pickBtn}
              >
                <Text style={CS.pickBtnText}>
                  {picked ? "Chọn lại file" : "Chọn file từ máy"}
                </Text>
              </TouchableOpacity>

              {picked && (
                <Text style={CS.fileName}>📄 {picked.name}</Text>
              )}

              {effectiveUrl && (
                <MediaPreview uri={effectiveUrl} mediaType={effectiveMediaType} />
              )}

<<<<<<< HEAD
              {busy && <Text style={CS.progressText}>Đang upload… {progress}%</Text>}
=======
              {busy && (
                <Text style={CS.progressText}>Đang upload… {progress}%</Text>
              )}
            </View>


            {/* EXERCISE FILE */}
            <View style={CS.sectionCard}>
              <Text style={CS.sectionTitle}>Tài liệu (Word/PDF)</Text>

              <TouchableOpacity onPress={pickExercise} style={CS.pickBtn}>
                <Text style={CS.pickBtnText}>Chọn file tài liệu</Text>
              </TouchableOpacity>

              {(exerciseFile || originalExercise.url) && (
                <Text style={CS.fileName}>
                  📎 {exerciseFile?.name || originalExercise.name}
                </Text>
              )}
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
            </View>


            {/* SAVE */}
            <TouchableOpacity
              disabled={busy || !title || !effectiveUrl}
              onPress={onSave}
<<<<<<< HEAD
              style={[CS.saveBtn, saveDisabled && CS.saveBtnDisabled]}>
=======
              style={[
                CS.saveBtn,
                (busy || !title || !effectiveUrl) && CS.saveBtnDisabled,
              ]}
            >
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
<<<<<<< HEAD
                <Text style={CS.saveBtnText}>{editId ? 'Cập nhật' : 'Lưu'}</Text>
=======
                <Text style={CS.saveBtnText}>{editId ? "Cập nhật" : "Lưu"}</Text>
>>>>>>> 253bdbd98d032668c29675d1b9e5a08adf107f07
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </>
  );


  if (Platform.OS === "web") {
    return (
      <View style={[S.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        {Form}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[S.container, { paddingTop: insets.top }]}>
          <StatusBar barStyle="light-content" />
          {Form}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
