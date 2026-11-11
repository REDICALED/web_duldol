import { useSetRecoilState } from 'recoil';
import { LoginRequire } from '@/atoms/ModalAtom';

export function LoginRequireModal() {
  const close = useSetRecoilState(LoginRequire);
  return <div className="fixed inset-0 bg-white/80 z-50 grid place-items-center">
    <div className="bg-white border p-8 space-y-4">
      <p>관리자 계정으로 로그인해주세요.</p>
      <a className="inline-block border p-2 mr-3" href="/login">로그인 화면</a>
      <button type="button" onClick={() => close(false)}>닫기</button>
    </div>
  </div>;
}
