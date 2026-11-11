import { Link } from 'react-router-dom';
import useAdminSession from '@/hooks/useAdminSession';
import { CONTENT_API_ENABLED, contentApiUrl } from '@/lib/content-api';

export default function LoginPage() {
  const { session, error } = useAdminSession();
  const loginUrl = session?.login_url || `${contentApiUrl('/admin/login')}?return_to=%2FEditor`;
  return <div className="text-dul-gray pt-[15vh] ml-[35vw] mr-[5vw] space-y-4">
    <h1 className="text-xl">관리자 로그인</h1>
    {!CONTENT_API_ENABLED ? <p>콘텐츠 서버 연결 후 관리자 기능을 사용할 수 있습니다.</p>
      : session === null ? <p>로그인 상태 확인 중…</p>
        : session.authenticated ? <><p>{session.email} 계정으로 로그인했습니다.</p><Link className="underline" to="/Editor">편집 화면 열기</Link></>
          : <><p>등록된 관리자 계정으로 로그인해주세요.</p><a className="inline-block border p-3" href={loginUrl}>관리자 로그인</a></>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
