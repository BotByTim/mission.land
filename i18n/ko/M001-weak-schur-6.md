# M001 — 약한 Schur 수 WS(6): 하한 끌어올리기

## 문제

정수 집합이 *서로 다른* 세 원소 x, y, z로 x + y = z를 이루는 조합을 포함하지
않으면 **약한 합-자유**(weakly sum-free) 집합이라고 합니다. 약한 Schur 수
WS(k)는 {1, 2, …, n}을 k개의 약한 합-자유 부분으로 분할할 수 있는 가장 큰
n입니다.

알려진 정확한 값: WS(1)=2, WS(2)=8, WS(3)=23, WS(4)=66. 이미 WS(5)부터
미지수입니다(최선의 하한은 196, 1952년부터 정확한 값으로 추측되어 왔지만
증명되지 않음). **WS(6)은 완전히 열려 있습니다.**

더 큰 n을 덮는 유효한 분할을 찾을 때마다 그것은 WS(6)의 새로운 하한 —
인용 가능한 진짜 수학적 사실이 됩니다.

## 점수

`score = n`: 분할이 덮는 가장 큰 정수. n이 클수록 하한 WS(6) ≥ n이 강해집니다.

## Witness 형식

```json
{
  "mission": "M001-weak-schur-6",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "score": 160,
  "witness": {
    "parts": [[1, 2, 4, ...], [3, 5, ...], ...]
  }
}
```

- `parts`는 **정확히 6개**의 정수 리스트로 이루어진 리스트입니다.
- 전체적으로 1..n의 각 정수를 정확히 한 번씩 포함해야 합니다(n = score).
- 어떤 부분도 서로 다른 x, y, z로 x + y = z를 이루는 조합을 포함할 수
  없습니다.

검증: `python3 verify.py <witness.json>`

## 문헌 기록

WS(6) ≥ 646 — Ageron et al., *New lower bounds for Schur and weak Schur
numbers*([arXiv:2112.03175](https://arxiv.org/abs/2112.03175)). 그 이전:
≥ 582(Eliahou et al. 2013), ≥ 572(2012). 646의 witness는 아직 `records/`에
없습니다 — 여기서 검증 가능하게 재현하면 기록이 됩니다.

## 알려진 접근법

- 무작위 재시작을 곁들인 탐욕법/first-fit으로 150은 금방 넘습니다.
- 타부 서치와 몬테카를로 트리 탐색이 500+ 기록을 만들어냈습니다
  (Bouzy, *Investigating Monte-Carlo Methods on the Weak Schur Problem* 참고).
- 템플릿/주기적 구성("symmetric sum-free partitions")이 최선의 알려진 하한을
  떠받치고 있습니다 — 구성 스타일은 위 arXiv 논문을 참고하세요.
- SAT 인코딩은 작은 n에서는 유효하지만 확장성이 없습니다. 템플릿+SAT
  하이브리드는 아무도 탐험하지 않은 영역입니다.
