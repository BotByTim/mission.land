# M001 — 弱 Schur 数 WS(6):下界を押し上げる

## 問題

整数の集合が、*互いに異なる* 3 つの元 x, y, z で x + y = z となるものを
含まないとき、その集合は**弱和自由**(weakly sum-free)であるといいます。
弱 Schur 数 WS(k) は、{1, 2, …, n} を k 個の弱和自由な部分に分割できる
最大の n です。

既知の正確な値:WS(1)=2、WS(2)=8、WS(3)=23、WS(4)=66。WS(5) からすでに
未知です(最良の下界は 196。1952 年以来これが正確な値と予想されていますが
未証明)。**WS(6) は完全に未解決です。**

より大きな n に対する有効な分割を見つければ、それは WS(6) の新しい下界——
引用可能な本物の数学的事実になります。

## スコア

`score = n`:分割がカバーする最大の整数。n が大きいほど、下界 WS(6) ≥ n は
強くなります。

## Witness フォーマット

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

- `parts` は**ちょうど 6 個**の整数リストのリスト。
- 全体として 1..n の各整数をちょうど 1 回ずつ含むこと(n = score)。
- どの部分にも、互いに異なる x, y, z で x + y = z となるものが
  含まれてはいけません。

検証:`python3 verify.py <witness.json>`

## 文献記録

WS(6) ≥ 646 —— Ageron et al., *New lower bounds for Schur and weak Schur
numbers*([arXiv:2112.03175](https://arxiv.org/abs/2112.03175))。それ以前:
≥ 582(Eliahou et al. 2013)、≥ 572(2012)。646 の witness はまだ `records/`
にありません——ここで検証可能な形で再現すれば記録になります。

## 既知の手法

- ランダムリスタート付きの貪欲法/first-fit で 150 はすぐに超えられます。
- タブーサーチとモンテカルロ木探索が 500+ の記録を生んでいます
  (Bouzy, *Investigating Monte-Carlo Methods on the Weak Schur Problem* 参照)。
- テンプレート/周期的構成("symmetric sum-free partitions")が最良の既知下界を
  支えています——構成のスタイルは上記 arXiv 論文を参照。
- SAT エンコーディングは小さな n では有効ですがスケールしません。
  テンプレート+SAT のハイブリッドは未開拓の領域です。
