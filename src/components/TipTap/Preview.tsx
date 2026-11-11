import { useRecoilValue, useSetRecoilState } from 'recoil';
import parse from 'html-react-parser';
import { tiptapMainText } from '@/atoms/TiptapAtom';
import { ImageZoom } from '@/atoms/ModalAtom';
import { sanitizeContentHtml } from '@/lib/content-api';
import ParseHtml from './ParseHtml';
import '@/styles.scss';

export default function Preview() {
  const html = useRecoilValue(tiptapMainText);
  const setImageZoom = useSetRecoilState(ImageZoom);
  return <div>{parse(sanitizeContentHtml(html), { replace: node => ParseHtml.replace(node, setImageZoom) })}</div>;
}
