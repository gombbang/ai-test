-- 시드 데이터 삽입
-- 기존 데이터가 없을 때만 삽입되도록 처리

INSERT INTO memos (id, title, content, category, tags, created_at, updated_at, summary)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '프로젝트 회의 준비',
    '다음 주 월요일 오전 10시 프로젝트 킥오프 미팅을 위한 준비사항:

- 프로젝트 범위 정의서 작성
- 팀원별 역할 분담
- 일정 계획 수립
- 필요한 리소스 정리',
    'work',
    ARRAY['회의', '프로젝트', '준비'],
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'React 18 새로운 기능 학습',
    '# React 18 새로운 기능들

React 18에서 새로 추가된 주요 기능들을 정리했습니다.

## 🚀 주요 기능들

### 1. Concurrent Features
- **자동 배칭**: 여러 상태 업데이트를 하나로 묶어서 처리
- **Suspense 개선**: 데이터 fetching과 코드 스플리팅에서 더 나은 사용자 경험

### 2. 새로운 Hooks

#### useId
```javascript
import { useId } from ''react'';

function Component() {
  const id = useId();
  return <input id={id} />;
}
```

#### useDeferredValue
```javascript
const deferredQuery = useDeferredValue(query);
```

## 📅 학습 계획

- [x] 공식 문서 읽기
- [ ] 간단한 예제 프로젝트 만들기
- [ ] 기존 프로젝트에 적용해보기

> **참고**: 이번 주말에 집중적으로 학습 예정',
    'study',
    ARRAY['React', '학습', '개발'],
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '새로운 앱 아이디어: 습관 트래커',
    '매일 실천하고 싶은 습관들을 관리할 수 있는 앱:

핵심 기능:
- 습관 등록 및 관리
- 일일 체크인
- 진행 상황 시각화
- 목표 달성 알림
- 통계 분석

기술 스택: React Native + Supabase
출시 목표: 3개월 후',
    'idea',
    ARRAY['앱개발', '습관', 'React Native'],
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '3 days',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '주말 여행 계획',
    '이번 주말 제주도 여행 계획:

토요일:
- 오전: 한라산 등반
- 오후: 성산일출봉 관광
- 저녁: 흑돼지 맛집 방문

일요일:
- 오전: 우도 관광
- 오후: 쇼핑 및 기념품 구매
- 저녁: 공항 이동

준비물: 등산화, 카메라, 선크림',
    'personal',
    ARRAY['여행', '제주도', '주말'],
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '독서 목록',
    '올해 읽고 싶은 책들:

개발 관련:
- 클린 코드 (로버트 C. 마틴)
- 리팩토링 2판 (마틴 파울러)
- 시스템 디자인 인터뷰 (알렉스 쉬)

자기계발:
- 아토믹 해빗 (제임스 클리어)
- 데일 카네기 인간관계론

소설:
- 82년생 김지영 (조남주)
- 미드나잇 라이브러리 (매트 헤이그)',
    'personal',
    ARRAY['독서', '책', '자기계발'],
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days',
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '성능 최적화 아이디어',
    '# 웹 애플리케이션 성능 최적화 💡

성능 최적화는 사용자 경험 향상의 핵심입니다.

## 🎨 프론트엔드 최적화

### 이미지 최적화
- **WebP 포맷 사용**: 기존 JPEG/PNG 대비 25-35% 크기 감소
- **Lazy Loading**: 뷰포트에 들어올 때만 로드
- **Responsive Images**: 다양한 화면 크기에 맞는 이미지 제공

### 코드 최적화
```javascript
// 코드 스플리팅 예시
const LazyComponent = lazy(() => import(''./LazyComponent''));

// 번들 분석
npm run build -- --analyze
```

## ⚡ 백엔드 최적화

| 방법 | 효과 | 구현 난이도 |
|------|------|-------------|
| 쿼리 최적화 | 높음 | 중간 |
| CDN 활용 | 높음 | 낮음 |
| 캐싱 전략 | 매우 높음 | 높음 |

## 📊 모니터링

> **Core Web Vitals 지표**
> - **LCP**: 2.5초 이하
> - **FID**: 100ms 이하  
> - **CLS**: 0.1 이하

### 도구 추천
- **Lighthouse**: 성능 측정
- **Web Vitals**: 실제 사용자 데이터
- **Bundle Analyzer**: 번들 크기 분석',
    'idea',
    ARRAY['성능', '최적화', '웹개발'],
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '12 days',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

