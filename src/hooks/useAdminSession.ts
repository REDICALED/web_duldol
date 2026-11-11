import { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { LoginValid } from '@/atoms/LoginValidAtom';
import { adminSession, type AdminSession } from '@/lib/content-api';

export default function useAdminSession() {
  const setLoginValid = useSetRecoilState(LoginValid);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    adminSession().then(result => {
      if (!active) return;
      setSession(result);
      setLoginValid(result.authenticated ? 1 : 0);
    }).catch(() => {
      if (!active) return;
      setSession({ authenticated: false });
      setLoginValid(0);
      setError('관리자 연결을 확인하지 못했습니다. 로그인 후 다시 시도해주세요.');
    });
    return () => { active = false; };
  }, [setLoginValid]);
  return { session, error };
}
