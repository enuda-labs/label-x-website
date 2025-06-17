'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Copy, Check } from 'lucide-react';
import { get2FASetup, verify2FASetup, disable2FASetup } from '@/services/apis/auth';
import { isAxiosError } from 'axios';

export const TwoFactorSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCodeURL, setQrCodeURL] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    setMounted(true);
    const enabled = localStorage.getItem('2fa_enabled') === 'true';
    setIs2FAEnabled(enabled);
  }, []);

  const handleEnable2FA = async () => {
    setIsSettingUp(true);
    try {
      const result = await get2FASetup();
      console.log('get2FASetup result:', result);
      const rawUrl = result.qr_code_url;
      const fixedUrl = rawUrl.startsWith('http://')
        ? rawUrl.replace('http://', 'https://')
        : rawUrl;
      setQrCodeURL(fixedUrl);
      setSecret(result.secret_key);
    } catch (err) {
      console.error('Error fetching 2FA setup:', err);
      toast.error('Failed to start 2FA setup. Please try again.');
      setIsSettingUp(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setShowPasswordInput(true);
      return;
    }
    try {
      await disable2FASetup(password);
      localStorage.removeItem('2fa_enabled');
      localStorage.removeItem('2fa_secret');
      setIs2FAEnabled(false);
      setIsSettingUp(false);
      setShowPasswordInput(false);
      setSecret('');
      setQrCodeURL('');
      setVerificationCode('');
      toast('2FA Disabled', { description: 'Two-factor authentication has been disabled.' });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to disable 2FA');
      }
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast('Secret copied', { description: 'The secret key is now in your clipboard.' });
    } catch {
      toast.error('Failed to copy secret');
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    console.log('Submitted OTP code:', verificationCode);
    setIsVerifying(true);
    try {
      const ok = await verify2FASetup(verificationCode);
      console.log('Server verification result:', ok);
      if (ok) {
        localStorage.setItem('2fa_enabled', 'true');
        localStorage.setItem('2fa_secret', secret);
        setIs2FAEnabled(true);
        toast('2FA Enabled', { description: 'Two-factor authentication is now active.' });
      } else {
        toast.error('Invalid code, please try again');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error('Verification failed, please try again');
    } finally {
      setIsVerifying(false);
      setIsSettingUp(false);
      setVerificationCode('');
    }
  };

  const cancelSetup = () => {
    setIsSettingUp(false);
    setSecret('');
    setQrCodeURL('');
    setVerificationCode('');
  };

  if (!mounted) {
    return (
      <Card className="bg-white/5 border-white/10 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-10 bg-white/10 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
      </div>
      <p className="text-white/60 text-sm mb-6">
        Add an extra layer of security to your account with two-factor authentication.
      </p>

      {!isSettingUp ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Enable 2FA</Label>
              <p className="text-sm text-white/60">
                {is2FAEnabled
                  ? 'Two-factor authentication is enabled'
                  : 'Two-factor authentication is disabled'}
              </p>
            </div>
            {showPasswordInput ? (
              <div className="w-[24px] h-[24px] border-[3px] border-solid border-[rgba(0,0,0,0.2)] border-t-primary rounded-full animate-spin ml-auto"></div>
            ) : (
              <Switch
                checked={is2FAEnabled}
                onCheckedChange={checked =>
                  checked ? handleEnable2FA() : handleDisable2FA()
                }
                className="cursor-pointer"
              />
            )}
          </div>

          {showPasswordInput && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button
                variant="outline"
                className="flex-1 cursor-pointer bg-primary"
                onClick={handleDisable2FA}
              >
                Disable
              </Button>
            </>
          )}

          {is2FAEnabled && !showPasswordInput && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Two-factor authentication is active
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 1: QR Code */}
          <div className="text-center space-y-4">
            <h4 className="text-white font-medium">Step 1: Scan QR Code</h4>
            {qrCodeURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeURL}
                alt="2FA QR Code"
                className="border border-white/10 rounded-lg mx-auto"
              />
            ) : (
              <p className="text-white/60">Loading QR Code…</p>
            )}
          </div>

          <Separator className="bg-white/10" />

          {/* Step 2: Secret key */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Step 2: Secret Key</h4>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
              <code className="text-primary text-sm font-mono break-all">{secret}</code>
              <Button variant="ghost" size="sm" onClick={copySecret}>
                {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Step 3: Verify OTP */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Step 3: Verify Code</h4>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex space-x-3">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleVerifyAndEnable}
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? 'Verifying…' : 'Enable 2FA'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={cancelSetup}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
