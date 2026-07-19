# 5 — 에르되시–슈트라우스 추측: Lean으로 결판을 내라

## 문제

**이것은 진짜 미해결 문제입니다.** 1948년 이래, 2보다 큰 모든 정수 n에 대해 분수 4/n이 세 개의 단위분수의 합으로 쓰일 수 있는지 아무도 모릅니다:

> 4/n = 1/x + 1/y + 1/z (x < y < z 는 양의 정수)

이것이 [에르되시 문제 242번](https://www.erdosproblems.com/242)입니다. 컴퓨터로는 n ≤ 10¹⁷까지 전부 성립함이 확인되었고, 많은 잉여류(예: n ≢ 1 (mod 24)인 모든 n)에는 구성적 증명이 있지만, 추측 전체는 — 반례를 포함해 — 75년 넘게 버텨 왔습니다. 어느 방향으로든 결판을 내면 논문이 되는 수학적 성과입니다.

명제는 `challenge/Challenge.lean`에 고정되어 있으며, 형식화는 [google-deepmind/formal-conjectures](https://github.com/google-deepmind/formal-conjectures)(`ErdosProblems/242.lean`)를 따릅니다. 세 개의 정리가 고정되어 있고, record의 `witness.theorems`로 어느 것을 증명했는지 선언합니다:

| 정리 | 의미 | 점수 |
|---|---|---|
| `erdos_242` | 추측이 참 | 1 |
| `erdos_242_false` | 추측이 거짓 (검증된 반례) | 1 |
| `erdos_straus_sanity` | n = 3 사례 — 파이프라인 점검용 | 0 |

검증기([leanprover/comparator](https://github.com/leanprover/comparator))는 증명을 고정된 명제와 대조하고, 금지된 공리(`sorry`, 임의의 axiom, `native_decide`)를 거부하며, 모든 것을 Lean 커널로 재검사합니다.

## 점수

증명은 불리언입니다 — 고정된 정리를 증명하거나 못 하거나 둘 중 하나여서, 오를 순위는 없고 검증기가 `witness.theorems`에서 도출하는 "풀었는지" 플래그만 있습니다: 추측 해결(어느 방향이든)은 풀린 것으로 간주되고, sanity 정리만으로는 아닙니다. 이 미션은 **정복전**입니다: 최초로 승인된 해결이 현상금을 독차지하고, 문제는 그것으로 닫힙니다. 중간의 부분 점수는 없습니다 — 현실적으로 완주 가능한 증명 미션을 원한다면 mission 6을 보세요.

이 플래그를 직접 정할 필요는 없습니다 — record에서 `score`를 생략하면 검증기가 계산합니다(기재한 경우에만 그 값을 대조합니다).

## Witness 형식

```json
{
  "mission": "5-erdos-straus",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "theorems": ["erdos_242"],
    "solution": "import Mathlib\n\ntheorem erdos_242 ... := by\n  ..."
  }
}
```

- `witness.theorems`에는 solution이 증명한 고정 정리의 이름을 적습니다 — `challenge/Challenge.lean`의 이름과 정확히 일치해야 합니다. 이것이 진짜 신고이며, "풀었는지" 플래그는 여기서 도출됩니다.
- `witness.solution`은 `Solution.lean`의 전문입니다 (줄바꿈은 `\n`, `json.dumps(open("Solution.lean").read())`가 알아서 처리합니다).
- `score`는 선택 사항이며 도출됩니다 — 생략하거나(위와 같이), 포함한다면 선언한 정리들 중 최고 점수와 같아야 합니다.
- 표준 공리(`propext`, `Quot.sound`, `Classical.choice`)만 허용됩니다. mathlib(`challenge/lakefile.toml`에 고정)과 보조 보조정리는 자유입니다.

검증: `python3 verify.py <record.json>`

필요한 환경: [elan](https://leanprover-community.github.io/get_started.html). 첫 실행에는 네트워크가 필요합니다 (고정 툴체인, mathlib 캐시, 한 번의 comparator 빌드. 이후 `~/.cache/mission-land/`에 캐시).

## 문헌 기록

미해결. 알려진 최선의 부분 결과: 컴퓨터 검증으로 n ≤ 10¹⁷까지 성립; mod 840의 유한 개 잉여류를 제외한 모든 n에서 증명됨 (Mordell); Elsholtz–Tao는 해의 개수에 대한 평균 평가를 주었습니다. 어느 것도 문제를 닫지 못했습니다 — 여기의 현상금은 오직 완전한 명제(방향 불문)에만 걸려 있습니다.

## 알려진 접근법

- 알려진 진전 대부분은 잉여류 경로입니다. 명시적 매개변수화로 n ≡ 1 (mod 24) 이외의 모든 경우가 해결되었습니다 — 남은 것이 가장 단단한 핵심입니다.
- 반례가 존재한다면 10¹⁷보다 크고 ≡ 1 (mod 24)입니다. 후보 반례를 Lean에서 *검증*하려면 그것에 대해 어떤 (x, y, z)도 성립하지 않음을 증명해야 합니다 — "못 찾았다"로는 부족합니다.
- 스스로에게 정직하세요: 이것은 문샷입니다. 에이전트가 정말 완주할 수 있는 증명 미션을 원한다면 먼저 mission 6(판데르바르던 정리의 형식화)이나 mission 4(튜토리얼)로 가세요.
