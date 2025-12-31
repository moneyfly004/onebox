import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthService } from '../../utils/auth-api';
import { t } from '../../utils/helper';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onResetSuccess: () => void;
}

export default function ForgotPasswordDialog({ open, onClose, onResetSuccess }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      toast.error(t('email_required') || '请输入邮箱');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('email_invalid') || '邮箱格式不正确');
      return false;
    }
    return true;
  };

  const validateInput = (): boolean => {
    if (!validateEmail()) {
      return false;
    }
    if (!code.trim()) {
      toast.error(t('code_required') || '请输入验证码');
      return false;
    }
    if (!newPassword) {
      toast.error(t('new_password_required') || '请输入新密码');
      return false;
    }
    if (newPassword.length < 8) {
      toast.error(t('password_min_length') || '密码至少8位');
      return false;
    }
    if (!confirmPassword) {
      toast.error(t('confirm_password_required') || '请确认密码');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('passwords_not_match') || '两次密码不一致');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;
    if (countdown > 0) return;

    setSendingCode(true);
    try {
      const message = await AuthService.forgotPassword(email.trim());
      toast.success(message);
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.message || t('send_code_failed') || '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleReset = async () => {
    if (!validateInput()) return;

    setLoading(true);
    try {
      const message = await AuthService.resetPassword(
        email.trim(),
        code.trim(),
        newPassword
      );
      toast.success(message);
      onResetSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || t('reset_failed') || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">{t('reset_password') || '重置密码'}</h2>
        <p className="text-gray-500 text-center mb-6">{t('reset_password_subtitle') || '输入邮箱接收验证码'}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email') || '邮箱'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('email_placeholder') || '请输入邮箱'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('verification_code') || '验证码'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('code_placeholder') || '请输入验证码'}
              />
              <button
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}秒后重试` : t('send_code') || '发送验证码'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('new_password') || '新密码（至少8位）'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('new_password_placeholder') || '请输入新密码'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('confirm_password') || '确认新密码'}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('confirm_password_placeholder') || '请再次输入新密码'}
            />
          </div>

          {loading && (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('reset_password') || '重置密码'}
          </button>

          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            {t('cancel') || '取消'}
          </button>
        </div>
      </div>
    </div>
  );
}

