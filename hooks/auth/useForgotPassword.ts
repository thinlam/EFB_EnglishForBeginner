import { sendOtpApi /*, verifyOtpApi*/ } from '@/services/auth/otpService';
import { isEmail } from '@/utils/auth/validators';
import React from 'react';
import { Alert } from 'react-native';

type Opts = {
  onVerified?: (email: string) => void;
};

export function useForgotPassword(opts?: Opts) {
  // constants
  const OTP_LENGTH = 6;
  const COOLDOWN_SECONDS = 60;

  // state
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [sentOtp, setSentOtp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [serverOtp, setServerOtp] = React.useState(''); // DEMO ONLY
  // const [transactionId, setTransactionId] = React.useState<string | null>(null); // PROD

  // cooldown
  const [cooldown, setCooldown] = React.useState(0);
  const cooldownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const titleText = React.useMemo(() => 'Enter Gmail to receive OTP code', []);

  React.useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const startCooldown = React.useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendOtp = React.useCallback(async () => {
    if (!isEmail(email)) { Alert.alert('Error', 'Please enter a valid email.'); return; }
    if (loading || cooldown > 0) return;
    try {
      setLoading(true);
      const data = await sendOtpApi(email);
      if (data?.success) {
        setSentOtp(true);
        setServerOtp(data.otp ?? ''); // DEMO ONLY
        // setTransactionId(data.transactionId) // PROD
        startCooldown();
        Alert.alert('Success', 'OTP has been sent to your Gmail.');
      } else {
        const msg = data?.message || 'OTP failed to send, please try again.';
        Alert.alert('Lỗi', msg);
      }
    } catch (err: any) {
      const aborted = err?.name === 'AbortError';
      Alert.alert('Lỗi', aborted ? 'Timed out, please try again.' : 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [email, loading, cooldown, startCooldown]);

  const verifyOtp = React.useCallback(async () => {
    if (!sentOtp) { Alert.alert('Error', 'Please send OTP code first.'); return; }
    if (!otp || otp.length < OTP_LENGTH) { Alert.alert('Error', `Please enter enough ${OTP_LENGTH} OTP characters.`); return; }

    // DEMO ONLY — so sánh local
    if (otp === serverOtp) {
      opts?.onVerified?.(email);
      return;
    } else {
      Alert.alert('False', 'OTP code is incorrect.');
      return;
    }

    /*  -------- PROD flow ----------
    if (loading) return;
    try {
      setLoading(true);
      const data = await verifyOtpApi({ email, transactionId: transactionId!, otp });
      if (data?.success) opts?.onVerified?.(email);
      else Alert.alert('Sai mã', data?.message || 'OTP không đúng hoặc đã hết hạn.');
    } catch (err: any) {
      const aborted = err?.name === 'AbortError';
      Alert.alert('Lỗi', aborted ? 'Hết thời gian chờ, vui lòng thử lại.' : 'Không thể kết nối đến máy chủ.');
    } finally { setLoading(false); }
    -------------------------------- */
  }, [email, otp, sentOtp, serverOtp, OTP_LENGTH, opts]);

  return {
    // state
    email, setEmail, otp, setOtp, sentOtp, loading, cooldown, OTP_LENGTH, titleText,
    // actions
    sendOtp, verifyOtp,
  };
}
