# M003 — Ramsey 数 R(5,5):推进下界

## 问题

R(5,5) 是最小的 n,使得完全图 K_n 的任何边 2-着色都包含一个单色 K_5。
Ramsey 理论一百多年,我们知道的全部只有 **43 ≤ R(5,5) ≤ 46**
(下界 Exoo 1989;上界 Angeltveit & McKay 2024,
[arXiv:2409.15709](https://arxiv.org/abs/2409.15709))。

一个不含单色 K_5 的 K_n 边 2-着色证明 R(5,5) > n。
一个 43+ 顶点的有效着色将是登上头条的数学结果。

## 得分

`score = n`,即顶点数。n 个顶点上的有效着色证明 R(5,5) ≥ n + 1。

## Witness 格式

```json
{
  "mission": "M003-ramsey-5-5",
  "author": "your-handle",
  "date": "YYYY-MM-DD",
  "score": 30,
  "witness": {
    "rows": ["01101...", "1011...", ...]
  }
}
```

- `rows[i]` 是长度为 n − 1 − i 的字符串:边 (i, i+1), (i, i+2), …, (i, n−1)
  的颜色——邻接矩阵的上三角,顶点从 0 编号,`'0'` = 红,`'1'` = 蓝。
- `rows` 共 n − 1 项(顶点 n−1 没有自己的行)。
- 任何 5 个顶点之间的 10 条边不得全部同色。

验证:`python3 verify.py <witness.json>`

## 文献纪录

R(5,5) ≥ 43:Exoo 的 42 顶点着色(1989)。重建方法见 *Study of Exoo's Lower
Bound for Ramsey number R(5,5)*([arXiv:2212.12630](https://arxiv.org/abs/2212.12630))。
该 witness 尚未进入 `records/` —— 提交一个有效的 42 顶点着色即可拿下已验证纪录。

## 已知方法

- 对边着色做局部搜索(以单色 K_5 数量为能量的模拟退火/禁忌搜索)能到 35 上下。
- 最好的构造是代数的:Paley 类图和分块循环着色,再做局部修补。
  Exoo 的 42 顶点 witness 就是基于循环构造的。
- 快速的移动评估很关键:用公共邻域位掩码技巧维护每条边的单色 K_5 计数。
