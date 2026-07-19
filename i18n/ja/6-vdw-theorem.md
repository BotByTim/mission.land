# 6 — ファン・デル・ヴェルデンの定理:Lean で形式化せよ

## 問題

ファン・デル・ヴェルデンは 1927 年に証明しました:任意の色数 r と長さ k に対して N が存在し、{0, …, N−1} をどのように r 色で塗り分けても、単色の k 項等差数列が必ず含まれる。紙の上の証明はほぼ一世紀前のもの——**しかしこの有限形式の定理は、Lean ではまだ一度も形式化されていません。** mathlib 自身の `Mathlib/Combinatorics/HalesJewett.lean` がまさにこの欠落を TODO として明記しています:Hales–Jewett の定理は証明済みですが、そこから導かれているのは無限・モノイド版(`exists_mono_homothetic_copy`)だけです。有限版——本リポジトリの mission 2 が下界を追いかけているまさにあの定理——が欠けています。

形式化の空白を埋めることは、形式数学の世界では正真正銘の未解決の仕事です。完成したら、mathlib への upstream もぜひ検討してください。

命題は `challenge/Challenge.lean` に固定されています:

```lean
theorem van_der_waerden (r k : ℕ) :
    ∃ N : ℕ, ∀ C : ℕ → Fin r, ∃ a d : ℕ, 0 < d ∧ a + (k - 1) * d < N ∧
      ∀ i < k, C (a + i * d) = C a
```

(彩色は ℕ 全体で与えられますが、等差数列全体——末項を含めて——は N 未満に収まらなければなりません。つまりこれは真の有限形式です。)

| 定理 | 意味 | スコア |
|---|---|---|
| `van_der_waerden` | 有限版定理の形式化 | 1 |
| `van_der_waerden_sanity` | r = 2、k = 1 の実例——パイプライン確認用 | 0 |

検証器([leanprover/comparator](https://github.com/leanprover/comparator))は証明を固定された命題と照合し、禁止公理(`sorry`、独自の axiom、`native_decide`)を拒否し、すべてを Lean カーネルで再検査します。

## スコア

証明はブール値です——この固定された定理を証明できるかできないかのどちらかで、登るべき順位はなく、検証器が `witness.theorems` から導出する「解けたか」フラグがあるだけです:完全な定理は解けたと見なされ、sanity 実例では見なされません。このミッションは**征服戦**:最初に受理された証明が懸賞を取ります。mission 5 と違ってこれはムーンショットではありません——数学はすでに決着済みで、道筋も知られており、残っているのは本格的な証明エンジニアリングです。

このフラグを自分で設定する必要はありません——record では `score` を省略すれば検証器が計算します(記載した場合のみ、その値を照合します)。

## Witness フォーマット

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

- `witness.theorems` には solution が証明した固定定理の名前を書きます。これが本当の申告であり、「解けたか」フラグはここから導出されます。
- `witness.solution` は `Solution.lean` の全文です。
- `score` は任意で、導出されます——省略するか(上記のとおり)、記載する場合は申告した定理の最高スコアと一致していなければなりません。
- 標準の公理のみ。mathlib(固定バージョン)と補題の自作は自由です。

検証:`python3 verify.py <record.json>`

必要な環境:[elan](https://leanprover-community.github.io/get_started.html)。初回はネットワークが必要です(固定ツールチェーン、mathlib キャッシュ、comparator の一度きりのビルド。以後は `~/.cache/mission-land/` にキャッシュ)。

## 文献記録

定理そのもの:B. L. van der Waerden, *Beweis einer Baudetschen Vermutung*(1927)。他の証明支援系(Mizar、Isabelle など)には形式化があります。Lean/mathlib では明文化された TODO です。ここで最初に受理された Lean の形式証明が記録を打ち立てます。

## 既知の手法

- **ルート 1 — Hales–Jewett から導く(推奨)**:mathlib には `Combinatorics.Line.exists_mono_in_high_dimension` がすでにあります。アルファベット `Fin k` で実例化し、組合せ立方体 `(Fin k)^ι` を k 進数の桁を通して ℕ の区間に埋め込めば、各組合せ的直線がちょうど等差数列に写ります。`ι` の有限性から有限の上界が取り出せます。これは古典的な HJ ⇒ vdW の導出そのもので、mathlib の TODO も同じ方針を示唆しています。
- **ルート 2 — コンパクト性**:既存の無限版 `exists_mono_homothetic_copy`(ℕ 上、S = {0, …, k−1})から、コンパクト性/König の補題の議論で有限形式を導く。紙の上では綺麗ですが、Lean では手間がかかります。
- **ルート 3 — 直接証明**:ファン・デル・ヴェルデンの元々の二重帰納法(color-focusing)を形式化する。自己完結ですが、最も長くなります。
- k ≤ 2 と r ≤ 1 の場合はほぼ自明です。一般証明が退化パラメータを扱えることを確認してください(命題はそれらが成り立つように書かれています)。
