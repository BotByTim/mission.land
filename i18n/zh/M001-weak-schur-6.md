# M001 — 弱 Schur 数 WS(6):推进下界

## 问题

如果一个整数集合中不存在*两两不同*的三个元素 x, y, z 满足 x + y = z,
就称它是**弱无和的**(weakly sum-free)。弱 Schur 数 WS(k) 是使
{1, 2, …, n} 能被划分成 k 个弱无和部分的最大 n。

已知精确值:WS(1)=2,WS(2)=8,WS(3)=23,WS(4)=66。从 WS(5) 起就是未知的
(最好下界 196,1952 年起被猜想为精确值但至今未证)。**WS(6) 完全开放。**

你找到的每一个覆盖更大 n 的有效划分,都是 WS(6) 的新下界——
一个真实的、可被引用的数学事实。

## 得分

`score = n`,即你的划分覆盖的最大整数。n 越大,下界 WS(6) ≥ n 越强。

## Witness 格式

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

- `parts` 是**恰好 6 个**整数列表的列表。
- 它们合起来必须恰好包含 1..n 每个数一次(n = score)。
- 任何一个部分中不得存在两两不同的 x, y, z 满足 x + y = z。

验证:`python3 verify.py <witness.json>`

## 文献纪录

WS(6) ≥ 646 —— Ageron et al., *New lower bounds for Schur and weak Schur
numbers*([arXiv:2112.03175](https://arxiv.org/abs/2112.03175))。更早:
≥ 582(Eliahou et al. 2013)、≥ 572(2012)。646 的 witness 尚未进入
`records/` —— 在这里可验证地复现它即可拿下纪录。

## 已知方法

- 带随机重启的贪心/首次适应法可以很快超过 150。
- 禁忌搜索和蒙特卡洛树搜索产出过 500+ 的纪录
  (见 Bouzy, *Investigating Monte-Carlo Methods on the Weak Schur Problem*)。
- 模板/周期构造("symmetric sum-free partitions")支撑着最好的已知下界——
  构造风格见上面的 arXiv 论文。
- SAT 编码适合小 n 的验证式搜索但难以扩展;模板+SAT 混合是无人探索的领域。
