import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthStore } from '../../utils/auth-store';
import { AuthService, UserSubscription } from '../../utils/auth-api';
import { addSubscription } from '../../action/db';
import { t } from '../../utils/helper';
import LoginDialog from './login';

export default function UserInfo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authState = await AuthStore.getAuthState();
    setIsAuthenticated(authState.isAuthenticated);
    setEmail(authState.email);
    setUsername(authState.username);

    if (authState.isAuthenticated && authState.token) {
      await fetchSubscription(authState.token);
    }
  };

  const fetchSubscription = async (token: string) => {
    try {
      const sub = await AuthService.getUserSubscription(token);
      setSubscription(sub);
      await AuthStore.saveSubscription(sub);
      
      // 如果订阅 URL 存在，尝试自动添加到订阅列表
      if (sub.universal_url) {
        try {
          await addSubscription(sub.universal_url, '用户订阅');
        } catch (error: any) {
          console.warn('添加订阅失败:', error.message);
        }
      }
    } catch (error: any) {
      console.warn('获取订阅失败:', error.message);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AuthStore.logout();
      setIsAuthenticated(false);
      setEmail(null);
      setUsername(null);
      setSubscription(null);
      toast.success(t('logout') || '已退出登录');
    } catch (error: any) {
      toast.error(error.message || '退出失败');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('user_info') || '用户信息'}</p>
              <p className="text-xs text-gray-400 mt-1">{t('not_logged_in') || '未登录'}</p>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              {t('login') || '登录'}
            </button>
          </div>
        </div>

        {showLogin && (
          <LoginDialog
            open={showLogin}
            onClose={() => setShowLogin(false)}
            onLoginSuccess={checkAuth}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">{t('user_info') || '用户信息'}</h3>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-3 py-1 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            {t('logout') || '退出登录'}
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('email') || '邮箱'}:</span>
            <span className="text-gray-700">{email}</span>
          </div>
          {username && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t('username') || '用户名'}:</span>
              <span className="text-gray-700">{username}</span>
            </div>
          )}
        </div>
      </div>

      {/* 订阅信息卡片 */}
      {subscription && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">{t('subscription_info') || '订阅信息'}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('expire_time') || '到期时间'}:</span>
              <span className="text-gray-700">{subscription.expire_time}</span>
            </div>
            {subscription.device_limit > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">{t('device_limit') || '设备限制'}:</span>
                <span className="text-gray-700">
                  {subscription.current_devices} / {subscription.device_limit}
                </span>
              </div>
            )}
            {subscription.total_traffic > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('upload_traffic') || '上传流量'}:</span>
                  <span className="text-gray-700">{formatBytes(subscription.upload_traffic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('download_traffic') || '下载流量'}:</span>
                  <span className="text-gray-700">{formatBytes(subscription.download_traffic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('total_traffic') || '总流量'}:</span>
                  <span className="text-gray-700">{formatBytes(subscription.total_traffic)}</span>
                </div>
              </>
            )}
            {subscription.universal_url && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">{t('subscription_url') || '订阅链接'}:</p>
                <p className="text-xs text-gray-700 break-all">{subscription.universal_url}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

