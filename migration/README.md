# 컴퓨터 간에 유지하는 이미지 UUID

`media-identities.json`은 원본 이미지 경로·공개 여부와 이미지 UUID의 대응표입니다.
본문, 이미지 파일, 비밀번호 또는 API 키는 포함하지 않습니다.

이 파일을 Git에 보관해 다른 컴퓨터에서 `.migration/`을 재생성해도 이미지 ID와
`images/{uuid}.{확장자}` 경로가 유지되게 합니다. `prepare-cloudflare-migration.mjs`가
이 대응표를 먼저 읽고, 이어서 `.migration/media-identities.json`의 추가 대응표를 읽습니다.
두 파일의 같은 원본에 서로 다른 UUID가 있으면 변환을 중단합니다.

새 외부 이미지를 가져오거나 새 원본으로 이관 자료를 생성한 뒤에는 다음 명령으로
대응표를 갱신하고 같은 작업 브랜치에 커밋합니다.

```powershell
Copy-Item -LiteralPath .migration/media-identities.json -Destination migration/media-identities.json
git add migration/media-identities.json
```

`.migration/content.sql`, `.migration/manifest.json`, `.migration/assets/`는 생성물이며
Git에 올리지 않습니다. 컴퓨터 이동 절차는 [새 PC 인계 매뉴얼](../docs/new-computer.md)에 있습니다.
