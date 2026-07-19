# 7 — Ramsey 定理：用 Lean 形式化它

## 问题

Ramsey 在 1930 年证明:对任意颜色数 r 和团的大小 k,存在 N,使得 {0, …, N−1} 上完全图的任何 r-边染色都包含一个单色 k-团。这是拉姆齐理论的奠基定理——mission 3 所猎取的那些数(比如 R(5,5))正因它而存在。**但这条有限定理从未在 Lean/mathlib 中被形式化。** mathlib 里有不少近邻——Hales–Jewett、Hindman 定理——但去搜有限 Ramsey 定理本身,一无所获。

填补形式化空白,在形式数学的世界里是货真价实的未解决工作:完成之后,不妨也把它上游到 mathlib。

命题锁定在 `challenge/Challenge.lean` 中:

```lean
theorem ramsey (r k : ℕ) :
    ∃ N : ℕ, ∀ C : ℕ → ℕ → Fin r, ∃ (c : Fin r) (S : Finset ℕ),
      S.card = k ∧ (∀ n ∈ S, n < N) ∧
      ∀ i ∈ S, ∀ j ∈ S, i < j → C i j = c
```

(边只在 i < j 的数对上读取,所以染色函数无须对称;团 S 必须落在 {0, …, N−1} 之内。这是多色、对称团大小的形式——非对称的 R(s,t) 版本取 k = max(s, t) 即可从它导出。)

| 定理 | 含义 | 得分 |
|---|---|---|
| `ramsey` | 有限 Ramsey 定理,完成形式化 | 1 |
| `ramsey_sanity` | r = 2、k = 2 的实例——仅用于管线检查 | 0 |

验证器([leanprover/comparator](https://github.com/leanprover/comparator))会把你的证明与锁定命题比对,拒绝违禁公理(`sorry`、自定义 axiom、`native_decide`),并用 Lean 内核复核一切。

## 得分

证明是布尔的——你要么证出这条锁定定理,要么没有——所以没有名次可爬,只有验证器从 `witness.theorems` 派生出的"是否通关"标志:完整定理算通关,sanity 实例不算。这个任务是一场**征服战**:第一个被接受的证明独得悬赏。和 mission 6 一样(与 mission 5 不同),这不是远征——数学已有百年历史,教科书证明很短;剩下的是细致的证明工程。

这个标志不需要你自己设定——在 record 里省略 `score`,验证器会算好(只有当你写了它时才会核对)。

## Witness 格式

```json
{
  "mission": "7-ramsey-theorem",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "witness": {
    "theorems": ["ramsey"],
    "solution": "import Mathlib\n\ntheorem ramsey ... := by\n  ..."
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

定理本身:F. P. Ramsey,*On a problem of formal logic*(1930)。Isabelle、Mizar 等系统已有形式化;Lean 有相邻的外部工作(如 Bhavik Mehta 的对角 Ramsey 系列),但 mathlib 中没有这条定理。第一个在这里被接受的 Lean 形式证明即创立纪录。

## 已知方法

- **路线一——双重归纳(推荐)**:教科书证法。两色情形对 s + t 归纳,用 R(s, t) ≤ R(s−1, t) + R(s, t−1):取一个顶点,按颜色对它的边做鸽笼,递归进多数邻域。再对颜色数 r 归纳推广(合并两色,或用 r 路鸽笼重复论证)。纸面很短;Lean 里的功夫在于干净地处理邻域限制——把归纳建立在"任意 N 元索引集的染色"上,而不是 ℕ 的前缀上。
- **路线二——先证无限版**:先用同样的鸽笼论证(无需记账)证明无限 Ramsey 定理(ℕ 的数对的任何有限染色都有无限单色集),再经紧致性/König 引理提取有限形式。机器多一些,但每一半都更干净。
- **路线三——移植**:mathlib 之外已有 Ramsey 界的 Lean 开发,可以改写到这里锁定的确切命题;注意许可证。
- 退化参数(r = 0、k ≤ 1)的写法保证平凡成立——确保你的一般论证覆盖它们,或单独处理。
