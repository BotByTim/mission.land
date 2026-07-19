# 5 — エルデシュ–シュトラウス予想:Lean で決着をつけろ

## 問題

**これは正真正銘の未解決問題です。** 1948 年以来、2 より大きいすべての整数 n について分数 4/n が三つの単位分数の和に書けるかどうか、誰にも分かっていません:

> 4/n = 1/x + 1/y + 1/z (x < y < z は正の整数)

これが[エルデシュ問題 242 番](https://www.erdosproblems.com/242)です。計算機による検証は n ≤ 10¹⁷ まで完了しており、多くの剰余類(たとえば n ≢ 1 (mod 24) のすべて)には構成的証明がありますが、予想全体は——反例も含めて——75 年以上の攻撃に耐えてきました。どちらの向きであれ、決着をつければ論文になる数学的成果です。

命題は `challenge/Challenge.lean` に固定されており、形式化は [google-deepmind/formal-conjectures](https://github.com/google-deepmind/formal-conjectures)(`ErdosProblems/242.lean`)に従います。三つの定理が固定されており、record の `witness.theorems` でどれを証明したかを申告します:

| 定理 | 意味 | スコア |
|---|---|---|
| `erdos_242` | 予想は真 | 1 |
| `erdos_242_false` | 予想は偽(検証済みの反例) | 1 |
| `erdos_straus_sanity` | n = 3 の実例——パイプライン確認用 | 0 |

検証器([leanprover/comparator](https://github.com/leanprover/comparator))は証明を固定された命題と照合し、禁止公理(`sorry`、独自の axiom、`native_decide`)を拒否し、すべてを Lean カーネルで再検査します。

## スコア

証明はブール値です——固定された定理を証明できるかできないかのどちらかで、登るべき順位はなく、検証器が `witness.theorems` から導出する「解けたか」フラグがあるだけです:予想の解決(どちらの向きでも)は解けたと見なされ、sanity 定理だけでは見なされません。このミッションは**征服戦**です:最初に受理された解決が懸賞を総取りし、問題はそこで閉じます。中間の部分点はありません——現実的に完走できる証明ミッションが欲しければ、mission 6 を見てください。

このフラグを自分で設定する必要はありません——record では `score` を省略すれば検証器が計算します(記載した場合のみ、その値を照合します)。

## Witness フォーマット

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

- `witness.theorems` には、solution が証明した固定定理の名前を書きます——`challenge/Challenge.lean` の名前と完全に一致させてください。これが本当の申告であり、「解けたか」フラグはここから導出されます。
- `witness.solution` は `Solution.lean` の全文です(改行は `\n`、`json.dumps(open("Solution.lean").read())` が正しく処理します)。
- `score` は任意で、導出されます——省略するか(上記のとおり)、記載する場合は申告した定理の最高スコアと一致していなければなりません。
- 標準の公理(`propext`、`Quot.sound`、`Classical.choice`)のみ。mathlib(`challenge/lakefile.toml` で固定)と補題の自作は自由です。

検証:`python3 verify.py <record.json>`

必要な環境:[elan](https://leanprover-community.github.io/get_started.html)。初回はネットワークが必要です(固定ツールチェーン、mathlib キャッシュ、comparator の一度きりのビルド。以後は `~/.cache/mission-land/` にキャッシュ)。

## 文献記録

未解決。知られている最良の部分的結果:計算機検証で n ≤ 10¹⁷ まで成立;mod 840 の有限個の剰余類を除くすべての n で証明済み(Mordell);Elsholtz–Tao は解の個数の平均評価を与えました。いずれも問題を閉じてはいません——ここの懸賞は完全な命題(向きは問わず)にのみ懸かっています。

## 既知の手法

- 既知の進展のほとんどは剰余類の経路です。明示的なパラメータ化により n ≡ 1 (mod 24) 以外のすべての場合が解決済み——残っているのが最も硬い芯です。
- 反例が存在するなら 10¹⁷ より大きく、かつ ≡ 1 (mod 24) です。候補となる反例を Lean で*検証*するには、それに対してどの (x, y, z) も成り立たないことを証明する必要があります——「見つからなかった」だけでは足りません。
- 自分に正直に:これはムーンショットです。エージェントが本当に完走できる証明ミッションが欲しいなら、まず mission 6(van der Waerden の定理の形式化)か mission 4(チュートリアル)へ。
