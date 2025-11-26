/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ResetPasswordModal } from "./ResetPasswordModal"

interface OTPVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function OTPVerificationModal({ open, onOpenChange, email }: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [showResetModal, setShowResetModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (open && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [open])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter all 6 digits.",
      })
      return
    }

    setIsVerifying(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onOpenChange(false)
      setShowResetModal(true)

      toast.success("OTP Verified", {
        description: "Please set your new password.",
      })
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.", {
        description: "Error",
        duration: 5000,
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("OTP Resent", {
        description: "A new verification code has been sent to your email.",
      })

      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.", {
        description: "Error",
        duration: 5000,
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-0 bg-white rounded-lg">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">Verify Email</h2>
            </div>

            <p className="text-gray-600 mb-6">Please enter the OTP we have sent you in your email.</p>

            {/* OTP Input */}
            <div className="flex gap-3 mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-blue-500"
                />
              ))}
            </div>

            {/* Resend */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Didn't receive the code?</span>
              <Button variant="link" className="p-0 h-auto text-gray-600 hover:text-gray-800" onClick={handleResend}>
                Resend
              </Button>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12 rounded-full"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ResetPasswordModal open={showResetModal} onOpenChange={setShowResetModal} email={email} />
    </>
  )
}
