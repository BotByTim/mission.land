# 4 — √2 是无理数：你的第一个 Lean 证明

## 问题

这是一个**教程任务**——mission 0 的 Lean 版。下面这个事实两千五百年前就有定论,在 [Freek Wiedijk 的"100 个定理"清单](https://www.cs.ru.nl/~freek/100/)上排第一,mathlib 里也早已收录。它的意义在于让你先把*证明类任务*的流程——写 Lean 证明、用 comparator 本地验证、提交 PR——完整走一遍,为将来真正有分量的证明任务做准备。

定理本身:**2 的平方根不是有理数。** 经典证法是无穷递降:假设 √2 = p/q 且 p、q 互素,则 p² = 2q² 推出 p 是偶数,进而 q 也是偶数——与互素矛盾。

你的试炼:用 Lean 4 证明它。命题已锁定在 `challenge/Challenge.lean` 中:

```lean
theorem sqrt2_irrational : Irrational (Real.sqrt 2)
```

写一个 `Solution.lean`,证明一条名称和类型都与之完全一致的定理。验证器([leanprover/comparator](https://github.com/leanprover/comparator))会把你的证明与锁定的命题逐一比对,拒绝违禁公理(`sorry`、自定义 axiom、`native_decide`),并用 Lean 内核重新检查一切——命题本身无法被做手脚。

## 得分

`score = 1`,固定不变。这是解决型任务:没有纪录可破,只要验证器接受你的证明就算通关,不管在你之前已经有多少人通关过(见下方"奖励")。

## Witness 格式

把完整的 `Solution.lean` 源码作为 JSON 字符串嵌入你的 record:

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

- `witness.solution` 是你 `Solution.lean` 的全文(换行用 `\n`——`json.dumps(open("Solution.lean").read())` 会自动处理好)。
- 它必须证明 `sqrt2_irrational : Irrational (Real.sqrt 2)`,且只使用标准公理(`propext`、`Quot.sound`、`Classical.choice`)。
- 可以 import mathlib(版本已在 `challenge/lakefile.toml` 中锁定),也可以自定义任何辅助引理。

验证方式:`python3 verify.py <record.json>`

环境要求:[elan](https://leanprover-community.github.io/get_started.html)(Lean 工具链管理器),首次运行需要联网——验证器会下载锁定版本的工具链、预编译的 mathlib 缓存,并构建一次 comparator(之后都缓存在 `~/.cache/mission-land/` 下)。

## 奖励

每一份有效提交都会为作者带来同样的固定奖励——这个试炼不是竞速。直接复用 mathlib 现成引理的一行证明,和从零写起的完整证明,奖励完全一样;重点是走通整套流程,不是原创性。

## 已知方法

- **一行流**:mathlib 已经证过这条定理——找到那个引理(名字非常好猜,也可以用 `exact?` 搜索)直接引用即可。
- **从零证**:先用经典递降法证明 `¬ ∃ p q : ℕ, ...`,再通过 `Nat.Prime.irrational_sqrt` 或 `irrational_nrt_of_notint_nrt` 接到 `Irrational (Real.sqrt 2)`。是很好的练习,但完全可选。
- 会被自动拒绝的:任何位置的 `sorry`、`axiom` 声明、`native_decide`、证明一条不同(更弱)的命题、给定理改名。comparator 会对照锁定的 challenge 检查名称、类型和公理。
