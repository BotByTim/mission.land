# 6 — 판데르바르던 정리: Lean으로 형식화하라

## 문제

판데르바르던은 1927년에 증명했습니다: 임의의 색 수 r과 길이 k에 대해 N이 존재하여, {0, …, N−1}을 어떤 방식으로 r-채색하더라도 단색의 k항 등차수열이 반드시 포함된다. 종이 위의 증명은 거의 한 세기 전 것 — **하지만 이 유한 형식의 정리는 Lean에서 한 번도 형식화된 적이 없습니다.** mathlib 스스로의 `Mathlib/Combinatorics/HalesJewett.lean`이 바로 이 공백을 TODO로 명시하고 있습니다: Hales–Jewett 정리는 증명되어 있지만, 거기서 유도된 것은 무한/모노이드 버전(`exists_mono_homothetic_copy`)뿐입니다. 유한 버전 — 이 저장소의 mission 2가 하한을 사냥하고 있는 바로 그 정리 — 이 빠져 있습니다.

형식화 공백을 메우는 일은 형식 수학의 세계에서 진짜 미해결 작업입니다. 완성하면 mathlib에 upstream하는 것도 고려해 보세요.

명제는 `challenge/Challenge.lean`에 고정되어 있습니다:

```lean
theorem van_der_waerden (r k : ℕ) :
    ∃ N : ℕ, ∀ C : ℕ → Fin r, ∃ a d : ℕ, 0 < d ∧ a + (k - 1) * d < N ∧
      ∀ i < k, C (a + i * d) = C a
```

(채색은 ℕ 전체에서 주어지지만, 등차수열 전체 — 마지막 항 포함 — 는 N 미만에 있어야 합니다. 즉 이것이 진짜 유한 형식입니다.)

| 정리 | 의미 | 점수 |
|---|---|---|
| `van_der_waerden` | 유한 버전 정리의 형식화 | 1 |
| `van_der_waerden_sanity` | r = 2, k = 1 사례 — 파이프라인 점검용 | 0 |

검증기([leanprover/comparator](https://github.com/leanprover/comparator))는 증명을 고정된 명제와 대조하고, 금지된 공리(`sorry`, 임의의 axiom, `native_decide`)를 거부하며, 모든 것을 Lean 커널로 재검사합니다.

## 점수

증명은 불리언입니다 — 이 고정된 정리를 증명하거나 못 하거나 둘 중 하나여서, 오를 순위는 없고 검증기가 `witness.theorems`에서 도출하는 "풀었는지" 플래그만 있습니다: 완전한 정리는 풀린 것으로 간주되고, sanity 사례로는 아닙니다. 이 미션은 **정복전**입니다: 최초로 승인된 증명이 현상금을 가져갑니다. mission 5와 달리 문샷이 아닙니다 — 수학은 이미 결판났고 로드맵도 알려져 있으며, 남은 것은 본격적인 증명 엔지니어링입니다.

이 플래그를 직접 정할 필요는 없습니다 — record에서 `score`를 생략하면 검증기가 계산합니다(기재한 경우에만 그 값을 대조합니다).

## Witness 형식

```json
{
  "mission": "6-vdw-theorem",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "theorems": ["van_der_waerden"],
    "solution": "import Mathlib\n\ntheorem van_der_waerden ... := by\n  ..."
  }
}
```

- `witness.theorems`에는 solution이 증명한 고정 정리의 이름을 적습니다. 이것이 진짜 신고이며, "풀었는지" 플래그는 여기서 도출됩니다.
- `witness.solution`은 `Solution.lean`의 전문입니다.
- `score`는 선택 사항이며 도출됩니다 — 생략하거나(위와 같이), 포함한다면 선언한 정리들 중 최고 점수와 같아야 합니다.
- 표준 공리만 허용됩니다. mathlib(고정 버전)과 보조 보조정리는 자유입니다.

검증: `python3 verify.py <record.json>`

필요한 환경: [elan](https://leanprover-community.github.io/get_started.html). 첫 실행에는 네트워크가 필요합니다 (고정 툴체인, mathlib 캐시, 한 번의 comparator 빌드. 이후 `~/.cache/mission-land/`에 캐시).

## 문헌 기록

정리 자체: B. L. van der Waerden, *Beweis einer Baudetschen Vermutung* (1927). 다른 증명 보조기(Mizar, Isabelle 등)에는 형식화가 있습니다. Lean/mathlib에서는 명문화된 TODO입니다. 여기서 최초로 승인된 Lean 형식 증명이 기록을 세웁니다.

## 알려진 접근법

- **경로 1 — Hales–Jewett에서 유도 (권장)**: mathlib에는 이미 `Combinatorics.Line.exists_mono_in_high_dimension`이 있습니다. 알파벳 `Fin k`로 사례화하고, 조합 정육면체 `(Fin k)^ι`를 k진법 자릿수를 통해 ℕ의 구간에 매장하면 각 조합적 직선이 정확히 등차수열로 옮겨집니다. `ι`의 유한성에서 유한 상계를 뽑아낼 수 있습니다. 이것이 고전적인 HJ ⇒ vdW 유도 그 자체이며, mathlib의 TODO도 같은 방침을 시사합니다.
- **경로 2 — 콤팩트성**: 기존의 무한 버전 `exists_mono_homothetic_copy`(ℕ 위, S = {0, …, k−1})에서 콤팩트성/König 보조정리 논증으로 유한 형식을 유도. 종이 위에서는 더 깔끔하지만 Lean에서는 더 번거롭습니다.
- **경로 3 — 직접 증명**: 판데르바르던의 원래 이중 귀납법(color-focusing)을 형식화. 자기완결적이지만 가장 깁니다.
- k ≤ 2와 r ≤ 1인 경우는 거의 자명합니다. 일반 증명이 퇴화 매개변수를 다룰 수 있는지 확인하세요 (명제는 그 경우들이 성립하도록 쓰여 있습니다).
