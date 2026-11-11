# R2 + D1 콘텐츠 전환

다른 컴퓨터에서 이어가는 경우에는 [새 PC 인계 매뉴얼](new-computer.md)을 먼저 읽는다.
Git의 `migration/media-identities.json`으로 UUID를 복원하므로 현재 `.migration/`을
따로 전달하지 않아도 원본에서 같은 경로의 자료를 생성할 수 있다.

프런트는 기존 Vercel의 React/Vite 사이트를 사용하고, 게시물·페이지는 D1, 이미지는 R2에 저장한다. 코드 배포는 Git push → Vercel이고, 관리자 화면에서 콘텐츠를 저장하는 작업은 Worker API를 통해 배포 없이 반영한다.

```text
방문자 / 관리자
  └─ https://www.duldoljimi.com
       ├─ /*                 → Vercel (React/Vite)
       └─ /api/*             → Cloudflare Worker duldol-content-api
            ├─ /api/admin/*  → Cloudflare Access 인증 + Worker JWT 검증
            ├─ D1 DB         → 게시물, 페이지, 파일 정보, 참조
            └─ R2 MEDIA      → 이미지 원본
```

실제 서비스의 대표 주소가 apex 도메인이면 아래 `www.duldoljimi.com`을 `duldoljimi.com`으로 통일한다. API 쿠키와 로그인은 대표 주소와 같은 origin을 사용한다.

## 보존하는 데이터

- 기존 `initpages/PostComponent1~12.tsx`를 React 서버 렌더링해 12개 글로 추출한다. 제목 기반 기존 `/Works/{title}` 주소를 그대로 보존한다. 현재 목록에서 빠져 있던 글도 `is_listed=0`으로 남긴다.
- `Posts.json`에 있는 timestamp 글2개도 기존 숫자 URL로 보존한다. 현재 목록10개, 작품 날짜, 정렬 정보, 홈의 최근3개를 이관한다.
- 기존12개 글의 페이지 레이아웃과 첫 제목/썸네일 헤더는 공통 상세 화면에 맞게 제거한다. 본문과 이미지 순서·캡션·GIF·스타일을 추출하고, 제거 전 렌더 결과는 `legacy-rendered.json`에 별도 보관한다. 기존 화면과 같은 표현인지는 이관 후 화면에서 확인해야 한다.
- Note/CV/Memo의 현재 HTML과 실제 `Contact.tsx` 화면을 이관한다. Contact 내용은 API 컴포넌트로 바꾸기 전 화면을 `scripts/legacy-content/contact.html`에 보존했다. 사용하지 않는 `Posts/contact.html`을 Contact 본문으로 사용하지 않는다.
- 슬라이더의 기존 문자열 형식을 유지해 현재 파서와 호환한다. 이후 Tiptap JSON으로 전환할 수 있지만 이번 이관에서 본문 형식을 일괄 변환하지 않는다.
- 이미지 ID는 UUID이며 R2 경로는 공개 여부와 관계없이 `images/{uuid}.{확장자}`다. 공개 여부는 `media.visibility`로 관리한다. 게시물 표지는 `cover_media_id`, 본문 이미지 연결은 `post_media`와 `page_media`의 외래 키로 관리한다.
- Memo는 `visibility=private`이다. Memo의 인라인 이미지3개도 같은 이미지 경로 형식으로 추출하고 `media.visibility=private`으로 설정한다. URL은 인증을 요구하는 `/api/admin/media/{key}`이며 공개 `/api/media/{key}`에서 제공하지 않는다. 기존 `public/Posts/memo.html`이 새 Vercel 배포에 포함되지 않는지도 확인한다.
- 목록 미참조24개 timestamp 폴더는 `report.json`에 기록한다. 이관 도구는 해당 폴더를 삭제하거나 활성 글로 자동 등록하지 않는다. 과거 백업·실패한 업로드를 구분한 뒤 별도로 보관 여부를 결정한다.

현재 신규2개 글의 외부 Google 이미지 고유 URL은78개이며 Note에2개가 추가로 있다. 전체 저장소326MiB와 실제 게시 콘텐츠의 크기는 다르다. 외부 이미지 다운로드 전에는 R2의 최종 이관 용량을 알 수 없다.

## 1. 로컬에서 이관 자료 만들기

Node.js22.12 이상을 사용한다. 저장소 루트에서 실행한다.

```powershell
npm install
npm --prefix cloudflare install
node --test scripts/migration.test.mjs
node scripts/prepare-cloudflare-migration.mjs
```

마지막 명령은 **네트워크 접근과 외부 쓰기를 하지 않는다.** `.migration/` 아래에 다음 파일을 만든다.

| 파일 | 내용 |
| --- | --- |
| `manifest.json` | posts/pages/assets/post_media/page_media 및 진단 전체 |
| `content.sql` | 0001과 0002 마이그레이션 적용 후 가져올 D1 데이터 |
| `assets.json` | R2 object key, MIME, 크기, SHA-256, 로컬 파일 경로 |
| `media-identities.json` | 원본 경로·공개 여부에 대응하는 UUID 기록 |
| `assets/` | UUID로 이름을 정한 이미지 복사본 |
| `external-assets.json` | 외부 이미지 원본 주소와 사용 문서 |
| `legacy-rendered.json` | 원래 레거시 글12개의 렌더 HTML |
| `report.json` | 오류, 경고, 내장/blob 이미지, 목록 미참조 폴더 |

`.migration/`에는 private Memo 내용이 포함된다. Git에 추가하거나 공개 정적 폴더에 복사하지 않는다. 폴더는 `.gitignore`에 제외되어 있다. 이관 완료 후 별도의 접근 제한된 백업에 보관한다.

외부 이미지를 검토한 후 아래 명령으로 Google 이미지를 **로컬에만** 다운로드할 수 있다.

```powershell
node scripts/prepare-cloudflare-migration.mjs --import-external
```

이 옵션은 `lh3.googleusercontent.com`의 HTTPS 이미지만 허용하며 URL마다30MiB 한도와 타임아웃을 적용한다. 이미지가 삭제되었거나 공개 권한이 없으면 오류로 보고한다. 다른 외부 iframe/링크는 다운로드하지 않는다. 기본 실행에서는 Google URL이 본문과 표지에 그대로 남으며 `remainingExternalAssets`로 집계된다. Google 의존성을 없애려면 다운로드 실행 후 이 수치가0인지 확인한다.

base64 이미지는 공개/비공개 범위를 유지해 R2 자산으로 추출한다. 활성 콘텐츠에 복구 불가능한 `blob:` URL이나 누락된 로컬 이미지가 있으면 도구는 실패하고 `content.sql`에 실행문을 만들지 않는다. 먼저 `report.json`의 오류를 해결한다. 목록 미참조 보관 폴더 안의 blob URL은 별도 진단으로 남는다.

결과 기준은 posts14개, listedPosts10개, pages4개다. 원본 데이터가 변경되었다면 숫자 차이를 검토한다. 변환기는 Git의 `migration/media-identities.json`을 먼저 읽고 `.migration/media-identities.json`의 추가 매핑을 읽는다. 같은 원본에 서로 다른 UUID가 있으면 충돌을 보고하고 중단한다. 새 이미지를 변환한 뒤에는 로컬 매핑을 `migration/media-identities.json`으로 복사해 Git에도 저장한다. base64 이미지는 페이지와 출현 순서로 대응한다. 이전 이미지 복사본은 삭제하지 않는다. SHA-256은 로컬 업로드 파일의 무결성을 확인하는 manifest 값으로만 사용한다.

`content.sql`은 게시물/페이지 `version>1`인 편집본을 덮어쓰지 않는다. 버전1인 초기 이관 데이터의 연결만 `post_media`/`page_media`에서 지우고 현재 연결로 교체하므로 재실행 후 옛 이미지 연결이 남지 않는다. 운영 편집 후에는 이관 SQL 대신 관리자 API로 변경한다.

## 2. Cloudflare 리소스와 인증 준비

여기부터의 `create`, `secret put`, `--remote`, `deploy` 명령은 계정에 실제 변경을 만든다. 로컬 검증과 이관 자료 검토를 마친 뒤 운영 전환 시 실행한다.

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js login
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 create duldol-content
node cloudflare/node_modules/wrangler/bin/wrangler.js r2 bucket create duldol-media
```

생성된 D1 ID를 `cloudflare/wrangler.jsonc`의 `d1_databases[].database_id`에 넣는다. binding은 `DB`, R2 binding은 `MEDIA`이며 bucket 이름은 `duldol-media`다. Worker 이름은 `duldol-content-api`다.

Cloudflare Zero Trust에서 Self-hosted Access application을 만들고 대표 도메인의 `/api/admin/*` 경로만 보호한다. Allow 정책은 실제 관리자 이메일 allowlist로 제한한다. 공개 `/api/posts`, `/api/pages`, `/api/media/*`까지 Access 대상으로 만들지 않는다. Access 로그인은 `/api/admin/login?return_to=%2FEditor`로 브라우저를 이동시키는 방식이다. Worker가 JWT의 서명·issuer·audience를 검증하므로 임의 로그인 상태나 프런트의 localStorage 값으로 권한이 생기지 않는다.

Wrangler vars를 실제 계정 값으로 채운다.

| 이름 | 값 |
| --- | --- |
| `ACCESS_TEAM_DOMAIN` | `your-team.cloudflareaccess.com` |
| `ACCESS_AUD` | 해당 Access application의 audience |
| `APP_ORIGIN` | `https://www.duldoljimi.com` |
| `ADMIN_EMAILS` | 관리자 이메일(선택, 쉼표 구분; Access 정책과 일치) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_BUCKET_NAME` | `duldol-media` |

관리자 파일 직접 업로드용 R2 API token을 해당 bucket에 한정해 만들고 다음 secret을 설정한다. secret을 `VITE_*`나 브라우저 코드에 넣지 않는다.

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js secret put R2_ACCESS_KEY_ID --config cloudflare/wrangler.jsonc
node cloudflare/node_modules/wrangler/bin/wrangler.js secret put R2_SECRET_ACCESS_KEY --config cloudflare/wrangler.jsonc
```

R2 bucket의 CORS에는 대표 사이트 origin에서의 업로드 PUT과 필요한 Content-Type 헤더를 허용한다. 프리뷰 도메인은 운영 bucket에 자동 허용하지 않는다. 사이트 이미지는 Worker의 `/api/media/{object_key}`를 통해 제공하므로 R2 bucket 전체를 공개할 필요가 없다.

## 3. 로컬 D1/R2로 먼저 검증

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 migrations apply duldol-content --local --env local --config cloudflare/wrangler.jsonc
node scripts/upload-migration-assets.mjs --bucket duldol-media
node scripts/upload-migration-assets.mjs --bucket duldol-media --execute
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 execute duldol-content --local --env local --config cloudflare/wrangler.jsonc --file .migration/content.sql
node cloudflare/node_modules/wrangler/bin/wrangler.js dev --env local --config cloudflare/wrangler.jsonc
```

스키마 마이그레이션은 `0001_initial.sql`과 `0002` 파일을 모두 적용해야 한다. `d1 migrations apply`가 미적용 파일을 순서대로 적용한다. 0002는 표지의 이미지 ID 외래 키와 `post_media`/`page_media` 연결 테이블을 준비한다. 기존 버전의 데이터를 가져온 DB에도 0002를 먼저 적용한다.

업로더는 기본적으로 전체 파일의 크기·SHA-256·UUID 경로를 검증하고 계획만 출력한다. `--execute`만 주면 로컬 Wrangler R2에 복사하며, `--execute --remote`를 함께 주어야 실제 R2에 쓴다. 업로드가 중단되어도 `media-identities.json`을 유지하고 같은 명령으로 재시도할 수 있다.

Vite의 로컬 `/api` 프록시를 Worker 개발 서버에 연결해 목록/상세의 한글 URL, 숫자 URL, 썸네일, 슬라이더, GIF, Note/CV/Contact를 확인한다. `--env local`은 로컬 검증용 인증 우회를 사용한다. 실제 Access 인증 검증은 설정된 대표 도메인의 Worker에서 별도로 확인한다. 이 로컬 환경을 운영 배포하지 않는다.

## 4. 운영 데이터 import와 연결

다음 순서에서 이미지를 먼저 업로드해야 D1에서 참조하는 이미지가 누락되지 않는다.

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 migrations apply duldol-content --remote --config cloudflare/wrangler.jsonc
node scripts/upload-migration-assets.mjs --bucket duldol-media --execute --remote
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 execute duldol-content --remote --config cloudflare/wrangler.jsonc --file .migration/content.sql
node cloudflare/node_modules/wrangler/bin/wrangler.js deploy --config cloudflare/wrangler.jsonc
```

Cloudflare DNS에서 대표 사이트의 Vercel origin 레코드를 유지하고 Cloudflare proxy를 켠다. DNS가 Cloudflare에 등록되어 있어도 회색 구름(DNS only)이면 Worker route가 동작하지 않는다. Worker의 Domains & Routes에 `www.duldoljimi.com/api/*` route를 해당 zone으로 추가한다. apex가 대표 주소면 `duldoljimi.com/api/*`를 사용한다. 양쪽에서 사이트를 그대로 제공한다면 두 호스트 모두 route/Access application/허용 origin 설정을 검토하고 한 대표 주소로 redirect하는 구성이 단순하다. `/api/*` 외의 페이지 요청은 계속 Vercel로 간다. [Cloudflare Workers Routes 문서](https://developers.cloudflare.com/workers/configuration/routing/routes/)

Vercel 프로젝트 환경 변수 `VITE_CONTENT_API_URL=/api`를 Production에 설정하고 새 프런트 빌드를 배포한다. 개발/Preview는 별도 DB와 bucket 또는 비공개 검증 환경을 사용한다. Vercel frontend 전환은 Worker와 데이터 import가 완료된 뒤 진행한다. 업로드용 R2 credential과 Cloudflare account token을 Vercel에 넣을 필요가 없다.

전환 전후에 확인할 동작은 다음과 같다.

- 공개 사용자에게 Works10개가 노출되고 제목 URL12개와 숫자 URL2개가 모두 유지되는지 확인한다.
- 로그인하지 않은 `/api/admin/*` 접근과 private Memo API가 거절되는지, 로그인 후 편집/업로드/수정/삭제가 동작하는지 확인한다.
- 새 이미지를 추가해 R2 업로드 완료 후 게시물 저장이 가능하고, 저장 직후 새로고침에 반영되는지 확인한다.
- 같은 글을 두 창에서 수정했을 때 충돌을 감지하는지, 본문/표지에서 사용하는 이미지를 삭제할 수 없는지 확인한다.
- 예전 `/Posts/memo.html` 주소가 실제 메모 내용을 반환하지 않는지 확인한다. SPA index가 반환되는 경우에도 본문이 포함되지 않아야 한다.
- Network 탭에서 관리자 인증 뒤에만 private 응답이 내려오고, 공개 이미지가 `/api/media/...`에서 정상 MIME으로 로드되는지 확인한다.

## 5. 기존 토큰 폐기와 백업

운영 전환 검증이 끝나면 Vercel의 `VITE_APP_TOKEN` 및 옛 프런트 로그인용 환경 변수를 제거한다. GitHub Settings → Developer settings에서 기존 PAT를 폐기한다. 예전 배포 번들에 `VITE_*` 값이 포함되었을 수 있으므로 소스에서 없애는 것만으로 폐기가 끝나지 않는다. 이전 배포에 접근할 수 있어도 해당 토큰으로 저장소를 수정할 수 없도록 PAT 자체를 무효화해야 한다.

R2 credential은 bucket 범위를 제한하고 주기적으로 교체한다. D1은 관리 전환 전에 export하고, R2 원본과 이관 manifest도 접근 제한된 위치에 백업한다.

```powershell
node cloudflare/node_modules/wrangler/bin/wrangler.js d1 export duldol-content --remote --config cloudflare/wrangler.jsonc --output .migration/d1-backup.sql
```

콘텐츠 전환을 되돌릴 때는 Vercel의 이전 프런트 배포 및 기존 파일 데이터를 함께 사용한다. 이전 배포는 Memo 정적 공개와 폐기한 GitHub 편집 토큰 문제가 있으므로 읽기 확인용으로만 취급한다. 운영에서 생성된 새 게시물은 먼저 D1/R2로 백업해 보존한다. 기존 public 이미지·보관 폴더 정리는 전환과 별도 작업으로 진행한다.

CLI 옵션과 Access 구성은 [D1 Wrangler 문서](https://developers.cloudflare.com/d1/wrangler-commands/), [Self-hosted Access application 문서](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)를 기준으로 확인할 수 있다.
