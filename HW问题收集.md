## HW 问题收集

列举在HW 1、HW1.1过程里，你所遇到的2\~3个通过自己学习已经解决的问题，和2\~3个尚未解决的问题与挑战

### 已解决

1. 啥是”标量derived store“ 有啥作用？
   1. **上下文**：Coding Agent 说：”UI 的棋盘、输入、Undo/Redo、胜利判断、分享编码全部直接读取领域对象公开接口；允许保留少量标量 derived store，但不再生成板级 view model。“ 
   2. **解决手段**：直接询问CA + 查看网页资料
2. writable是什么东西，有什么作用 ?
   1. **上下文**：AI回答：writable 是 Svelte 框架中的一个响应式状态管理工具，属于 Svelte 的 store（存储）类型之一。作用如下：创建可读可写的响应式数据（store），用于在组件之间共享和管理状态。通过 writable 创建的 store，可以在多个组件中订阅（subscribe）和更新（set、update）其值，实现数据的集中管理和响应式更新。常用于全局状态、跨组件通信、简单的全局数据管理等场景。然后我在hw1的实现中写了几个writable
   2. **解决手段**：询问ai加通过实例实践理解
3.如何让ui能监听grid的实时变换，这层响应机制是什么
   1. **上下文**：AI回答：Svelte 框架中，通过使用 writable store 可以实现组件之间的数据共享和响应式更新。在 grid 组件中，可以通过订阅 writable store 来监听数据变化，从而实现实时更新。返回subscribe函数，用set或者uptdate更新，注意是检测赋值时的更新
   2. **解决手段**：询问ai加通过实例实践理解，在gamestore.js中实现响应式更新的代码，建立了适配层，并更新了相应的ui组件代码
### 未解决

1. 这个sameArea有啥用啊？

   1. **上下文**：`src/components/Board/index.svelte`

      ```javascript
      sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
      ```

   2. **尝试解决手段**：问CA未果

2. 领域层和 UI 层的解耦最佳实践？

   1. **上下文**：目前 UI 直接访问领域对象内部，封装性差。
   2. **尝试解决手段**：查阅 OOD 资料，尚未找到适合本项目的具体方案，询问ai，给出的结果过于复杂，未找到合适的解耦方案。

3.import { fade } from 'svelte/transition';这行没有被使用，是用来干什么的的
   1. **上下文**：<script>
	import Candidates from './Candidates.svelte';
	import { fade } from 'svelte/transition';
	import { SUDOKU_SIZE } from '@sudoku/constants';
	import { cursor } from '@sudoku/stores/cursor';

	export let value;
	export let cellX;
	export let cellY;
	export let candidates;

	export let disabled;
	export let conflictingNumber;
   2. **解决手段**：询问ai，行代码是导入 Svelte 内置的“淡入淡出”过渡动画函数，但是没有给出具体的使用场景，未找到合适的解耦方案。