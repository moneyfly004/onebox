import { useState } from 'react';
import { toast } from 'sonner';
import { AuthService } from '../../utils/auth-api';
import { AuthStore } from '../../utils/auth-store';
import { addSubscription } from '../../action/db';
import { t } from '../../utils/helper';
import RegisterDialog from './register';
import ForgotPasswordDialog from './forgot-password';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginDialog({ open, onClose, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateInput = (): boolean => {
    if (!email.trim()) {
      toast.error(t('email_required') || '请输入邮箱');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('email_invalid') || '邮箱格式不正确');
      return false;
    }
    if (!password) {
      toast.error(t('password_required') || '请输入密码');
      return false;
    }
    if (password.length < 8) {
      toast.error(t('password_min_length') || '密码至少8位');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    setLoading(true);
    try {
      const loginResponse = await AuthService.login(email.trim(), password);
      await AuthStore.saveLoginInfo(loginResponse);
      
      // 获取订阅信息并自动添加
      try {
        const subscription = await AuthService.getUserSubscription(loginResponse.token);
        await AuthStore.saveSubscription(subscription);
        
        if (subscription.universal_url) {
          // 自动添加订阅到订阅列表
          try {
            await addSubscription(subscription.universal_url, '用户订阅');
            toast.success(t('subscription_fetched') || `订阅已获取！到期: ${subscription.expire_time}`);
          } catch (error: any) {
            console.warn('添加订阅失败:', error.message);
            // 即使添加失败，也显示订阅信息
            toast.success(t('subscription_fetched') || `订阅已获取！到期: ${subscription.expire_time}`);
          }
        }
      } catch (error: any) {
        console.warn('获取订阅失败:', error.message);
        // 即使订阅获取失败，也允许登录
      }

      toast.success(t('login_success') || '登录成功！');
      onLoginSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || t('login_failed') || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-center">{t('login') || '登录'}</h2>
          <p className="text-gray-500 text-center mb-6">{t('login_subtitle') || '请输入您的邮箱和密码'}</p>

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
                {t('password') || '密码'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('password_placeholder') || '请输入密码'}
              />
            </div>

            {loading && (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('login') || '登录'}
            </button>

            <button
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              {t('forgot_password') || '忘记密码？'}
            </button>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-500">{t('no_account') || '还没有账号？'}</span>
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                {t('register_now') || '立即注册'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              {t('cancel') || '取消'}
            </button>
          </div>
        </div>
      </div>

      {showRegister && (
        <RegisterDialog
          open={showRegister}
          onClose={() => setShowRegister(false)}
          onRegisterSuccess={() => {
            setShowRegister(false);
            toast.success(t('register_success') || '注册成功，请登录');
          }}
        />
      )}

      {showForgotPassword && (
        <ForgotPasswordDialog
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onResetSuccess={() => {
            setShowForgotPassword(false);
            toast.success(t('password_reset_success') || '密码重置成功，请登录');
          }}
        />
      )}
    </>
  );
}

