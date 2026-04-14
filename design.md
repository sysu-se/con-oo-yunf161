### 任务 1：改进 Homework 1 中的领域对象
    根据codex的反馈进行了对象的完全重构
    1.调整 `Sudoku` 与 `Game` 的职责边界
        `Sudoku` 负责游戏逻辑，包括持有当前用户数独版面，持有当前初始游戏版面，保留校验输入是否合法（用于避免不合法输入），以及当前数独版面是否解决的功能
        `Game` 负责游戏流程，包括持有Suduku对象、撤销操作、重做操作（保留和恢复操作历史），以及序列化和反序列化游戏状态的功能，与difficulty等无关状态完成彻底切割
    2.完全杜绝通过暴露内部结构来组装对象，破坏封装的行为
         所有对象的属性进行必要的私有化，都必须通过对象的方法来访问，不能直接操作对象的属性，而是通过提供的接口来操作对象的状态
    3.增加对输入的校验逻辑，对数独盘面和json字符串进行校验，确保输入的合法性
    4.解决类对外部方法的依赖问题，将依赖的外部方法封装到对象的方法中，避免直接调用外部方法，比如合法性校验
    5.将ui操作与domain对象分离，ui操作只负责渲染和响应用户输入，domain对象只负责游戏逻辑和数据存储
### 任务 2：将领域对象接入真实 Svelte 游戏流程
    1.Store Adapter方法，建立一个面向 Svelte 的适配层，在gamestore.js中，创建一个gameStore，用于持有Game对象并暴露可被 Svelte 消费的响应式状态以及暴露 UI 可调用的方法，
    其中subscribe方法：让Svelte自动订阅游戏状态变化，当游戏状态发生变化时，调用订阅函数,符合  Svelte store 的基本约定，Svelte 允许你在组件里写 $storeName来获取持有的Game对象；余下的方法包括开始游戏的几种方式，填写数独盘面，撤销操作，重做操作，采用提示等
    2.在game.js中，调用gameStore，真正开始游戏，暂停和恢复游戏，这样设计是因为整个游戏并不止这一个适配，像note，difficulty等其他ui状态也需要被初始化和订阅，这样可以在清晰划分职责的前提下提供统一的开始，暂停接口
    3.在gameStore中的部分接口会修改内部的Game对象，比如applyhint，set等方法，需要在gameStore中进行响应式更新，确保Svelte组件能够及时更新，都采用update（一定要有返回值game）方法更新，不能直接修改内部字段，Svelte组件识别更新是按“变量本身是否重新赋值”来追踪的，不是按“对象内部字段被改了”来追踪的，真正驱动 UI 更新的不是组件手动刷新，而是“领域对象变化 -> store 更新 -> Svelte 重新渲染”这条链路
    4.修改ui层使新的封装接入ui流程，真正通过领域对象完成游戏界面中的主要流程，包括开始一局游戏，界面渲染当前局面，用户输入，撤销/重做，以及界面自动更新等流程
    5.为什么这种写法在 Svelte 中有效
        这套写法在 Svelte 中有效，是因为它遵循了 Svelte 3 的响应式边界。Svelte 不会自动深度追踪对象内部任意字段变化，但它能够可靠响应两类变化：一类是顶层变量重新赋值，另一类是 store 的订阅更新。我的方案利用的是第二种机制。gameStore 作为适配层，把领域对象内部的状态变化包装成对 store 的 set/update 调用，因此 Svelte 能明确感知到更新。组件层使用 $gameStore 读取状态，使用 on:click、键盘事件等调用 gameStore 方法，这正是 Svelte 推荐的“store + 组件消费”模式。相比直接在组件里修改二维数组元素或直接 mutate 对象内部字段，这种方案更稳定，因为它把领域对象的复杂变化统一收敛到了一个明确的响应式出口，从而保证 UI 能按预期刷新。


下面是针对作业要求的说明
        1. View 层直接消费的是什么？
            View 层直接消费的不是 Game 或 Sudoku 类本身，而是一个基于 Svelte store 的适配层 gameStore。
            Game 和 Sudoku 仍然是核心领域对象，但组件不直接 new 它们，也不直接维护它们的生命周期。组件通过 $gameStore 读取当前游戏状态，通过 gameStore.set(...)、gameStore.undo()、gameStore.redo()、gameStore.applyHint() 等方法发起操作。因此，View 层直接消费的是 store / adapter，而不是裸领域对象。

        2. View 层拿到的数据是什么？
            View 层拿到的是由 gameStore 暴露出来、可被 Svelte 响应式消费的当前游戏状态。最核心的是当前棋盘数据，也就是通过 $gameStore.getSudoku().getGrid() 读到的 grid。除此之外，界面还会消费其他配套状态，例如 gameWon、gamePaused、cursor、keyboardDisabled、hints、notes、candidates、difficulty、timer 等。
            也就是说，View 层并不是直接持有旧二维数组，而是从 adapter 和相关 store 中读取“当前应该渲染什么”。

        3. 用户操作如何进入领域对象？
            用户操作先进入 Svelte 组件，再从组件进入 gameStore，最后由 gameStore 调用领域对象。
            例如：
            用户点击数字按钮时，组件调用 gameStore.set($cursor, num)；
            gameStore.set(...) 内部会调用当前 Game 实例的 guess(...)；
            Game.guess(...) 再调用 Sudoku.guess(...) 真正修改盘面。
            Undo / Redo 的链路也是一样：
            用户点击撤销或重做按钮；
            组件调用 gameStore.undo() 或 gameStore.redo()；
            gameStore 内部调用 Game.undo() / Game.redo()，由领域层恢复历史状态。
            所以，用户通过暴露的接口操作gameStore，再由gameStore操作内部对象，组件只负责转发用户事件，不负责自己实现 guess、undo、redo 的业务逻辑。

        4. 领域对象变化后，Svelte 为什么会更新？
            上面已经解释过了，这里就不重复了。


