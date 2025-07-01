import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import CountrySelector from './CountrySelector';

interface MobileVerificationProps {
  value: string;
  onChange: (value: string) => void;
  onVerified: (verified: boolean) => void;
  className?: string;
}

const MobileVerification = ({ value, onChange, onVerified, className }: MobileVerificationProps) => {
  const [countryCode, setCountryCode] = useState('GB');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const countryPhoneCodes: { [key: string]: string } = {
    'GB': '+44',
    'US': '+1',
    'CA': '+1',
    'AU': '+61',
    'DE': '+49',
    'FR': '+33',
    'IT': '+39',
    'ES': '+34',
    'NL': '+31',
    'BE': '+32',
    'CH': '+41',
    'AT': '+43',
    'SE': '+46',
    'NO': '+47',
    'DK': '+45',
    'FI': '+358',
    'IE': '+353',
    'PT': '+351',
    'GR': '+30',
    'PL': '+48',
    'CZ': '+420',
    'HU': '+36',
    'SK': '+421',
    'SI': '+386',
    'HR': '+385',
    'RO': '+40',
    'BG': '+359',
    'LT': '+370',
    'LV': '+371',
    'EE': '+372',
    'MT': '+356',
    'CY': '+357',
    'LU': '+352'
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatPhoneNumber = (phone: string) => {
    const countryPrefix = countryPhoneCodes[countryCode] || '+44';
    const cleanPhone = phone.replace(/\D/g, '');
    return `${countryPrefix}${cleanPhone}`;
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your mobile number');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    try {
      const fullPhoneNumber = formatPhoneNumber(phoneNumber);
      
      // Use Supabase Auth for phone verification
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhoneNumber,
      });

      if (error) throw error;

      onChange(fullPhoneNumber);
      setIsCodeSent(true);
      setTimeLeft(600); // 10 minutes
      
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      setErrorMessage(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');
    try {
      const fullPhoneNumber = formatPhoneNumber(phoneNumber);
      
      // Verify the code with Supabase Auth
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: verificationCode,
        type: 'sms'
      });

      if (error) {
        if (error.message.includes('expired')) {
          setErrorMessage('Verification code has expired. Please request a new one.');
        } else {
          setErrorMessage('The verification code is incorrect. Please try again.');
        }
        return;
      }

      // Update the user's profile with verified phone number
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          mobile_number: fullPhoneNumber,
          mobile_verified: true
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        // Don't throw here as the verification was successful
      }

      onVerified(true);
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setErrorMessage('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="space-y-3">
        <Label className="text-emerald-300 text-base font-medium">Country</Label>
        <CountrySelector
          value={countryCode}
          onChange={setCountryCode}
          className="bg-gray-800/50 border-emerald-500/30 text-white h-12"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-emerald-300 text-base font-medium">Mobile Number</Label>
        <div className="flex space-x-2">
          <div className="flex items-center px-3 bg-gray-800/50 border border-emerald-500/30 rounded-md text-emerald-300 min-w-[80px] justify-center">
            {countryPhoneCodes[countryCode] || '+44'}
          </div>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1 bg-gray-800/50 border-emerald-500/30 text-white placeholder-gray-500 h-12 focus:border-emerald-400 focus:ring-emerald-400/20"
            placeholder="Enter your mobile number"
            disabled={isCodeSent}
          />
        </div>
      </div>

      {!isCodeSent ? (
        <Button
          onClick={sendVerificationCode}
          disabled={isSending || !phoneNumber.trim()}
          className="w-full gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium h-12"
        >
          {isSending ? (
            <div className="flex items-center space-x-2">
              <motion.div 
                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Send Verification Code</span>
            </div>
          )}
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-emerald-300 mb-2">
              <Phone className="w-5 h-5" />
              <span className="font-medium">Code sent to {value}</span>
            </div>
            {timeLeft > 0 && (
              <p className="text-sm text-gray-400">
                Code expires in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-emerald-300 text-base font-medium">Verification Code</Label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest bg-gray-800/50 border-emerald-500/30 text-white placeholder-gray-500 h-12 focus:border-emerald-400 focus:ring-emerald-400/20"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCodeSent(false);
                setVerificationCode('');
                setTimeLeft(0);
              }}
              className="flex-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            >
              Change Number
            </Button>
            <Button
              onClick={verifyCode}
              disabled={isVerifying || verificationCode.length !== 6}
              className="flex-1 gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
            >
              {isVerifying ? (
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Verify</span>
                </div>
              )}
            </Button>
          </div>

          {timeLeft > 0 && (
            <Button
              variant="ghost"
              onClick={sendVerificationCode}
              disabled={isSending}
              className="w-full text-emerald-300 hover:bg-emerald-500/10"
            >
              Resend Code
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MobileVerification;
