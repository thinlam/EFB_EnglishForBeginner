// utils/notify.ts
import Toast from 'react-native-toast-message';

export function notifySuccess(message: string) {
  Toast.show({
    type: 'success',
    text1: 'Success 🎉',
    text2: message,
    position: 'top',
    topOffset: 50,
  });
}

export function notifyError(message: string) {
  Toast.show({
    type: 'error',
    text1: 'Oops...',
    text2: message,
    position: 'top',
    topOffset: 50,
  });
}

export function notifyInfo(message: string) {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    position: 'top',
    topOffset: 50,
  });
}
