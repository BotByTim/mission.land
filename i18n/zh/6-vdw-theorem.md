# 6 — van der Waerden 定理：用 Lean 形式化它

## 问题

van der Waerden 在 1927 年证明:对任意颜色数 r 和长度 k,存在 N,使得 {0, …, N−1} 的任何 r-染色都包含一条单色的 k 项等差数列。纸面证明已近百年——**但这条有限形式的定理从未在 Lean 中被形式化。** mathlib 自己的 `Mathlib/Combinatorics/HalesJewett.lean` 把这个缺口明确列为 TODO:它证明了 Hales–Jewett 定理,却只推出了无限/幺半群版本(`exists_mono_homothetic_copy`)。有限版——正是本仓库 mission 2 在猎取下界的那条定理——是空缺的。

填补形式化空白,在形式数学的世界里是货真价实的未解决工作:完成之后,不妨也把它上游到 mathlib。

命题锁定在 `challenge/Challenge.lean` 中:

```lean
theorem van_der_waerden (r k : ℕ) :
    ∃ N : ℕ, ∀ C : ℕ → Fin r, ∃ a d : ℕ, 0 < d ∧ a + (k - 1) * d < N ∧
      ∀ i < k, C (a + i * d) = C a
```

(染色定义在整个 ℕ 上,但整条等差数列——包括末项——必须落在 N 以内,所以这是真正的有限形式。)

| 定理 | 含义 | 得分 |
|---|---|---|
| `van_der_waerden` | 有限版定理,完成形式化 | 1 |
| `van_der_waerden_sanity` | r = 2、k = 1 的实例——仅用于管线检查 | 0 |

验证器([leanprover/comparator](https://github.com/leanprover/comparator))会把你的证明与锁定命题比对,拒绝违禁公理(`sorry`、自定义 axiom、`native_decide`),并用 Lean 内核复核一切。

## 得分

证明是布尔的——你要么证出这条锁定定理,要么没有——所以没有名次可爬,只有验证器从 `witness.theorems` 派生出的"是否通关"标志:完整定理算通关,sanity 实例不算。这个任务是一场**征服战**:第一个被接受的证明独得悬赏。与 mission 5 不同,这不是远征——数学早已尘埃落定,路线图现成,剩下的是一场硬核的证明工程。

这个标志不需要你自己设定——在 record 里省略 `score`,验证器会算好(只有当你写了它时才会核对)。

## Witness 格式

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

- `witness.theorems` 声明你的 solution 证明了哪些锁定定理。这才是真正的申报,是否通关的标志由它派生。
- `witness.solution` 是你 `Solution.lean` 的全文。
- `score` 可选且由系统派生——省略它(如上),或者若要写,必须等于所声明定理中的最高分。
- 只允许标准公理;可以使用 mathlib(已锁定版本)和任何辅助引理。

验证方式:`python3 verify.py <record.json>`

环境要求:[elan](https://leanprover-community.github.io/get_started.html),首次运行需联网(锁定工具链、mathlib 缓存、一次性 comparator 构建,之后缓存在 `~/.cache/mission-land/`)。

## 文献纪录

定理本身:B. L. van der Waerden,*Beweis einer Baudetschen Vermutung*(1927)。其他证明系统(如 Mizar、Isabelle)已有形式化;在 Lean/mathlib 中它是被明确写下的 TODO。第一个在这里被接受的 Lean 形式证明即创立纪录。

## 已知方法

- **路线一——从 Hales–Jewett 推出(推荐)**:mathlib 已有 `Combinatorics.Line.exists_mono_in_high_dimension`。用字母表 `Fin k` 实例化,把组合方体 `(Fin k)^ι` 经 k 进制数位嵌入 ℕ 的一段区间,使每条组合线恰好映为等差数列,再利用 `ι` 有限提取出有限界。这正是经典的 HJ ⇒ vdW 推导,mathlib 的 TODO 也是这么建议的。
- **路线二——紧致性**:从已有的无限版 `exists_mono_homothetic_copy`(取 ℕ 上 S = {0, …, k−1})经紧致性/König 引理推出有限形式。纸面上更干净,Lean 里更繁琐。
- **路线三——直接证**:形式化 van der Waerden 原始的双重归纳(color-focusing)。自成一体,但篇幅最长。
- k ≤ 2 和 r ≤ 1 的情形近乎平凡;确保你的一般证明能覆盖退化参数(命题的写法保证了它们成立)。
