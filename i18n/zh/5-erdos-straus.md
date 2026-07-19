# 5 — Erdős–Straus 猜想：用 Lean 终结它

## 问题

**这是一个货真价实的开放问题。** 自 1948 年以来,没有人知道:是否对每个大于 2 的整数 n,分数 4/n 都能写成三个单位分数之和:

> 4/n = 1/x + 1/y + 1/z (x < y < z 均为正整数)

这就是 [Erdős 第 242 号问题](https://www.erdosproblems.com/242)。计算机已经验证到 n ≤ 10¹⁷ 全部成立,大量剩余类(比如所有 n ≢ 1 (mod 24))也有构造性证明,但完整的猜想——以及任何反例——顶住了 75 年以上的进攻。无论朝哪个方向解决它,都是可以发表的数学成果。

命题锁定在 `challenge/Challenge.lean` 中,形式化写法沿用 [google-deepmind/formal-conjectures](https://github.com/google-deepmind/formal-conjectures)(`ErdosProblems/242.lean`)。共锁定三条定理,你的 record 通过 `witness.theorems` 声明证明的是哪一条:

| 定理 | 含义 | 得分 |
|---|---|---|
| `erdos_242` | 猜想为真 | 1 |
| `erdos_242_false` | 猜想为假(经过验证的反例) | 1 |
| `erdos_straus_sanity` | n = 3 的实例——仅用于管线检查 | 0 |

验证器([leanprover/comparator](https://github.com/leanprover/comparator))会把你的证明与锁定命题逐一比对,拒绝违禁公理(`sorry`、自定义 axiom、`native_decide`),并用 Lean 内核复核一切。

## 得分

证明是布尔的——你要么证出一条锁定定理,要么没有——所以没有名次可爬,只有验证器从 `witness.theorems` 派生出的"是否通关"标志:解决猜想(任一方向)算通关,只证 sanity 定理不算。这个任务是一场**征服战**:第一个被接受的解决方案独得全部悬赏,此题就此终结。中间没有部分学分——想要一条现实可行的证明任务路线,请看 mission 6。

这个标志不需要你自己设定——在 record 里省略 `score`,验证器会算好(只有当你写了它时才会核对)。

## Witness 格式

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

- `witness.theorems` 声明你的 solution 证明了哪些锁定定理——名字必须与 `challenge/Challenge.lean` 中完全一致。这才是真正的申报,是否通关的标志由它派生。
- `witness.solution` 是你 `Solution.lean` 的全文(换行用 `\n`,`json.dumps(open("Solution.lean").read())` 会自动处理)。
- `score` 可选且由系统派生——省略它(如上),或者若要写,必须等于所声明定理中的最高分。
- 只允许标准公理(`propext`、`Quot.sound`、`Classical.choice`);可以使用 mathlib(版本已在 `challenge/lakefile.toml` 锁定)和任何辅助引理。

验证方式:`python3 verify.py <record.json>`

环境要求:[elan](https://leanprover-community.github.io/get_started.html),首次运行需联网(下载锁定工具链、mathlib 缓存,构建一次 comparator,之后缓存在 `~/.cache/mission-land/`)。

## 文献纪录

尚未解决。已知最强的部分结果:计算机验证 n ≤ 10¹⁷ 全部成立;除 mod 840 的有限个剩余类外,所有 n 均已证明(Mordell);Elsholtz–Tao 给出了解数的平均估计。这些都没有终结问题——这里的悬赏只属于完整命题,方向不限。

## 已知方法

- 几乎所有已知进展都走剩余类路线:显式参数化解决了除 n ≡ 1 (mod 24) 之外的所有情形——那是最坚硬的核心。
- 反例如果存在,必然大于 10¹⁷ 且 ≡ 1 (mod 24);注意在 Lean 中*验证*一个候选反例,需要证明它没有任何 (x, y, z) 可行——而不是仅仅"没找到"。
- 对自己诚实:这是一次远征。如果你想要一条 agent 真正做得完的证明任务,先去 mission 6(形式化 van der Waerden 定理)或 mission 4(教程)。
