# 다른 컴퓨터에서 이어서 작업하기

저장소 루트에서 실행하는 Windows PowerShell 기준이다. 원격은
`https://github.com/REDICALED/web_duldol.git`, 작업 브랜치는 `cloudflare_migration`이다.

## 1. 현재 상태와 가져가야 할 것

2026-11-11 로컬 확인 기준, 글14개·목록10개·페이지4개·로컬 이미지107개의 이관 자료를
생성했다. Google 이미지80개는 아직 외부 URL이고, 실제 Cloudflare 이관·운영 연결은
별도로 해야 한다. 과거 작품2개의 날짜는 원본에서 확인되지 않아 보고서 경고로 남아 있다.
관련 코드·타입·로컬 테스트를 확인했으며 운영 인증·브라우저 업로드·화면 동일성은 연결 후 확인 대상이다.

| 항목 | 보관 위치 | 새 PC에서의 처리 |
| --- | --- | --- |
| 코드, `public/` 원본, 기존 React 본문, lock 파일 | Git | clone으로 받는다. |
| `migration/media-identities.json` | Git | 원본 이미지와 UUID의 대응표. 동일한 ID·R2 경로를 복원한다. |
| `.migration/`의 SQL·목록·이미지 복사본 | 로컬 생성물 | 현재 상태는 Git 원본과 UUID 대응표로 재생성 가능하다. |
| `.env.local`, `cloudflare/.dev.vars` | Git 제외 | 예시 파일로 다시 만든다. 실제 비밀값은 별도로 보관한다. |
| GitHub·Cloudflare 로그인 | 각 PC | 새 PC에서 필요한 계정으로 인증한다. |
| 배포된 D1·R2와 Worker secrets | Cloudflare | 같은 Account와 리소스를 선택한다. PC 이동으로 사라지지 않는다. |
| 로컬 개발 DB·R2의 `.wrangler/` 상태 | Git 제외 | 로컬에만 쓴 새 글이 있으면 7절의 별도 백업이 필요하다. |

현재 로컬 원본 이미지와 본문 입력 파일이 Git 추적 대상임을 확인했다. **지금 상태는
UUID 대응표까지 Git에 올리면 새 PC에서 SQL과 이미지를 재생성할 수 있다.** 별도 SQL
다운로드 링크가 반드시 필요한 상태는 아니다.

대응표에는 경로·문서 식별자·UUID만 있고 본문·이미지 바이트·API 키는 없다.
실제 본문을 담은 `.migration/`은 Git에서 계속 제외한다. 기존 시스템의
`public/Posts/memo.html` 원본은 이미 Git 추적 대상이다. 새 빌드에서 공개 정적 출력은
제외하지만, Git 원본에서도 제거된 것은 아니다.

## 2. 현재 PC에서 떠나기 전

추가 이미지를 변환했다면 생성된 UUID 대응표를 먼저 반영한다.

```powershell
Copy-Item -LiteralPath .migration/media-identities.json -Destination migration/media-identities.json
git branch --show-current
git status --short
git add .
git diff --cached --stat
git commit -m "Standardize media relationships and document cross-computer setup"
git push -u origin cloudflare_migration
```

브랜치는 `cloudflare_migration`이어야 한다. 이미 커밋했다면 다시 커밋하지 않고 push만 한다.
인증을 저장하지 않고 이번 push에만 브라우저 인증을 쓰려면 마지막 명령 대신:

```powershell
git -c credential.credentialStore=none -c credential.gitHubAuthModes=browser push -u origin cloudflare_migration
```

**push 성공을 확인해야 집 PC에서 그 커밋을 받을 수 있다.** `main` 병합은 운영 전환 때 별도로 한다.

## 3. 새 PC에서 clone·설치·콘텐츠 복원

Git과 Node.js **22.12 이상**을 설치한다. 현재 검증 환경은 Node22.14.0이며,
설치된 Wrangler가 요구하는 최소 Node 버전은22.12다.

```powershell
git clone --branch cloudflare_migration https://github.com/REDICALED/web_duldol.git
Set-Location web_duldol
git branch --show-current
git log -1 --oneline
node --version
npm ci
npm --prefix cloudflare ci
node scripts/prepare-cloudflare-migration.mjs
Get-Content .migration/report.json -Raw -Encoding UTF8 | ConvertFrom-Json | Select-Object -ExpandProperty summary
node scripts/upload-migration-assets.mjs --bucket duldol-media
```

두 lock 파일을 기준으로 설치하므로 이전 PC의 `node_modules/`·`dist/`는 복사하지 않는다.
`prepare`는 Git의 원본과 `migration/media-identities.json`을 읽어 `.migration/`을 만든다.
기본 실행은 네트워크 요청이나 Cloudflare 변경이 없다. 업로드 명령도 `--execute`가
없으면 파일을 전송하지 않고 계획만 검증한다.

현재 원본의 예상 결과는 글14/목록10/페이지4/이미지107, errors0, warnings2,
remainingExternalAssets80이다. `.migration/`을 처음부터 만들어도 UUID와 이미지 경로는 유지된다.

기존 clone이 있으면 그 폴더에서 커밋하지 않은 변경을 보존한 뒤 아래 순서로 받는다.

```powershell
git fetch origin
git switch cloudflare_migration
git pull --ff-only origin cloudflare_migration
```

## 4. 계정 로그인 없이 로컬 실행

설정 파일이 아직 없는 새 clone에서 실행한다. 파일이 이미 있으면 덮어쓰기 전에 확인한다.

```powershell
Copy-Item -LiteralPath .env.example -Destination .env.local
Copy-Item -LiteralPath cloudflare/.dev.vars.example -Destination cloudflare/.dev.vars
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 migrations apply duldol-content --local --env local --config cloudflare/wrangler.jsonc
node scripts/upload-migration-assets.mjs --bucket duldol-media --execute
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 execute duldol-content --local --env local --config cloudflare/wrangler.jsonc --file .migration/content.sql
```

이 단계는 로컬 DB·R2에만 쓴다. `--remote`를 넣지 않는다. DB에는 `0001`과 `0002`가
모두 적용돼야 하며 `migrations apply`가 미적용 파일을 순서대로 처리한다.

터미널 두 개에서 각각 실행한다.

```powershell
# 터미널 1: Worker, 127.0.0.1:8787
npm run api:dev
```

```powershell
# 터미널 2: 프론트
npm run dev -- --host localhost --port 5173 --strictPort
```

`http://localhost:5173`을 연다. Vite가 `/api` 요청을 Worker로 전달한다.
로컬 `--env local`은 이 origin에서 개발 전용 인증을 사용한다. `/login`, `/Editor`,
작품 상세, Note/CV/Contact/Memo를 확인한다. 실제 R2 키나 Cloudflare 로그인은 필요 없다.
운영에는 개발용 local 환경을 배포하지 않는다.

## 5. 외부 Google 이미지80개 처리

```powershell
node scripts/prepare-cloudflare-migration.mjs --import-external
Get-Content .migration/report.json -Raw -Encoding UTF8 | ConvertFrom-Json | Select-Object -ExpandProperty summary
```

Google 이미지를 **로컬로 다운로드**하는 명령이며 R2 업로드는 하지 않는다.
errors0·remainingExternalAssets0이어야 모든 해당 이미지가 변환된 것이다.
이전 실행 환경에서는 다운로드가 실패했으므로 이 작업은 아직 완료되지 않았다.

실패하면 `report.json`·`external-assets.json`에서 URL·공개 권한·네트워크를 확인한다.
오류가 있는 실행은 SQL을 `BLOCKED` 상태로 만들므로 그 상태로 DB에 가져오지 않는다.
성공하면 새 UUID 대응표도 Git에 저장한다.

```powershell
Copy-Item -LiteralPath .migration/media-identities.json -Destination migration/media-identities.json
git add migration/media-identities.json
git commit -m "Preserve UUIDs for imported external images"
git push origin cloudflare_migration
```

외부 다운로드 후 기본 `prepare`를 실행하면 기본 정책에 따라 Google URL을 유지하는
자료가 생성된다. 완전 이관에는 `--import-external`로 만든 정상 SQL과 그 SQL에 대응하는
assets 목록을 함께 사용한다. 다운로드된 파일도 다른 PC로 옮기려면 7절의 ZIP을 사용한다.

## 6. 실제 계정 설정과 운영 이관

여기부터는 로그인 및 실제 계정 변경 단계다. 세부 설명은
[Cloudflare 이관 문서](cloudflare-migration.md#2-cloudflare-리소스와-인증-준비)에 있다.

### 계정·리소스 선택

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js login
node cloudflare/node_modules/wrangler/bin/wrangler.js whoami
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 list
node cloudflare/node_modules/wrangler/bin/wrangler.js r2 bucket list
```

도메인 DNS가 있는 Cloudflare Account를 선택한다. 이미 만든 리소스가 있으면 사용하고
중복 생성하지 않는다. 없는 경우에만:

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 create duldol-content
node cloudflare/node_modules/wrangler/bin/wrangler.js r2 bucket create duldol-media
```

### 설정값 기록

| 값 | 위치 | 가져오는 곳 |
| --- | --- | --- |
| D1 database ID | `wrangler.jsonc` 운영 `d1_databases[].database_id` | D1 Dashboard 또는 d1 list |
| Account ID | 필요 시 최상위 `account_id`, `vars.R2_ACCOUNT_ID` | Cloudflare Account Dashboard |
| 버킷 이름 | `r2_buckets[].bucket_name`, `vars.R2_BUCKET_NAME` | R2 Dashboard |
| 대표 origin | `vars.APP_ORIGIN` | 기본 `https://www.duldoljimi.com`, 실제 주소와 일치 |
| Access 팀 도메인·AUD | `vars.ACCESS_TEAM_DOMAIN`, `vars.ACCESS_AUD` | Zero Trust application |
| 관리자 이메일 | `vars.ADMIN_EMAILS` | 허용할 관리자 계정 |
| R2 access key·secret | Worker secrets | 해당 버킷에 한정한 R2 API token |
| 프론트 API 주소 | `.env.local` / Vercel 환경 변수 | `/api` |

Account ID·DB ID·버킷 이름·도메인은 비밀값이 아니므로 실제 설정을 채운
`cloudflare/wrangler.jsonc`를 Git에 저장해도 된다. R2 secret·API token·로그인 토큰은
커밋하지 않는다. 비밀값은 암호 관리자에 보관한다. 배포된 Worker secrets는 PC를
바꿔도 Cloudflare에 남는다. 원문을 보관하지 않았다면 필요 시 새 키를 발급해 교체한다.

### Access와 R2 업로드 CORS

Zero Trust의 Self-hosted Access application에서 대표 주소의 `/api/admin/*`만 보호한다.
Allow 정책은 실제 관리자 이메일로 제한하고 팀 도메인·AUD를 Worker vars에 넣는다.
공개 `/api/posts`, `/api/pages`, `/api/media/*`까지 Access 대상으로 만들지 않는다.

R2는 비공개 버킷으로 유지한다. Dashboard의 CORS에는 다음을 넣는다.
대표 주소가 다르면 AllowedOrigins도 변경한다.

```json
[
  {
    "AllowedOrigins": ["https://www.duldoljimi.com"],
    "AllowedMethods": ["PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Worker 생성과 비밀값 등록

새 Worker는 설정을 채우고 처음 배포해 서비스를 생성한 뒤 secret을 등록한다.
처음에는 도메인 routes를 연결하지 않고 만들 수 있다. 이미 Worker와 secrets가 있으면
다시 생성·재등록하지 않고 설정을 확인한다.

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js deploy --config cloudflare/wrangler.jsonc
node cloudflare/node_modules/wrangler/bin/wrangler.js secret put R2_ACCESS_KEY_ID --config cloudflare/wrangler.jsonc
node cloudflare/node_modules/wrangler/bin/wrangler.js secret put R2_SECRET_ACCESS_KEY --config cloudflare/wrangler.jsonc
```

secret 명령이 값을 물을 때 입력한다. 키를 명령 인수나 문서에 기록하지 않는다.

### 실제 데이터 업로드

운영에 이미 새 글을 작성했다면 먼저 DB를 export하고 초기 이관 SQL과의 차이를 확인한다.
초기 이관은 항상 이미지 업로드 후 SQL을 가져오는 순서다.

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 migrations apply duldol-content --remote --config cloudflare/wrangler.jsonc
node scripts/upload-migration-assets.mjs --bucket duldol-media --execute --remote
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 execute duldol-content --remote --config cloudflare/wrangler.jsonc --file .migration/content.sql
```

업로더는 assets 목록에 있는 파일만 읽는다. 디렉터리에 남은 예전 이미지 복사본을
자동 업로드하지 않는다. `0001`만 적용한 DB도 먼저 `0002`까지 적용해야 한다.

### 도메인과 Vercel 연결

Worker에 `www.duldoljimi.com/api/*` route를 연결하고 DNS의 Cloudflare proxy를 켠다.
기존 Vercel origin 레코드는 유지한다. Dashboard 대신 `wrangler.jsonc`의 routes에
해당 패턴과 zone_name을 기록하고 재배포할 수도 있다.

API와 데이터가 준비된 뒤 Vercel의 전환 대상 환경에 `VITE_CONTENT_API_URL=/api`를 넣고
재배포한다. 기존 운영을 유지하는 동안 Production 브랜치는 `main`으로 둔다.
`cloudflare_migration` push는 운영 전환 자체가 아니다.

**기본 `*.vercel.app` Preview에는 현재 도메인의 Worker route가 적용되지 않는다.**
새 기능은 우선 4절의 로컬 환경에서 확인한다. 온라인 개발 환경이 필요하면 별도
Cloudflare staging 호스트와 Worker·D1·R2를 만들고 Access·APP_ORIGIN·CORS까지 그 주소로 맞춘다.
운영으로 전환할 때는 데이터·API 준비 후 main 병합과 운영 재배포를 진행한다.

최소 확인: Works 목록10개, 제목 URL12개·숫자 URL2개, 본문·썸네일·슬라이더·캡션,
관리자 로그인·업로드·수정, 비공개 Memo 접근 차단. 외부 이미지 완전 이관을 했다면
remainingExternalAssets0도 확인한다. 화면이 기존과 동일한지는 실제 브라우저에서 확인한다.

## 7. Git 원본에 없는 자료와 로컬 작업 전달

현재 원본은 Git에 있지만, 이후 별도로 받은 이미지나 로컬 DB에서만 작성한 글은
Git만으로 복원되지 않는다. 아래 백업은 그 경우 또는 다운로드 결과를 그대로 옮길 때 사용한다.

### 이관 자료 묶음

```powershell
New-Item -ItemType Directory -Path .handoff -Force | Out-Null
Compress-Archive -LiteralPath .migration -DestinationPath .handoff/migration-transfer.zip
Get-FileHash -LiteralPath .handoff/migration-transfer.zip -Algorithm SHA256
```

같은 이름의 ZIP이 이미 있으면 다른 이름을 사용한다. `.handoff/`도 Git에서 제외한다.
ZIP에는 본문과 비공개 Memo가 들어 있으므로 본인만 접근하는 저장 공간이나 USB로 전달한다.
**현재 상태는 ZIP 없이 Git에서 재생성해도 된다.**

새 PC의 저장소 루트에 복원한다. 기존 `.migration/`은 다른 곳에 먼저 보관해 서로
다른 세트가 합쳐지지 않게 한다.

```powershell
Expand-Archive -LiteralPath C:/받은파일/migration-transfer.zip -DestinationPath .
node scripts/upload-migration-assets.mjs --bucket duldol-media
```

받은 SQL·대응표·assets 목록·이미지를 한 세트로 사용하며 prepare를 다시 실행할 필요는 없다.
ZIP의 SHA-256은 보내는 PC에서 기록한 값과 비교할 수 있다.

### 로컬 개발 DB에만 새 글이 있는 경우

`content:prepare`는 Git 원본을 읽으며 로컬 개발 DB의 새 글을 추출하지 않는다.
개발 서버를 종료한 뒤 DB를 export한다.

```powershell
New-Item -ItemType Directory -Path .handoff -Force | Out-Null
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 export duldol-content --local --env local --config cloudflare/wrangler.jsonc --output .handoff/local-content.sql
```

같은 OS와 lock 파일로 로컬 개발 상태를 그대로 옮길 때는 서버 종료 후
`cloudflare/.wrangler/state/` 전체를 보관하면 로컬 DB와 R2 파일을 함께 가져갈 수 있다.

```powershell
Compress-Archive -LiteralPath cloudflare/.wrangler/state -DestinationPath .handoff/local-worker-state.zip
```

새 PC에서 Worker를 실행하기 전에 `cloudflare/.wrangler/` 아래로 압축을 풀어
`cloudflare/.wrangler/state/`가 되게 한다. 이미 로컬 상태가 있으면 먼저 별도 보관한다.
복원한 DB에 초기 content.sql을 다시 넣지 않는다. OS·Wrangler 버전이 다르면 export SQL과
DB의 media.object_key에 해당하는 원본 파일을 각각 옮기는 방식으로 처리하고 기존 백업을 유지한다.

### 이미 Cloudflare에 반영한 데이터

D1·R2는 같은 Account의 같은 리소스를 사용하면 그대로 남아 있다. 새 PC에서 다시
업로드할 필요는 없다. 별도 DB 백업이 필요하면:

```powershell
New-Item -ItemType Directory -Path .handoff -Force | Out-Null
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 export duldol-content --remote --config cloudflare/wrangler.jsonc --output .handoff/remote-content.sql
```

이 export는 초기 이관 SQL과 구분해서 보관한다. `.env.local`과 Worker secret 원문은
Git이나 콘텐츠 ZIP이 아니라 별도의 암호 관리자에서 관리한다.

## 8. 문제 확인

| 증상 | 확인할 것 |
| --- | --- |
| UUID 대응표 없음·충돌 | 최신 커밋의 migration/media-identities.json과 같은 세트인지 확인 |
| 로컬 /api 실패 | Worker8787과 Vite localhost:5173 실행 여부 |
| 관리자 저장403 | APP_ORIGIN과 브라우저 origin·포트 일치 여부 |
| 운영 로그인401·503 | Access 팀 도메인·AUD·관리자 정책·Worker vars |
| R2 전송 CORS 오류 | 정확한 origin, PUT, Content-Type 허용 여부 |
| 이미지404 | 같은 대상에 이미지 업로드와 media 행이 모두 반영됐는지 |
| cover_media_id·post_media 없음 | 0002 마이그레이션 적용 여부 |
| SQL 첫 줄 BLOCKED | report.json 오류 해결 후 다시 생성 |

상세 절차는 [Cloudflare 이관 문서](cloudflare-migration.md), API 계약은
[Worker README](../cloudflare/README.md)를 참고한다.
공식 참고: [D1 명령](https://developers.cloudflare.com/d1/wrangler-commands/),
[R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/),
[Worker Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).
