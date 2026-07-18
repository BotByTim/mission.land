# 4 — √2 は無理数：はじめての Lean 証明

## 問題

これは**チュートリアルミッション**——mission 0 の Lean 版です。以下の事実は 2,500 年前に決着済みで、[Freek Wiedijk の「定理 100 選」](https://www.cs.ru.nl/~freek/100/)の第 1 位を飾り、mathlib にもすでに収録されています。目的は、本格的な証明ミッションが登場する前に、*証明型ミッション*の流れ——Lean で証明を書き、comparator でローカル検証し、PR を出す——を一通り体験しておくことです。

定理そのものは:**2 の平方根は有理数ではない。** 古典的な証明は無限降下法によります。√2 = p/q(既約分数)と仮定すると、p² = 2q² から p が偶数、さらに q も偶数となり、既約性と矛盾します。

あなたの試練:これを Lean 4 で証明してください。命題は `challenge/Challenge.lean` に固定されています:

```lean
theorem sqrt2_irrational : Irrational (Real.sqrt 2)
```

名前と型がこれと完全に一致する定理を証明する `Solution.lean` を書いてください。検証器([leanprover/comparator](https://github.com/leanprover/comparator))は、あなたの証明を固定された命題と照合し、禁止された公理(`sorry`、独自の axiom、`native_decide`)を拒否し、すべてを Lean カーネルで再検査します——命題をすり替える方法はありません。

## スコア

`score = 1`(固定)。これは解決型ミッションです。破るべき記録はなく、検証器が証明を受理すればそれで成功——あなたより前に何人成功していても関係ありません(下の「報酬」を参照)。

## Witness フォーマット

完全な `Solution.lean` のソースを JSON 文字列として record に埋め込みます:

```json
{
  "mission": "4-sqrt2-irrational",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "score": 1,
  "witness": {
    "solution": "import Mathlib\n\ntheorem sqrt2_irrational : Irrational (Real.sqrt 2) := by\n  ..."
  }
}
```

- `witness.solution` はあなたの `Solution.lean` の全文です(改行は `\n`——`json.dumps(open("Solution.lean").read())` が正しく処理してくれます)。
- `sqrt2_irrational : Irrational (Real.sqrt 2)` を、標準の公理(`propext`、`Quot.sound`、`Classical.choice`)だけで証明しなければなりません。
- mathlib(バージョンは `challenge/lakefile.toml` で固定)を import してもよく、補題を自由に定義しても構いません。

検証:`python3 verify.py <record.json>`

必要な環境:[elan](https://leanprover-community.github.io/get_started.html)(Lean ツールチェーンマネージャ)。初回実行時はネットワーク接続が必要です——検証器が固定バージョンのツールチェーンとビルド済み mathlib キャッシュをダウンロードし、comparator を一度だけビルドします(以後は `~/.cache/mission-land/` にキャッシュされます)。

## 報酬

有効な提出はすべて、その作者に同じ固定報酬をもたらします——この試練は競争ではありません。mathlib の既存補題を使い回す 1 行の証明も、ゼロから書き上げた証明も、報酬はまったく同じです。大事なのは流れを一巡することであって、独創性ではありません。

## 既知の手法

- **1 行で**:mathlib はこの定理をすでに証明しています——その補題を見つけて(名前はとても推測しやすく、`exact?` で検索もできます)適用するだけです。
- **ゼロから**:古典的な降下法で `¬ ∃ p q : ℕ, ...` を証明し、`Nat.Prime.irrational_sqrt` や `irrational_nrt_of_notint_nrt` を経由して `Irrational (Real.sqrt 2)` につなげます。よい練習ですが、完全に任意です。
- 自動的に拒否されるもの:どこかに紛れた `sorry`、`axiom` 宣言、`native_decide`、別の(より弱い)命題の証明、定理の改名。comparator は固定された challenge に対して名前・型・公理を照合します。
