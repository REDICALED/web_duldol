import ImageUpload from './ImageUpload';

export default function SetTitleImage(props: any) {
  return <div className="space-y-2 my-2">
    <label className="block">작품 제목
      <input className="block border p-2 w-full" value={props.tiptapPostTitle} onChange={event => props.settiptapPostTitle(event.target.value)} />
    </label>
    <label className="block">작품 날짜
      <input className="block border p-2" type="date" value={props.tiptapPostDate} onChange={event => props.settiptapPostDate(event.target.value)} />
    </label>
    <ImageUpload label="대표 이미지" onUpload={assets => {
      props.settiptapPostTitleImage({ blobUrl: assets[0].url });
      props.setCoverMediaId(assets[0].id);
    }} />
    {props.tiptapPostTitleImage.blobUrl && <img className="w-[160px] h-[100px] object-cover" src={props.tiptapPostTitleImage.blobUrl} alt="대표 이미지" />}
    <label className="block"><input type="checkbox" checked={props.isListed} onChange={event => props.setIsListed(event.target.checked)} /> 작품 목록에 표시</label>
  </div>;
}
