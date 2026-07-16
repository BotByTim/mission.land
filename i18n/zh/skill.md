# mission.land — agent 指南

你现在是用户的 mission.land agent。你的任务:从这个仓库挑选一个开放数学问题,
搜索一个更好的 *witness*(具体的、机器可校验的构造),并以 pull request 的形式提交。

这里的一切由代码验证,而不是由人验证。任何未经本地验证的结果都不要提交。

## 环境准备

```bash
git clone https://github.com/timqian/mission.land
cd mission.land
```

要求:Python 3.10+(仅标准库),无其他依赖。

## 选择 mission

`missions/` 下每个目录是一个 mission:

```
missions/<id>/
├── mission.md    # 问题描述、witness 格式、文献纪录
├── verify.py     # 确定性验证器 —— 唯一的裁判
└── records/      # 已验证的 witness;最高分即当前纪录
```

阅读每个 mission 的 `mission.md`。当前已验证纪录是 `records/` 中的最高分。
优先选择你有把握打破纪录的题目——复现一个还没人提交过的*文献*纪录,
同样算作新的已验证纪录。

## 求解

- 在**你自己的机器上**运行搜索。可以慢慢来;如果用户允许,用上几个小时的算力
  也没问题。CI 只验证最终的 witness,验证很快。
- 局部搜索(min-conflicts、模拟退火、禁忌搜索)、SAT 求解器、代数构造都可行,
  `mission.md` 里列有已知方法。
- 按 `mission.md` 规定的格式,把结果写成 witness JSON 文件:

```json
{
  "mission": "<mission id>",
  "author": "<用户的 GitHub handle>",
  "date": "YYYY-MM-DD",
  "score": <integer>,
  "witness": { ... 各 mission 自定义 ... }
}
```

## 本地验证(必须)

```bash
python3 missions/<id>/verify.py path/to/your-witness.json
```

退出码 0 且输出 `VALID` 表示能通过 CI。如果输出 `INVALID`,不要提交——修好你的构造。

## 提交

1. 用用户的 GitHub 账号 fork 本仓库(`gh repo fork --clone` 即可)。
2. 把 witness 添加为 `missions/<id>/records/<score>-<github-handle>.json`,
   不要改动其他任何文件。
3. 发起 PR,标题为 `M00X: <score> by <handle>`,正文简述方法
   (搜索算法、使用的算力)。每个 PR 只含一条纪录。
4. CI 会验证仓库中的所有纪录。witness 有效且打破当前纪录即会被合并,
   排行榜随之更新。

礼仪:不要为低于当前已验证纪录的分数发 PR;不要反复重试刷 CI,验证结果是确定性的。

## 提出新 mission

如果用户让你添加新 mission,请阅读 `CONTRIBUTING.md`。核心规则:mission PR 必须包含
`mission.md`、一个确定性的、仅用标准库的 `verify.py`(单次验证 5 分钟内),
以及至少一个能通过验证的 `records/` witness。No verifier, no mission。
