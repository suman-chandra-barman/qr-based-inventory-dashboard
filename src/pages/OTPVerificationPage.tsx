import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import signinImage from "@/assets/signin.png";
import { useVerifyEmailMutation } from "@/redux/api/api";

interface OTPVerificationPageProps {
  email?: string;
  onBack?: () => void;
  onVerificationSuccess?: (email: string) => void;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({
  email: propEmail = "",
  onVerificationSuccess,
}) => {
  const location = useLocation();
  const emailFromState = location.state?.email || propEmail;
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendOtpPassword, setResendOtpPassword] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const navigate = useNavigate();
  const [verifyEmail] = useVerifyEmailMutation();

  // Initialize refs on mount
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendOtpPassword > 0) {
      const timer = setTimeout(
        () => setResendOtpPassword(resendOtpPassword - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendOtpPassword]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length > 0) {
      const newOtp = new Array(6).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleOTPVerification = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

// Verify OTP API call
    try {
      setIsVerifying(true);
      const res = await verifyEmail({
        email: emailFromState,
        oneTimeCode: Number(otpString),
      }).unwrap();

      toast.success(res?.message || "OTP Verified Successfully", {
        description: "You can now reset your password.",
      });

      if (onVerificationSuccess) {
        onVerificationSuccess(emailFromState);
      } else {
        navigate("/reset-password", { state: { email: emailFromState } });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error?.data?.message || "Invalid OTP", {
        description: "Please check the code and try again.",
      });
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendOtpPassword > 0) return;

    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("OTP Resent", {
        description: `New verification code sent to ${emailFromState}`,
      });

     
      setResendOtpPassword(30);

      // Clear current OTP
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP", {
        description: "Please try again later.",
      });
    }
  };

  const isOTPComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center p-4">
         {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div>
          <div className="flex items-center justify-center">
            <img
              src={signinImage}
              alt="Shopping illustration"
              className="max-w-xl h-auto"
            />
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="h-auto hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Verify OTP</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Please enter the OTP we have sent you in your email {" "}
            <span className="font-medium">{emailFromState}</span>
          </p>

          <div className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null): void => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-full"
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleOTPVerification}
              disabled={!isOTPComplete || isVerifying}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOTP}
                  disabled={resendOtpPassword > 0}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendOtpPassword > 0
                    ? `Resend in ${resendOtpPassword}s`
                    : "Resend OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
