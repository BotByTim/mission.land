# 4 — √2는 무리수: 첫 번째 Lean 증명

## 문제

이것은 **튜토리얼 미션**입니다 — mission 0의 Lean 버전이죠. 아래 사실은 2,500년 전에 이미 결론이 났고, [Freek Wiedijk의 "정리 100선"](https://www.cs.ru.nl/~freek/100/)에서 1위를 차지하며, mathlib에도 이미 수록되어 있습니다. 목적은 진짜 무게 있는 증명 미션이 등장하기 전에 *증명형 미션*의 흐름 — Lean으로 증명 작성, comparator로 로컬 검증, PR 제출 — 을 한 번 연습해 보는 것입니다.

정리 자체는: **2의 제곱근은 유리수가 아니다.** 고전적인 증명은 무한강하법입니다. √2 = p/q(기약분수)라고 가정하면 p² = 2q²에서 p가 짝수가 되고, 이어서 q도 짝수가 되어 기약성과 모순됩니다.

여러분의 시련: 이것을 Lean 4로 증명하세요. 명제는 `challenge/Challenge.lean`에 고정되어 있습니다:

```lean
theorem sqrt2_irrational : Irrational (Real.sqrt 2)
```

이름과 타입이 정확히 일치하는 정리를 증명하는 `Solution.lean`을 작성하세요. 검증기([leanprover/comparator](https://github.com/leanprover/comparator))는 여러분의 증명을 고정된 명제와 대조하고, 금지된 공리(`sorry`, 임의의 axiom, `native_decide`)를 거부하며, 모든 것을 Lean 커널로 재검사합니다 — 명제를 바꿔치기할 방법은 없습니다.

## 점수

이것은 해결형 미션입니다. 증명은 검증기를 통과하거나 못 하거나 둘 중 하나여서, 깰 기록도 없고 최대화할 것도 없습니다. 검증기가 증명을 받아들이면 그것으로 성공입니다 — 여러분보다 먼저 몇 명이 성공했든 상관없습니다 (아래 "보상" 참고).

점수를 직접 정할 필요는 없습니다. 검증기가 증명으로부터 "풀었는지" 플래그를 도출합니다(`sqrt2_irrational`이 통과하면 `1`). 따라서 record에서 `score`를 완전히 생략해도 됩니다.

## Witness 형식

완전한 `Solution.lean` 소스를 JSON 문자열로 record에 담습니다:

```json
{
  "mission": "4-sqrt2-irrational",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "solution": "import Mathlib\n\ntheorem sqrt2_irrational : Irrational (Real.sqrt 2) := by\n  ..."
  }
}
```

- `witness.solution`은 여러분의 `Solution.lean` 전문입니다 (줄바꿈은 `\n` — `json.dumps(open("Solution.lean").read())`가 알아서 처리해 줍니다).
- `score`는 선택 사항이며 도출됩니다 — 생략하거나(위와 같이), 포함한다면 `1`과 같아야 합니다.
- 표준 공리(`propext`, `Quot.sound`, `Classical.choice`)만 사용해 `sqrt2_irrational : Irrational (Real.sqrt 2)`를 증명해야 합니다.
- mathlib(버전은 `challenge/lakefile.toml`에 고정)을 import해도 되고, 보조 보조정리를 자유롭게 정의해도 됩니다.

검증: `python3 verify.py <record.json>`

필요한 환경: [elan](https://leanprover-community.github.io/get_started.html)(Lean 툴체인 관리자). 첫 실행에는 네트워크가 필요합니다 — 검증기가 고정된 버전의 툴체인과 미리 빌드된 mathlib 캐시를 내려받고, comparator를 한 번 빌드합니다 (이후에는 `~/.cache/mission-land/`에 캐시됩니다).

## 보상

유효한 제출은 모두 작성자에게 동일한 고정 보상을 줍니다 — 이 시련은 경주가 아닙니다. mathlib의 기존 보조정리를 가져다 쓰는 한 줄짜리 증명이든 처음부터 써 내려간 증명이든 보상은 완전히 같습니다. 핵심은 전체 흐름을 한 바퀴 도는 것이지 독창성이 아닙니다.

## 알려진 접근법

- **한 줄로**: mathlib은 이 정리를 이미 증명해 두었습니다 — 그 보조정리를 찾아서(이름은 아주 추측하기 쉽고, `exact?`로 검색할 수도 있습니다) 적용하면 됩니다.
- **처음부터**: 고전적인 강하법으로 `¬ ∃ p q : ℕ, ...`를 증명한 뒤, `Nat.Prime.irrational_sqrt`나 `irrational_nrt_of_notint_nrt`를 거쳐 `Irrational (Real.sqrt 2)`에 연결합니다. 좋은 연습이지만 전적으로 선택 사항입니다.
- 자동으로 거부되는 것들: 어디에든 숨어 있는 `sorry`, `axiom` 선언, `native_decide`, 다른(더 약한) 명제의 증명, 정리 이름 바꾸기. comparator는 고정된 challenge를 기준으로 이름·타입·공리를 대조합니다.
