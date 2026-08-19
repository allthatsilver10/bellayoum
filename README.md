# Bella Youm — Theatre Portfolio & Archive

무대감독 포트폴리오 & 개인 아카이브 웹사이트.
순수 HTML / CSS / JavaScript로만 만들었습니다. 외부 라이브러리 없음.

---

## 1. 사이트 열어보기

`index.html` 을 더블클릭하면 크롬에서 바로 열립니다. 서버 필요 없습니다.

페이지 주소는 이렇게 생겼습니다. 그대로 복사해서 보내면 그 페이지가 바로 열립니다.

```
index.html#/            오프닝
index.html#/profile     프로필
index.html#/portfolio   포트폴리오
index.html#/archive     아카이브 (세 개의 방)
index.html#/archive/pottery        도예 갤러리
index.html#/archive/photography    사진 갤러리
index.html#/archive/boxing         복싱 갤러리
index.html#/contact     컨택
```

---

## 2. 폴더 구조

```
index.html          ← 페이지 구조와 글
style.css           ← 디자인 (색·크기는 맨 위 :root 에 모아둠)
script.js           ← 동작

gallery-data.json   ← 사진 목록. Claude가 자동으로 씁니다. 직접 고치지 마세요.
gallery-data.js     ← 위와 똑같은 내용. 파일을 그냥 더블클릭해서 볼 때 쓰입니다.

images/             ← 사이트 고정 이미지 (오프닝 사진, 프로필 사진, 커튼 등)
projects/           ← 공연 하나당 폴더 하나
archive/
  pottery/          ← 도예 사진
  photography/      ← 사진 작업
  boxing/           ← 복싱 사진
favicon/
tools/
  build-gallery.py  ← 폴더를 읽어서 gallery-data.json 을 다시 쓰는 프로그램
mockups/            ← 시안 5종 + 수정본 (기록용, 사이트와는 무관)
```

---

## 3. 사진 추가하기 — 제일 자주 하실 일

**아카이브에 사진 추가**

1. `archive/pottery/` (또는 `photography`, `boxing`) 폴더에 사진을 넣습니다.
2. Claude에게 **"아카이브 다시 읽어"** 라고 말합니다.

끝입니다. 갤러리에 자동으로 나타납니다.

**파일 이름 팁**

이름 앞에 날짜를 붙이면 최신순으로 정렬되고 캡션도 자동으로 붙습니다.

```
2025-10-04_hangang.jpg   →   갤러리에 "2025 · Hangang" 이라고 표시됨
```

`IMG_4821.jpg` 처럼 그냥 넣어도 됩니다. 이름순으로 정렬되고 캡션만 없습니다.

**새 공연 추가**

1. `projects/` 안에 폴더를 만듭니다. 이름은 `2026-03-공연이름` 형식이면 좋습니다.
2. 그 안에 공연 사진을 넣습니다.
3. Claude에게 **"새 공연 추가해줘. 제목은 ○○, 연출 ○○, 내 역할은 ○○"** 이라고 말합니다.

제목·날짜·연출·역할은 사진에서 알 수 없으니 이때 알려주셔야 합니다.
한번 넣어두면 나중에 사진을 더 추가해도 그 정보는 그대로 유지됩니다.

**그 외에 Claude에게 말하면 되는 것들**

- "사진 순서 바꿔줘"
- "이 사진 지워줘"
- "이 사진 크게 보여줘" — 갤러리에서 한 줄을 통째로 쓰게 만듭니다
- "캡션 바꿔줘"

---

## 4. 글 고치기

프로필 문장, 에세이, 슬로건은 전부 `index.html` 안에 그냥 글로 들어 있습니다.
찾아서 고치면 됩니다. Claude에게 말씀하셔도 됩니다.

한국어 번역은 같은 태그 안에 `data-kr="..."` 로 붙어 있습니다.
헤더의 **EN / KR** 버튼이 이 둘을 바꿔치기합니다.

```html
<h1 data-en="Profile" data-kr="프로필">Profile</h1>
```

영어가 기본이고, 한번 고른 언어는 다음에 들어와도 기억됩니다.

---

## 5. 디자인 고치기

`style.css` 맨 위 `:root` 블록에 색과 여백이 전부 모여 있습니다.
여기 값 하나만 바꾸면 사이트 전체에 반영됩니다.

```css
--black:    #08080A;   /* 배경 */
--light:    #F2F0EC;   /* 제목 글자 */
--red-hot:  #A61C00;   /* 강조색 */
--pad:      좌우 여백
--gut:      사진 사이 간격
```

---

## 6. GitHub Pages에 올리기

모든 경로가 상대경로라서, 폴더를 통째로 올리면 바로 작동합니다.

1. github.com 에서 새 저장소(repository)를 만듭니다. Public으로.
2. 이 폴더의 파일을 전부 올립니다.
3. 저장소 **Settings → Pages** 에서 Source를 `main` 브랜치 / `/ (root)` 로 설정합니다.
4. 몇 분 뒤 `https://<아이디>.github.io/<저장소이름>/` 에서 열립니다.

**개인 도메인 연결**

1. Settings → Pages → Custom domain 에 도메인을 입력합니다.
   저장하면 이 폴더에 `CNAME` 파일이 생깁니다. 지우지 마세요.
2. 도메인 산 곳(가비아, Cloudflare 등)에서 DNS를 이렇게 설정합니다.

   `www` 로 쓸 경우 — CNAME 레코드 하나:
   ```
   www   CNAME   <아이디>.github.io
   ```

   `example.com` 처럼 www 없이 쓸 경우 — A 레코드 네 개:
   ```
   @   A   185.199.108.153
   @   A   185.199.109.153
   @   A   185.199.110.153
   @   A   185.199.111.153
   ```
3. DNS가 퍼지는 데 최대 24시간 걸립니다. 그 다음 **Enforce HTTPS** 를 켜세요.

나중에 Cloudflare로 옮기더라도 정적 파일이라 그대로 올리면 됩니다.

---

## 7. 알아두실 것

**폰트** — 지금은 Mac 기본 폰트(Avenir Next)를 씁니다. Windows에서 보면 다른 서체로
대체됩니다. 어디서나 똑같이 보이게 하려면 웹폰트 파일을 넣어야 합니다.
가장 가까운 무료 대체는 **Jost** 또는 **Nunito Sans** 입니다. 말씀해 주시면 넣어드리겠습니다.

**아직 임시인 것**

- 공연 제목·날짜·연출·역할 (실제 정보로 교체 필요)
- 프로필 사진 — 지금은 작품 사진입니다. 세로 비율 헤드샷으로 교체 권장

**사진 용량** — 원본을 그대로 올리면 사이트가 느려집니다.
가로 2000px 이하로 줄여서 넣으시는 걸 권합니다. Claude에게 "사진 용량 줄여줘"
라고 하셔도 됩니다.

---

## 8. 비밀번호

사이트는 네 자리 숫자를 넣어야 열립니다. 바꾸려면 `script.js` 안의 이 한 줄만 고치면 됩니다.

```js
var PASSWORD = "1024";
```

한 번 입장하면 브라우저를 닫을 때까지 다시 묻지 않습니다.

**이건 잠금장치가 아니라 커튼입니다.** 저장소가 공개라, 마음먹은 사람은 GitHub에서 파일을 직접 받아갈 수 있습니다. "링크를 타고 들어온 사람이 바로 못 보게" 하는 용도입니다.

---

## 9. 개발자용 메모

**캐시 주의** — GitHub Pages는 파일을 10분간 캐시하라고 브라우저에 알려줍니다. 그래서
`style.css` · `script.js` · `gallery-data.js` 를 고쳤으면 `index.html` 안의 `?v=` 숫자를
반드시 올려야 합니다. 안 그러면 재방문자가 새 HTML에 옛 JS를 물고 돌아가서 이상하게 동작합니다.

```html
<link rel="stylesheet" href="style.css?v=2">
<script src="gallery-data.js?v=2"></script>
<script src="script.js?v=2"></script>
```



`tools/build-gallery.py` 는 Pillow가 필요합니다.

```bash
python3 -m pip install --user Pillow
python3 tools/build-gallery.py
```

폴더를 훑어서 각 이미지의 실제 픽셀 크기를 읽고 `gallery-data.json` 과
`gallery-data.js` 를 다시 씁니다. 손으로 써넣은 공연 정보, 캡션, `feature` 표시는
덮어쓰지 않고 그대로 보존합니다.

갤러리는 justified rows 방식입니다. 사진은 절대 잘리지 않고 각자의 비율을
유지하지만, 각 줄은 페이지 폭에 정확히 맞춰집니다. 그래서 좌우 여백과 사진 사이
간격이 모든 줄에서 완전히 동일합니다.
