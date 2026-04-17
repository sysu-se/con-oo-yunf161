# con-oo-yunf161 - Review

## Review 结论

这份代码已经把 Game/Sudoku 接进了部分 Svelte 流程，开始新局、渲染、输入、Undo/Redo 基本都能沿着 store 入口走通；但从作业要求看，提交的 src/domain 入口本身并没有成为真实 UI 的消费边界，而且 Sudoku 对初始 givens 的建模存在关键错误，直接破坏了数独业务规则。整体上属于“有领域对象雏形，也有一定 Svelte 接入，但设计边界和业务正确性都还不稳”的状态。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | fair |

## 缺点

### 1. src/domain 入口没有真正接入 Svelte 真实流程

- 严重程度：core
- 位置：src/domain/index.js:1-25; src/components/Board/index.svelte:3-4; src/components/Header/Dropdown.svelte:2; src/components/Controls/Keyboard.svelte:2
- 原因：静态搜索下，Svelte 层并没有消费 src/domain/index.js 导出的工厂或类；真实界面走的是 @sudoku/gamestore 和 @sudoku/game。这样提交的 src/domain 更像死代码/旁路代码，而不是作业要求中的“真实 view 消费边界”。

### 2. 初始 givens 被错误重置，导致固定数字可被修改

- 严重程度：core
- 位置：src/node_modules/@sudoku/sudoku_pack.js:14-23
- 原因：构造函数先把传入 grid 复制到 #initGrid，随后又无条件把 #initGrid 重置为全 0。guess() 依赖 #initGrid[row][col] === 0 判断是否可编辑，因此所有格子都会被当成可编辑格。这样会直接破坏数独业务中“题面 givens 不可改”的核心规则，也会让序列化/历史中的初始盘面语义失真。

### 3. store 通过原地 mutate 同一个 Game 实例驱动刷新，响应式策略过于隐式

- 严重程度：major
- 位置：src/node_modules/@sudoku/gamestore.js:46-75
- 原因：set/undo/redo 都是在 update() 里原地修改同一个 Game 对象再返回原引用，没有显式快照或明确的领域事件/订阅机制。当前之所以还能推断出界面会刷新，本质上依赖的是 Svelte writable 对对象值的脏检查语义，而不是一个清晰、可迁移的领域到视图适配设计。

### 4. 笔记模式错误地写入 Sudoku 正式状态

- 严重程度：major
- 位置：src/components/Controls/Keyboard.svelte:10-25
- 原因：在 notes 模式下，代码在更新 candidates 后仍然调用 gameStore.set($cursor, 0)。候选数本应是独立的 UI/辅助状态，不应改动 Sudoku 盘面，更不应制造一条 Undo 历史；如果当前格已有用户输入，这里还会直接把它擦掉。

### 5. View 层穿透 Game 内部结构，适配层过薄

- 严重程度：major
- 位置：src/components/Board/index.svelte:27-30; src/components/Board/index.svelte:41-55; src/components/Controls/ActionBar/Actions.svelte:12-18
- 原因：组件频繁直接访问 $gameStore.getSudoku().getGrid()，并在视图层自行计算当前值、same number、undo/redo 可用性。这样 UI 知道了 Game 内部如何持有 Sudoku，而不是消费一个稳定的 view-model/state projection，封装边界偏弱，不是很好的 OOD。

### 6. Hint 流程没有严格约束目标格是否合法

- 严重程度：major
- 位置：src/node_modules/@sudoku/gamestore.js:53-65; src/components/Controls/ActionBar/Actions.svelte:11-18
- 原因：canHint 只检查“选中了格子且不是 null”，没有要求该格为空、可编辑；applyHint() 还会先消耗 hint 次数，再去求解和写值。按静态阅读，这会允许对非空格浪费 hint，也没有把“提示只能作用于待填格”建模成明确的业务规则。

### 7. 顶层订阅缺少生命周期回收

- 严重程度：minor
- 位置：src/App.svelte:12-17
- 原因：gameWon.subscribe(...) 写在组件脚本顶层，未在 onDestroy 中清理。对根组件来说风险不一定立刻暴露，但这不是 Svelte 中最稳妥的订阅写法，也让订阅所有权不够清晰。

## 优点

### 1. Undo/Redo 责任基本集中在 Game

- 位置：src/node_modules/@sudoku/Game_pack.js:23-64
- 原因：历史记录、当前指针、undo()/redo()/canUndo()/canRedo() 都收敛在 Game 内部，saveHistory() 也会在分叉后截断未来历史，这个职责边界方向是对的。

### 2. Sudoku 提供了防御性读取与外表化接口

- 位置：src/node_modules/@sudoku/sudoku_pack.js:35-65
- 原因：getGrid() 返回深拷贝，toJSON()/toString() 也提供了外表化能力，至少避免了外部直接拿到内部二维数组后随手改写。

### 3. 开始新局的 Svelte 流程有统一编排入口

- 位置：src/node_modules/@sudoku/gamestore.js:20-31; src/node_modules/@sudoku/game.js:13-47
- 原因：startNew/startCustom/startCreatorMode 不只创建 Game，也顺带重置 cursor、timer、hints，让“开始一局游戏”作为一个完整流程被统一封装，而不是散落在组件里。

### 4. 主界面的关键操作已经通过 store 命令进入领域层

- 位置：src/components/Board/index.svelte:41-55; src/components/Controls/ActionBar/Actions.svelte:20-39
- 原因：棋盘渲染来自 $gameStore，Undo/Redo/Hint 按钮调用的也是 gameStore 的方法，至少主要交互没有继续直接修改组件内局部数组。

## 补充说明

- 本次结论基于静态审查，没有运行测试，也没有在浏览器里实际操作验证。
- 由于 src/domain/index.js 只是对 @sudoku/Game_pack.js 和 @sudoku/sudoku_pack.js 的 re-export/工厂包装，关于领域模型本身的 OOP/OOD 判断实际追溯到了这两个被导出的实现。
- “src/domain 未接入真实 Svelte 流程”的结论来自对 src 目录的静态搜索：未发现组件或页面代码导入 src/domain/index.js。
- “界面会不会刷新”的判断同样基于静态阅读和 Svelte 3 store 语义推断，不是基于实际运行结果。
