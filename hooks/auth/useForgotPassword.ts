import { sendOtpApi /*, verifyOtpApi*/ } from '@/services/auth/otpService';
import { isEmail } from '@/utils/auth/validators';
import React from 'react';
import Toast from 'react-native-toast-message';

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

  // cooldown
  const [cooldown, setCooldown] = React.useState(0);
  const cooldownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const titleText = React.useMemo(
    () => 'Enter your email to receive an OTP code',
    []
  );

  React.useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = React.useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* ---------- Toast helpers ---------- */
  const showError = (title: string, message: string) => {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 60,
    });
  };

  const showSuccess = (title: string, message: string) => {
    Toast.show({
      type: 'success',
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 60,
    });
  };

  /* ---------- SEND OTP ---------- */
  const sendOtp = React.useCallback(async () => {
    if (!isEmail(email)) {
      return showError('Invalid email', 'Please enter a valid email address.');
    }

    if (loading || cooldown > 0) return;

    try {
      setLoading(true);
      const data = await sendOtpApi(email);

      if (data?.success) {
        setSentOtp(true);
        setServerOtp(data.otp ?? ''); // DEMO ONLY
        startCooldown();

        showSuccess('OTP sent', 'An OTP code has been sent to your email.');
      } else {
        const msg = data?.message || 'Unable to send OTP. Please try again.';
        showError('Failed to send OTP', msg);
      }
    } catch (err: any) {
      const aborted = err?.name === 'AbortError';
      showError(
        'Request failed',
        aborted ? 'Request timed out. Please try again.' : 'Unable to connect to server.'
      );
    } finally {
      setLoading(false);
    }
  }, [email, loading, cooldown, startCooldown]);

  /* ---------- VERIFY OTP ---------- */
  const verifyOtp = React.useCallback(async () => {
    if (!sentOtp) {
      return showError('OTP not sent', 'Please request an OTP code first.');
    }

    if (!otp || otp.length < OTP_LENGTH) {
      return showError(
        'Incomplete OTP',
        `Please enter all ${OTP_LENGTH} OTP digits.`
      );
    }

    // DEMO: compare with local serverOtp
    if (otp === serverOtp) {
      showSuccess('OTP verified', 'Your email has been verified.');
      opts?.onVerified?.(email);
      return;
    } else {
      return showError('Incorrect OTP', 'The OTP you entered is incorrect.');
    }

    /* ---------- PROD (real API) ----------
    if (loading) return;
    try {
      setLoading(true);
      const data = await verifyOtpApi({
        email,
        transactionId: transactionId!,
        otp,
      });

      if (data?.success) {
        showSuccess('OTP verified', 'Your email has been verified.');
        opts?.onVerified?.(email);
      } else {
        showError('Invalid OTP', data?.message || 'OTP is incorrect or expired.');
      }
    } catch (err: any) {
      const aborted = err?.name === 'AbortError';
      showError(
        'Request failed',
        aborted ? 'Request timed out. Please try again.' : 'Unable to connect to server.'
      );
    } finally {
      setLoading(false);
    }
    ------------------------------------- */
  }, [email, otp, sentOtp, serverOtp, OTP_LENGTH, opts]);

  return {
    // state
    email,
    setEmail,
    otp,
    setOtp,
    sentOtp,
    loading,
    cooldown,
    OTP_LENGTH,
    titleText,

    // actions
    sendOtp,
    verifyOtp,
  };
}
