import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
//import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Shield, Copy, Check } from "lucide-react";
import { generateSecret, generateQRCodeURL, verifyToken } from "@/utils/two-factor-auth";

export const TwoFactorSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCodeURL, setQrCodeURL] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  useEffect(() => {
    // temp - we can check this through api(not sure if its avaibale tho)
    const enabled = localStorage.getItem("2fa_enabled") === "true";
    setIs2FAEnabled(enabled);
  }, []);

  const handleEnable2FA = async () => {
    setIsSettingUp(true);
    const newSecret = generateSecret();//This will be replaced to the token kyrian generated when 2fa is enabled
    setSecret(newSecret);
    
    try {
      const qrCode = await generateQRCodeURL(newSecret, userEmail);
      setQrCodeURL(qrCode);
    } catch  {
      toast( "Error",{
        description: "Failed to generate QR code. Please try again.",
      });
      setIsSettingUp(false);
    }
  };

  const handleDisable2FA = () => {
    localStorage.removeItem("2fa_enabled");
    localStorage.removeItem("2fa_secret");
    setIs2FAEnabled(false);
    setIsSettingUp(false);
    setSecret("");
    setQrCodeURL("");
    setVerificationCode("");
    
    toast("2FA Disabled",{
      description: "Two-factor authentication has been disabled for your account",
    });
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      
      toast("Secret copied",{
        description: "The secret key has been copied to your clipboard",
      });
    } catch{
      toast("Copy failed",{
        description: "Failed to copy the secret key",
      });
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      toast( "Invalid code",{
        description: "Please enter a 6-digit verification code",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const isValid = verifyToken(verificationCode, secret);
      
      if (isValid) {
        localStorage.setItem("2fa_enabled", "true");
        localStorage.setItem("2fa_secret", secret);
        setIs2FAEnabled(true);
        setIsSettingUp(false);
        setVerificationCode("");
        
        toast( "2FA Enabled",{
          description: "Two-factor authentication has been successfully enabled",
        });
      } else {
        toast("Invalid code",{
          description: "The verification code is incorrect. Please try again.",
        });
      }
    } catch {
      toast( "Verification failed",{
        description: "Failed to verify the code. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelSetup = () => {
    setIsSettingUp(false);
    setSecret("");
    setQrCodeURL("");
    setVerificationCode("");
  };

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
      </div>
      
      <p className="text-white/60 text-sm mb-6">
        Add an extra layer of security to your account with two-factor authentication using an authenticator app.
      </p>

      {!isSettingUp ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Enable 2FA</Label>
              <p className="text-sm text-white/60">
                {is2FAEnabled ? "Two-factor authentication is enabled" : "Two-factor authentication is disabled"}
              </p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnable2FA();
                } else {
                  handleDisable2FA();
                }
              }}
            />
          </div>
          
          {is2FAEnabled && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Two-factor authentication is active and protecting your account
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h4 className="text-white font-medium">Step 1: Scan QR Code</h4>
            <p className="text-white/60 text-sm">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            
            {qrCodeURL && (
              <div className="flex justify-center">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeURL} alt="2FA QR Code" className="border border-white/10 rounded-lg" />
              </div>
            )}
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-4">
            <h4 className="text-white font-medium">Step 2: Manual Entry (Alternative)</h4>
            <p className="text-white/60 text-sm">
              If you can&#39;t scan the QR code, manually enter this secret key in your authenticator app:
            </p>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <code className="text-primary text-sm font-mono break-all">{secret}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySecret}
                  className="ml-2 text-white/60 hover:text-white"
                >
                  {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-4">
            <h4 className="text-white font-medium">Step 3: Verify Setup</h4>
            <p className="text-white/60 text-sm">
              Enter the 6-digit code from your authenticator app to complete setup:
            </p>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/5 border-white/10 text-white" />
                  <InputOTPSlot index={1} className="bg-white/5 border-white/10 text-white" />
                  <InputOTPSlot index={2} className="bg-white/5 border-white/10 text-white" />
                  <InputOTPSlot index={3} className="bg-white/5 border-white/10 text-white" />
                  <InputOTPSlot index={4} className="bg-white/5 border-white/10 text-white" />
                  <InputOTPSlot index={5} className="bg-white/5 border-white/10 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleVerifyAndEnable}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isVerifying ? "Verifying..." : "Enable 2FA"}
            </Button>
            <Button
              variant="outline"
              onClick={cancelSetup}
              className="flex-1 border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
