---
sidebar: auto
---
# 浏览器工作原理与实践

本文是对李兵老师的《浏览器工作原理与实践》课程的记录与整理。

课程地址：[浏览器工作原理与实践](https://time.geekbang.org/column/intro/100033601)

## 一、 宏观视角下的浏览器

### 1. Chrome 多进程架构

chrome 基于 Chromium 开发

#### 线程 VS 进程

- 线程是不能单独存在的，它是由进程来启动和管理的。
- 一个进程就是一个程序的运行实例。启动程序时，操作环境创建内存，这样的运行环境叫进程。
- 线程依附进程，进程中使用多线程并行处理能提升运算小效率
- 四个特点
  1. 进程中任意线程执行出错，都会导致整个进程崩溃
  2. 线程之间共享进程中的数据
  3. 当一个进程关闭之后，操作系统会回收进程所占用的内存
  4. 进程之间的内容相互隔离。可以使用 `IPC` 通信（`IPC`负责进程间通信）

#### 单进程浏览器时代

单进程：**单进程浏览器是指浏览器的所有功能模块都是运行在同一个进程里**

- 架构
  页面进程（包含页面渲染，JavaScript 环境，插件）
- 特点
  - 不稳定
  - 不流畅
  - 不安全：例如页面脚本可以通过浏览器漏洞获取系统权限

#### 多进程浏览器时代

- 1.早期架构（通过 IPC）

  <img src="https://ddcdn.jd.com/ddimg/jfs/t1/115529/1/14791/288264/5f338bf6Eceab4e78/562d4e93c0caebc0.png" alt="早期Chrome进程架构图" style="zoom:80%;" />

  - 浏览器主进程（下载资源，管理 IPC，显示渲染进程生成的图片）
  - 插件进程
  - 渲染进程（解析，渲染，JavaScript 执行，合成网页图片），运行沙箱中不能读写硬盘数据，不能获取操作系统权限
  - 如何解决问题
    - 进程隔离->解决不稳定
    - JavaScript 只阻塞当前渲染进程
    - 安全沙箱 ->解决不安全

- 当前正在使用的多线程架构

  <img src="https://ddcdn.jd.com/ddimg/jfs/t1/144207/32/5301/129311/5f338c4fE6d4ea2a7/902a6dbaf1ae37a1.png" alt="最新Chrome架构" style="zoom:80%;" />

  - 浏览器主进程：界面显示. 用户交互. 子进程管理. 存储
  - 网络进程
  - 网络资源加载
  - GPU 进程
  - 渲染进程
    - 排版引擎 Blink
    - JavaScript 引擎 V8
  - 插件进程

- 未来面向服务架构
  ![未来架构](https://ddcdn.jd.com/ddimg/jfs/t1/137975/33/5926/136514/5f3e2c3cEc677441e/620fb6e611d73541.png)
  - 渲染进程
  - 插件继承
  - 浏览器主进程
  - chrome 基础服务
  - UI 进程
  - 文件进程
  - GPU 进程
  - 设备进程
  - 网络进程
  - Video 进程等等。。

#### 补充

- 页面崩溃的原因
  - 单进程（卡死）
  - 多进程
    - 同一站点任意卡死，整个崩溃
- chrome 进程管理器
  - iframe 是单独进程
  - 同一站点是公用渲染进程

### 2. 协议

在衡量 Web 页面性能的时候有一个重要的指标叫“**FP（First Paint）**”，是**指从页面加载到首次开始绘制的时长**。

![简化传输模型](https://ddcdn.jd.com/ddimg/jfs/t1/135287/24/6917/130881/5f338d7bEfb9908e2/9344e72b071a1317.png)

#### 1. IP：将数据包送达目的主机（网络层）

- 数据包在互联网上传输。要符合网际协议（Internet Protocol 简称 IP）
- 计算机地址称为 IP 协议，访问任何网站实际上是你的计算机向另外一台计算机请求
- 网络层：数据包+IP 头，负责把数据包送达目的主机

#### 2. UDP：将数据包送达应用程序（传输层）

- 将数据包交给具体程序，用户数据包协议（UserDAtagram Protocol 简称 UDP）
- UDP 最重要的端口号，UDP 通过端口号将数据包分发给正确的程序
- 传输层：数据包+UDP 头
- 会丢包，传输速度快，适合视频

#### 3. TCP：数据完整送达应用程序（传输层）

![一个TCP连接生命周期](https://ddcdn.jd.com/ddimg/jfs/t1/116422/25/14702/105670/5f338dcdE64aef48e/5d277f783bacb5a3.png)

- TCP（Transmission Control Protocol，传输控制协议）是一种面向连接的. 可靠的. 基于字节流的传输层通信协议
- 机制
  - 重传机制：丢包
  - 数据包排序：大文件时数据包会拆分小数据包时保证顺序
- 建立连接
  - 三次握手
- 传输数据
  - 接收端需要对每个数据包进行确认操作
- 断开连接
  - 四次挥手

TCP 为了保证数据传输的可靠性，牺牲了数据包的传输速度，因为“三次握手”和“数据包校验机制”等把传输过程中的数据包的数量提高了一倍。

### 3. Http 请求流程

![HTTP请求流程](https://ddcdn.jd.com/ddimg/jfs/t1/137034/9/6899/140526/5f3393cbE9884b438/188814ae7fe84a24.png)

1. 构建请求

   GET /index.html HTTP1.1

2. 查找缓存

   浏览器命中缓存时，会拦截请求，返回副本

3. 准备 IP 地址和端口（DNS）

   - DNS 域名系统，返回 IP
   - DNS 数据缓存

4. 等待 TCP 队列

   Chrome 机制：只能建立 6 个连接

5. 建立 TCP 连接

6. 发送 HTTP 请求（同时发送）

   - 请求行
     - 请求方法
     - 请求 URI
     - HTTP 版本协议
   - 请求头

7. 服务器处理 HTTP 请求流程

   - 返回请求
     - 响应行
     - 响应头
     - 响应体
   - 断开连接
     - `connection:Keep=Alive`保持 TCP 连接可以省去下次请求建立连接时间，提升加载速度
   - 重定向
     - 301

#### 两个问题

- 1、站点第二打开速度很快

  - DNS 缓存
  - 页面资源缓存
    ![缓存](https://ddcdn.jd.com/ddimg/jfs/t1/144332/6/5149/640055/5f31287bEaf9183a6/9c7a65bb8c064fcf.png)

- 2、登录态保持（cookie）

  ![cookie流程](https://ddcdn.jd.com/ddimg/jfs/t1/114538/24/14632/217016/5f33936eEd066871d/ce3647bdcb5918ad.png)

  - 用户打开登录页面，在登录框里填入用户名和密码，点击确定按钮。点击按钮会触发页面脚本生成用户登录信息，然后调用 POST 方法提交用户登录信息给服务器。
  - 服务器接收到浏览器提交的信息之后，查询后台，验证用户登录信息是否正确，如果正确的话，会生成一段表示用户身份的字符串，并把该字符串写到响应头的 Set-Cookie 字段里，如下所示，然后把响应头发送给浏览器。
  - `Set-Cookie: UID=3431uad;`
  - 浏览器在接收到服务器的响应头后，开始解析响应头，如果遇到响应头里含有 Set-Cookie 字段的情况，浏览器就会把这个字段信息保存到本地。比如把 UID=3431uad 保持到本地。
  - 当用户再次访问时，浏览器会发起 HTTP 请求，但在发起请求之前，浏览器会读取之前保存的 Cookie 数据，并把数据写进请求头里的 Cookie 字段里（如下所示），然后浏览器再将请求头发送给服务器。
  - `Cookie: UID=3431uad;`
  - 服务器在收到 HTTP 请求头数据之后，就会查找请求头里面的“Cookie”字段信息，当查找到包含 UID=3431uad 的信息时，服务器查询后台，并判断该用户是已登录状态，然后生成含有该用户信息的页面数据，并把生成的数据发送给浏览器。
  - 浏览器在接收到该含有当前用户的页面数据后，就可以正确展示用户登录的状态信息了。

### 4. 从输入 URL 到页面展示发生了什么

**用户发出 URL 请求到页面开始解析的这个过程，就叫做导航**。

![完整流程](https://ddcdn.jd.com/ddimg/jfs/t1/113835/10/14771/305445/5f339478E44d335b2/2d5aa7db5672995f.png)

1. 用户输入

   - 输入内容

     使用浏览器默认搜索引擎，合成新的带搜索关键字 URL

   - 请求 URL

     自动加上协议，**回车后标签图片进入加载状态**，页面不会立即更换，等待文档提交阶段，页面内容才会变化

2. URL 请求过程（IPC 通信）

   - 本地缓存，有直接返回资源给浏览器
   - 没有缓存，进入 DNS 解析，DNS 缓存，如果是 HTTPS，还需要建立 TSL 连接
   - 建立 TCP/IP 连接，浏览器构建请求行和请求头，Cookie
     - 重定向（永久重定向）：在导航过程中，如果服务器响应行的状态码包含了 301. 302 一类的跳转信息，浏览器会跳转到新的地址继续导航；如果响应行是 200，那么表示浏览器可以继续处理该请求。
     - 响应数据类型处理
       Content-Type：告诉浏览器返回的响应体数据的类型
       - text/html ：返回 HTML 资源，会继续进行导航流程
       - application/octet-strea：返回字节流类型，通常情况下浏览器按照下载类型处理，同时该 URL 请求导航流程就会结束
       - application/json json ：格式数据

3. 准备渲染进程

   - 同一站点，复用父页面渲染

     - 同一站点（same-site）：具体地讲，我们将“同一站点”定义为根域名（例如，geekbang.org）加上协议（例如，`https://` 或者 `http://`），还包含了该根域名下的所有子域名和不同的端口

```js
https://time.geekbang.org
https://www.geekbang.org
https://www.geekbang.org:8080
```

- 新的页面单独渲染进程

4. 提交文档（URL 请求响应体数据）

   ![导航完成状态](https://ddcdn.jd.com/ddimg/jfs/t1/146864/10/5335/235891/5f339927Efabe5878/40eb689bcaf762ff.png)

   - 提交文档消息是浏览器发出，渲染流程接受到信息后，会和网络进程建立传输数据**管道**
   - 文档数据传输完成后，渲染流程会返回**确认提交**的纤细给浏览器进程
   - 浏览器进程收到确认提交后，会**更新浏览器界面状态**（安全状态. 地址栏的 URL. 前进后退的历史状态），并更新 web 页面（这会是白屏）

5. 渲染阶段
   - 停止图标加载动画（页签 icon）
   - 渲染进程将 HTML 内容转换为能够读懂的 DOM 树结构。
   - 渲染引擎将 CSS 样式表转化为浏览器可以理解的 styleSheets，计算出 DOM 节点的样式。
   - 创建布局树，并计算元素的布局信息。
   - 对布局树进行分层，并生成分层树。
   - 为每个图层生成绘制列表，并将其提交到合成线程。
   - 合成线程将图层分成图块，并在光栅化线程池中将图块转换成位图。
   - 合成线程发送绘制图块命令 DrawQuad 给浏览器进程。
   - 浏览器进程根据 DrawQuad 消息生成页面，并显示到显示器上。

### 5、渲染流程

![完整渲染流程](https://ddcdn.jd.com/ddimg/jfs/t1/118112/30/14604/160085/5f339ddfE60d7643a/21daffed1fe43d15.png)

> 渲染流程总结
>
> 1. 渲染进程将 HTML 内容转换为能够读懂的**DOM 树**结构。
> 2. 渲染引擎将 CSS 样式表转化为浏览器可以理解的**styleSheets**，计算出 DOM 节点的样式。
> 3. 创建**布局树**，并计算元素的布局信息。
> 4. 对布局树进行分层，并生成**分层树**。
> 5. 为每个图层生成**绘制列表**，并将其提交到合成线程。
> 6. 合成线程将图层分成**图块**，并在**光栅化线程池**中将图块转换成位图。
> 7. 合成线程发送绘制图块命令**DrawQuad**给浏览器进程。
> 8. 浏览器进程根据 DrawQuad 消息**生成页面**，并**显示**到显示器上。

- 主线程

  1. 构建 DOM 树

     - 树结构

  2. 样式计算

     1. css 结构-stylessheets

     2. 转换属性值标准化

        ![标准化属性值](https://ddcdn.jd.com/ddimg/jfs/t1/123099/26/9458/218488/5f339a89Ec1c74937/639c744b6d46bdde.png)

        - rgb
        - px

     3. 计算 DOM 树每个节点具体样式
        - CSS 继承和层叠规则
          - useragent 浏览器默认样式
          - 层叠继承

  3. 布局阶段（Layout Tree）

     - 创建布局树（所有可见节点，不可见的会被忽略）
     - 布局计算

  4. 分层 图层树（LayerTree）

     渲染引擎还需要为特定的节点升成专用的图片并生成图层树

     1. 拥有层叠 上下文属性元素会被单独升为一层

        1. 定位属性（position）
        2. 透明属性
        3. CSS 滤镜
        4. z-index

     2. 需要剪裁（clip）被创建为图层

        `overflow:auto`

  5. 图层绘制（Paint）

     绘制指令

- 非主线程（合成线程）

  ![图层被划分](https://ddcdn.jd.com/ddimg/jfs/t1/117301/26/14205/396752/5f339d3fE633308f3/b7a546cffe18942b.png)

  栅格化操作

  **合成线程会按照视口附近的图块来优先生成位图，实际生成位图的操作是由栅格化来执行的。所谓栅格化，是指将图块转换为位图**

  ![GPU栅格化](https://ddcdn.jd.com/ddimg/jfs/t1/143358/34/5274/178923/5f339d9eE9ec1d799/2435c21722c2caf8.png)

- 重排. 重绘. 合成

  - 重排：**更改了元素几何属性**，需要更新整个渲染流水线，开销最大。

    ![重排](https://ddcdn.jd.com/ddimg/jfs/t1/125444/15/9323/95693/5f339e51E74be9033/f8dae7536b44ace1.png)

  - 重绘：**更改元素绘制属性**，省去了布局和分层阶段，执行效率高一点

    ![重绘](https://ddcdn.jd.com/ddimg/jfs/t1/126716/10/9553/100259/5f339e8eEad2f37f9/fe5f96c5ae7d0396.png)

  - 合成：渲染引擎将跳过布局和绘制，只执行后续的合成操作，我们把这个过程叫做**合成**。非主线程操作

    - transform

    ![合成](https://ddcdn.jd.com/ddimg/jfs/t1/140099/37/5304/93032/5f339edfE962532bd/221860d8331a1149.png)

## 二、 javascript 执行机制

### 6. JavaScript 变量提升

#### 变量提升（Hoisting）

**所谓的变量提升，是指在 JavaScript 代码执行过程中，JavaScript 引擎把变量的声明部分和函数的声明部分提升到代码开头的“行为”。变量被提升后，会给变量设置默认值，这个默认值就是我们熟悉的 undefined。**

![函数声明和赋值](https://ddcdn.jd.com/ddimg/jfs/t1/149080/35/5244/91352/5f33a4b1E23b64e13/5b067873163f807c.png)

1. 变量声明：变量提升，并且默认值是 undefined

2. 函数声明

   - 函数声明，整个函数提升，并且优先级高于表达式定义
   - 表达式声明：只有函数名提升，默认值 undefined，函数部分不提升

3. 同名变量和函数规则
   1. 如果是同名的函数，JavaScript 编译阶段会选择最后声明的那个。
   2. 如果变量和函数同名，那么在编译阶段，变量的声明会被忽略

#### JavaScript 执行流程：先编译，再执行

1. 编译阶段：变量和函数会放到变量环境中

   ![执行流程图](https://ddcdn.jd.com/ddimg/jfs/t1/122760/27/9455/284814/5f33a60eE27f7f3f8/3c82dd6d0bc25302.png)

   - 执行上下文（Execution context）

     **执行上下文是 JavaScript 执行一段代码时的运行环境**

   - 可执行代码

2. 执行阶段

   JavaScript 引擎开始执行可执行代码，按照顺序一行一行执行

### 7. 调用栈

1. 函数调用

   运行一个函数，方式：函数名()

2. 调用栈（执行上下文栈）：管理函数调用的数据结构

   ![执行函数的调用栈](https://ddcdn.jd.com/ddimg/jfs/t1/146194/30/5206/256495/5f33a9f5E3e7f5746/10dc7d58e3eb3c17.png)

- 调用栈是 JavaScript 引擎追踪函数执行的一个机制

  - 每调用一个函数，JavaScript 引擎会为其创建执行上下文，并把该执行上下文压入调用栈，然后 JavaScript 引擎开始执行函数代码。
  - 如果在一个函数 A 中调用了另外一个函数 B，那么 JavaScript 引擎会为 B 函数创建执行上下文，并将 B 函数的执行上下文压入栈顶。
  - 当前函数执行完毕后，JavaScript 引擎会将该函数的执行上下文弹出栈。

- 如何利用浏览器查看调用栈信息：Call Stack

- 栈溢出（stack overflow）：调用栈是有大小的

### 8. 块级作用域

#### 作用域

**作用域是指在程序中定义变量的区域，该位置决定了变量的生命周期。通俗地理解，作用域就是变量与函数的可访问范围，即作用域控制着变量和函数的可见性和生命周期。**

- 全局作用域
- 函数作用域：函数内部变量或者函数，函数执行结束后，内部定义的变量会销毁
- 块级作用域：ES6 新增

#### 变量提升带来的问题

- 变量被突然覆盖
- 本应销毁的变量没有被销毁（for 循环中 i）

#### JavaScript 如何支持块级作用域

1. 编译并创建执行上下文

   - 函数内部通过 var 声明的变量，在编译阶段全都被存放到**变量环境**里面了。
   - 通过 let 声明的变量，在编译阶段会被存放到**词法环境**（Lexical Environment）中。

2. 继续执行代码，执行完毕，定义的变量就会从词法环境栈顶弹出

   ![变量查找过程](https://ddcdn.jd.com/ddimg/jfs/t1/150286/29/5279/148908/5f33b0c0E0c449f25/c78c9f974f361143.png)

**总结：块级作用域是通过词法环境的栈结构实现，变量提升是通过变量环境实现。**

### 9. 作用域链与闭包

#### 作用域链

![作用域链的调用栈图](https://ddcdn.jd.com/ddimg/jfs/t1/111583/16/14848/187832/5f33b247Ecd6c5d21/c2a546c743061761.png)

- 作用域查找变量的链条称为作用域链
- 作用域链是通过词法作用域（静态作用域）来确定的，词法作用域反映了代码的结构
- 基于调用栈，不是基于函数定义的位置

#### 词法作用域

词法作用域就是指作用域是由代码**函数声明的位置**来决定的，所以词法作用域是静态的作用域，通过它就能够预测代码在执行过程中如何查找标识符。

![词法作用域](https://ddcdn.jd.com/ddimg/jfs/t1/134521/9/6774/191866/5f33b52fE87ace8d5/0d5ba5ddc65d1689.png)

词法作用域是代码阶段就决定好的，和函数是怎么调用的没有关系

#### 块级作用域中的变量查找

![块级作用域查找变量](https://ddcdn.jd.com/ddimg/jfs/t1/119909/39/9462/191903/5f33b79eE98caca48/2c536db4e9615312.png)

查找过程为 1、2、3、4、 5

- **单个执行上下文顺序：词法环境->变量环境**
- 块级作用域执行完毕后，定义的变量会从词法环境栈顶弹出

#### 闭包

**在 JavaScript 中，根据词法作用域的规则，内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使该外部函数已经执行结束了，但是内部函数引用外部函数的变量依然保存在内存中，我们就把这些变量的集合称为闭包。比如外部函数是 foo，那么这些变量的集合就称为 foo 函数的闭包**。

举栗子

```js
function foo() {
  var myName = " 极客时间 ";
  let test1 = 1;
  const test2 = 2;
  var innerBar = {
    getName: function() {
      console.log(test1);
      return myName;
    },
    setName: function(newName) {
      myName = newName;
    },
  };
  return innerBar;
}
var bar = foo();
bar.setName(" 极客邦 ");
bar.getName();
console.log(bar.getName());
```

![执行到return bar调用栈](https://ddcdn.jd.com/ddimg/jfs/t1/149465/27/5206/159773/5f33bd0cEa61eb5e8/f1fc799e798dc7eb.png)

![闭包产生](https://ddcdn.jd.com/ddimg/jfs/t1/113849/6/14923/116653/5f33bd3dE0ae70137/89563ac19a709676.png)

![执行bar函数时](https://ddcdn.jd.com/ddimg/jfs/t1/135500/12/6786/153762/5f33bd73Ecc8e7fb4/874068145319f6f3.png)

- 根据词法作用域的规则，内部函数 getName 和 setName 总是可以访问它们的外部函数 foo 中的变量
- 作用域链：local->closure(foo)->global

### 10. this

![执行上下文中this](https://ddcdn.jd.com/ddimg/jfs/t1/145091/39/5270/277824/5f33c0dcE7ae51025/b9430ddd97b0a5d4.png)

#### 全局执行上下文中 this

指向 window 对象

#### 函数执行上下文中 this

1. 默认情况下，调用函数 this 也是指向 window

2. 设置函数执行上下文中的 this 值

   1. 函数 call,apply,bind 方法
   2. 对象调用方法设置

      - 在全局环境中调用一个函数，函数内部的 this 指向的是全局变量 window。
      - 通过一个对象来调用其内部的一个方法，该方法的执行上下文中的 this 指向对象本身。（谁调用 this 指向谁）

   3. 通过构造函数（new）

      - 首先创建了一个空对象 tempObj；

      - 接着调用 CreateObj.call 方法，并将 tempObj 作为 call 方法的参数，这样当 CreateObj 的执行上下文创建时，它的 this 就指向了 tempObj 对象；

      - 然后执行 CreateObj 函数，此时的 CreateObj 函数执行上下文中的 this 指向了 tempObj 对象；

      - 最后返回 tempObj 对象。

```js
var tempObj = {};
CreateObj.call(tempObj);
return tempObj;
```

#### this 设计缺陷及方案

1. 嵌套函数 this 不会继承
   - \_this：解决本质是将 this 体系转换为作用域体系
   - 箭头函数：本质是箭头函数不会创建自身的执行上下文，this 取决于外部函数
2. 普通函数中 this 默认指向 window
   - 严格模式下，默认执行一个函数，函数的执行上下文中 this 是 undefined，不指向 window

## 三、 V8 工作原理

### 11.栈空间与堆空间

#### JavaScript 语言类型（动态的弱类型）

- 静态语言：使用之前需要确定其变量数据类型的称为静态语言。

- 动态语言：运行过程中需要检查数据类型的称为动态语言。

- 弱类型语言：支持隐式类型转换的语言

- 强类型语言：不支持隐式类型转换

  ![各语言类型](https://ddcdn.jd.com/ddimg/jfs/t1/142936/24/5239/116889/5f34a9d6E8ae2c09d/4ae6f698f3e2d849.png)

#### JavaScript 数据类型

![数据类型](https://ddcdn.jd.com/ddimg/jfs/t1/111845/3/14782/271565/5f34aabdEa00f5dd3/9e65d0873016d62d.png)

原始类型

引用类型：Object

古老的坑，`typeof null ->Object`，[为什么 "typeof null" 的结果为 "object" ?](https://learnku.com/articles/29948)

#### 内存空间

**原始类型的数据值都是直接保存在“栈”中的，引用类型的值是存放在“堆”中的**。

1. 栈空间（执行上下文调用栈）
   - 栈空间不会设置太大，主要存放一些原始类型的小数据。
   - 原始类型的赋值会完整复制变量值，引用类型的赋值是复制引用地址
2. 堆空间
   - 堆空间很大，能存放很多大数据

![引用赋值](https://ddcdn.jd.com/ddimg/jfs/t1/132071/37/6996/146298/5f35ed23E8562313b/0a7cd3f989b85013.png)

#### 再谈闭包

```js
function foo() {
  var myName = " 极客时间 ";
  let test1 = 1;
  const test2 = 2;
  var innerBar = {
    setName: function(newName) {
      myName = newName;
    },
    getName: function() {
      console.log(test1);
      return myName;
    },
  };
  return innerBar;
}
var bar = foo();
bar.setName(" 极客邦 ");
bar.getName();
console.log(bar.getName());
```

从内存模型的角度分析这段代码的执行流程

1. 当 JavaScript 引擎执行到 foo 函数时，首先会编译，并创建一个空执行上下文。
2. 在编译过程中，遇到内部函数 setName，JavaScript 引擎还要对内部函数做一次快速的词法扫描，发现该内部函数引用了 foo 函数中的 myName 变量，由于是内部函数引用了外部函数的变量，所以 JavaScript 引擎判断这是一个闭包，于是在堆空间创建换一个“closure(foo)”的对象（这是一个内部对象，JavaScript 是无法访问的），用来保存 myName 变量。
3. 接着继续扫描到 getName 方法时，发现该函数内部还引用变量 test1，于是 JavaScript 引擎又将 test1 添加到“closure(foo)”对象中。这时候堆中的“closure(foo)”对象中就包含了 myName 和 test1 两个变量了。
4. 由于 test2 并没有被内部函数引用，所以 test2 依然保存在调用栈中。

闭包的核心：1. 预扫描内部函数 2. 把内部函数引用的外部变量保存在堆中

![闭包产生过程](https://ddcdn.jd.com/ddimg/jfs/t1/147838/9/5477/138882/5f35ee1bE114af781/e4f5ad66f4278666.png)

### 12.垃圾回收

#### 1.调用栈中数据回收（下移 ESP）

举栗子

```js
function foo() {
  var a = 1;
  var b = { name: " 极客邦 " };
  function showName() {
    var c = 1;
    var d = { name: " 极客时间 " };
  }
  showName();
}
foo();
```

执行函数时调用栈如图：

![执行函数时调用栈](https://ddcdn.jd.com/ddimg/jfs/t1/133197/39/6910/191581/5f35f0aeE7b11fc7d/d169c9974c1b4e9a.png)

**ESP 指针：记录当前执行状态的指针，ESP 下移操作就是销毁函数执行上下文的过程。**

![栈中回收函数执行上下文](https://ddcdn.jd.com/ddimg/jfs/t1/141484/31/5447/238476/5f35f1b3Ec5e54a4f/f713a6ae02535cc1.png)

#### 2.堆中数据回收（垃圾回收器）

1. 代际假说，垃圾回收的基础

   - 第一个是大部分对象在内存中存在的时间很短，简单来说，就是很多对象一经分配内存，很快就变得不可访问；
   - 第二个是不死的对象，会活得更久。

2. V8 中将堆分为**新生代**和**老生代**两个区域

   **新生代中存放的是生存时间短的对象，老生代中存放的生存时间久的对象**。

   新生区通常只支持 1 ～ 8M 的容量，而老生区支持的容量就大很多了。

   - **副垃圾回收器，主要负责新生代的垃圾回收。**
   - **主垃圾回收器，主要负责老生代的垃圾回收。**

3. 垃圾回收器的工作流程

   1. 标记空间中活动对象和非活动对象。所谓活动对象就是还在使用的对象，非活动对象就是可以进行垃圾回收的对象。
   2. 回收非活动对象所占据的内存。其实就是在所有的标记完成之后，统一清理内存中所有被标记为可回收的对象。
   3. 内存整理。一般来说，频繁回收对象后，内存中就会存在大量不连续空间，我们把这些不连续的内存空间称为**内存碎片**。当内存中出现了大量的内存碎片之后，如果需要分配较大连续内存的时候，就有可能出现内存不足的情况。所以最后一步需要整理这些内存碎片，但这步其实是可选的，因为有的垃圾回收器不会产生内存碎片，比如接下来我们要介绍的副垃圾回收器。

4. 副垃圾回收器（新生区）

   - 大多数小的对象都会被分配到新生区，所以说这个区域虽然不大，但是垃圾回收还是比较频繁的。

   - 使用**Scavenge 算法**处理，是把新生代空间对半划分为两个区域，一半是对象区域，一半是空闲区域，新加入的对象都会存放到对象区域。

   - 在垃圾回收过程中，首先要对对象区域中的垃圾做标记；标记完成之后，就进入垃圾清理阶段，副垃圾回收器会把这些存活的对象复制到空闲区域中，同时它还会把这些对象有序地排列起来，所以这个复制过程，也就相当于完成了内存整理操作，复制后空闲区域就没有内存碎片了。

   - 完成复制后，对象区域与空闲区域进行角色翻转，也就是原来的对象区域变成空闲区域，原来的空闲区域变成了对象区域。这样就完成了垃圾对象的回收操作，同时这种**角色翻转的操作还能让新生代中的这两块区域无限重复使用下去**。

   - 如果新生区空间设置得太大了，那么每次清理的时间就会过久，所以**为了执行效率，一般新生区的空间会被设置得比较小**。
   - 新生去空间小，JavaScript 引擎采用了**对象晋升策略**，也就是经过两次垃圾回收依然还存活的对象，会被移动到老生区中。

   ![V8堆空间](https://ddcdn.jd.com/ddimg/jfs/t1/123299/31/9483/89705/5f35f495E4f6dc51e/cd6937ef8093e2a6.png)

5. 主垃圾回收器（老生区）

   - 老生区中的对象有两个特点，一个是对象占用空间大，另一个是对象存活时间长。

   - 主垃圾回收器是采用**标记 - 清除（Mark-Sweep）**的算法进行垃圾回收。

   - 标记阶段就是从一组根元素开始，递归遍历这组根元素，在这个遍历过程中，能到达的元素称为**活动对象**，没有到达的元素就可以判断为**垃圾数据**。

     ![标记过程](https://ddcdn.jd.com/ddimg/jfs/t1/127886/31/9659/166917/5f35f60fE67135d77/ecb95af13b34deb8.png)

   - 清除过程，清除标记为垃圾数据的过程

     ![清除过程](https://ddcdn.jd.com/ddimg/jfs/t1/147625/11/5476/60684/5f35f6d3E7dba7f6b/3d0ac1d79565fbe9.png)

   - **标记 - 整理（Mark-Compact）**，整理内存碎片

     ![标记整理](https://ddcdn.jd.com/ddimg/jfs/t1/144096/38/5401/48264/5f35fa85Ec95e642e/28561f126cff6a92.png)

6. 全停顿

   - 由于 JavaScript 是运行在主线程之上的，一旦执行垃圾回收算法，都需要将正在执行的 JavaScript 脚本暂停下来，待垃圾回收完毕后再恢复脚本执行。我们把这种行为叫做**全停顿（Stop-The-World）**。全停顿对新生代影响不大，因为空间小，存活对象小，对老生代影响大，会卡死主线程。

   ![全停顿](https://ddcdn.jd.com/ddimg/jfs/t1/137225/23/6879/54260/5f35fb13E7372727a/a0afab5d99c722bc.png)

   - **增量标记（Incremental Marking）算法**：降低老生代垃圾回收的卡顿，V8 将标记过程分为一个个的子标记过程，同时让垃圾回收标记和 JavaScript 应用逻辑交替进行，直到标记阶段完成

     ![增量标记](https://ddcdn.jd.com/ddimg/jfs/t1/145960/28/5410/56469/5f35fc29E7a8d3f6d/d7b818d9cf091294.png)

### 13. 编译器与解释器

![编译器和解释器翻译代码](https://ddcdn.jd.com/ddimg/jfs/t1/124066/8/9628/96075/5f349ce0E4d0f8c01/18fe41004a35e6b4.png)

#### 编译器 Compiler（编译型语言）

编译型语言在程序执行之前，需要经过编译器的编译过程，并且编译之后会直接保留机器能读懂的二进制文件，这样每次运行程序时，都可以直接运行该二进制文件，而不需要再次重新编译了。例如 Java 和 GO

#### 解释器 Interpreter（解释型语言）

解释型语言编写的程序，在每次运行时都需要通过解释器对程序进行动态解释和执行

#### V8 是如何执行一段 JavaScript 代码

![V8执行代码流程图](https://ddcdn.jd.com/ddimg/jfs/t1/130368/15/6792/164446/5f349d7aE5f078d73/b5bd49213d7d3645.png)

1. 生成抽象语法树`AST`和执行上下文

   生成`AST`阶段：先分词，在解析

   1. 分词（tokenize），又称词法分析

      作用是将一行行的源码拆解成一个个 token。所谓 token，是指语法上不可能在分，最小的单个字符或字符串

      ![token拆分](https://ddcdn.jd.com/ddimg/jfs/t1/134320/5/6863/108151/5f349edaE6b5c4470/ebc8c83fa72d2854.png)

   2. 解析（parse），又称为语法分析

      作用是将 token 数据，根据规则转换为`AST`。不符合语法规则会抛出语法错误。几种常见错误如下：

      - [`EvalError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/EvalError)：代表了一个关于 [eval](https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Functions/eval) 函数的错误.此异常不再会被 JavaScript 抛出，但是 EvalError 对象仍然保持兼容性
      - [`RangeError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RangeError)：越界错误，当一个值不在其所允许的范围或者集合中
      - [`ReferenceError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError)：引用错误，当一个不存在的变量被引用时发生的错误
      - [`SyntaxError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError)：语法错误，Javascript 引擎发现了不符合语法规范的 tokens 或 token 顺序
      - [`TypeError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError)：类型错误，表示值的类型非预期类型时发生的错误
      - [`URIError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/URIError)：以一种错误的方式使用全局 URI 处理函数而产生的错误
      - [`InternalError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/InternalError)：表示出现在 JavaScript 引擎内部的错误（遇不到）

2. 生成字节码

   解释器 lgniton 根据 AST 生成字节码，并解释执行字节码。

   **字节码就是介于 AST 和机器码之间的一种代码。但是与特定类型的机器码无关，字节码需要通过解释器将其转换为机器码后才能执行。**

   ![字节码与机器码对比](https://ddcdn.jd.com/ddimg/jfs/t1/127702/2/9530/84395/5f34a2edE5b470fd6/5f23383ab1fb9d37.png)

3. 执行代码

   1. 解释器`lgnition`会逐条解释执行。
   2. 遇到热点代码`HotSpot`（一段代码被重复执行多次，称为热热点代码），后台编辑器`Turbofan`会把热点代码的字节码编译为更高效的机器码（同样内存占用更多）
   3. 继续逐条解释执行，遇到被优化的热点代码，直接执行编译后的机器码，提升了代码的执行效率。

   **即时编译（JIT）**：字节码配合解释器和编译器

   ![JIT流程](https://ddcdn.jd.com/ddimg/jfs/t1/142376/2/5387/158808/5f34a518Ebe55f25e/4197f3c76a13337a.png)

#### JavaScript 性能优化

1. 提升单次脚本的执行速度，避免 JavaScript 的长任务霸占主线程，这样可以使得页面快速响应交互；
2. 避免大的内联脚本，因为在解析 HTML 的过程中，解析和编译也会占用主线程；
3. 减少 JavaScript 文件的容量，因为更小的文件会提升下载速度，并且占用更低的内存。

## 四、浏览器页面循环模块

### 14. 消息队列与事件循环

#### 线程模型的历史

1. 单线程处理任务（第一版）

   ![线程执行](https://ddcdn.jd.com/ddimg/jfs/t1/123745/24/9724/195351/5f3605cdE3b7a76aa/02c4997091848735.png)

2. 运行中处理新的任务-引用事件循环机制（第二版）

   ![引入事件循环](https://ddcdn.jd.com/ddimg/jfs/t1/147147/9/5318/123636/5f3605ecE29ec4fe9/7017d0a493170bf5.png)

3. 处理其他线程发送的任务-引入消息队列（第三版）

   ![线程之间任务](https://ddcdn.jd.com/ddimg/jfs/t1/119111/33/14961/144288/5f360699Eabaf3420/065573608b8667bf.png)

   **消息队列是一种数据结构，可以存放要执行的任务**。它符合队列“**先进先出**”的特点，也就是说**要添加任务的话，添加到队列的尾部；要取出任务的话，从队列头部去取**。

   ![第三版 队列+循环](https://ddcdn.jd.com/ddimg/jfs/t1/117595/26/14981/200103/5f3606f9E26ffb484/a4d08e2405b28edc.png)

   改造三个步骤：

   1. 添加一个消息队列；
   2. IO 线程中产生的新任务添加进消息队列尾部；
   3. 渲染主线程会循环地从消息队列头部中读取任务，执行任务。

```js
// 伪代码实现第三版线程模型

// 消息队列
class TaskQueue{
  public:
  Task takeTask(); // 取出队列头部的一个任务
  void pushTask(Task task); // 添加一个任务到队列尾部
};

// 主线程
TaskQueue task_queue；
void ProcessTask();
bool keep_running = true;//退出标志
void MainThread(){
  for(;;){ //事件循环
    Task task = task_queue.takeTask();
    ProcessTask(task);
    if(!keep_running) // 如果设置了退出标志，那么直接退出线程循环
        break;
  }
}

// 其他线程添加任务
Task clickTask;
task_queue.pushTask(clickTask)

```

4. 处理其他进程发送的任务-IPC（第四版，也是目前使用的版本）

   ![跨进程发送任务](https://ddcdn.jd.com/ddimg/jfs/t1/128885/1/9671/229365/5f36084eE51bba1f7/b459f35db9657820.png)

   **渲染进程专门有一个 IO 线程用来接收其他进程传进来的消息**，接收到消息之后，会将这些消息组装成任务发送给渲染主线程。其他步骤同第三版。

#### 页面使用单线程的缺点

1. 如何处理高优先级的任务

   - 权衡效率和实时性，引用**微任务**

     - 宏任务：消息队列中的任务
     - 微任务：宏任务中都有一个微任务队列

   - 实现
     1. 当宏任务执行过程中出现 `dom`（高优先级任务） 等放入微任务中
     2. 等到当前宏任务执行结束后，执行当前宏任务中的微任务队列，直到宏任务执行完成后，执行下一个宏任务。

2. 如何解决单个任务执行时长过久的问题
   回调函数

### 15. WebAPI 实现

#### 1. 浏览器怎么实现`setTimeout`（延迟队列）

`setTimeout`（延迟队列）：先执行消息队列，后执行延迟队列。
**（本质是 `hashMap`，会检查到期任务，到期了就会执行，所有到期任务都执行结束，才会进入下一轮循环。`clearTimeout`取消时，直接通过 id 查找，在`hashMap`中删除对应的任务）**

```js
// 伪代码

//延迟队列
 DelayedIncomingQueue delayed_incoming_queue;

// 通过 JavaScript 调用 setTimeout 设置回调函数的时候，渲染进程将会创建一个回调任务，包含了回调函数 showName、当前发起时间、延迟执行时间
struct DelayTask{
  int64 id；
  CallBackFunction cbf;
  int start_time;
  int delay_time;
};
DelayTask timerTask;
timerTask.cbf = showName;
timerTask.start_time = getCurrentTime(); // 获取当前时间
timerTask.delay_time = 200;// 设置延迟执行时间

// 添加到延迟队列
delayed_incoming_queue.push(timerTask);


void ProcessTimerTask(){
  // 从 delayed_incoming_queue 中取出已经到期的定时器任务
  // 依次执行这些任务
}

// 主线程
TaskQueue task_queue；
void ProcessTask();
bool keep_running = true;
void MainTherad(){
  for(;;){
    // 执行消息队列中的任务
    Task task = task_queue.takeTask();
    ProcessTask(task);

    // 执行延迟队列中的任务
    ProcessDelayTask()

    if(!keep_running) // 如果设置了退出标志，那么直接退出线程循环
        break;
  }
}

```

注意事项

1. 定时器不一定会按时执行（当前任务执行时间过长）

2. 嵌套调用，系统设置最短时间间隔为 4 毫秒

3. 未激活的页面，定时器最小时间间隔 1000 毫秒

4. 延时执行时间有最大值（2147483647 ），大于会立即执行

5. 定时器中 this 指向 全局环境，不是定义时所在的对象

   如何绑定 this

   1. 箭头函数
   2. bind

#### 2. XMLHttpRequest 是怎么实现的

1. 回调函数 VS 系统调用栈

   - 同步回调：在调用主函数返回之前执行
   - 异步回调：在调用主函数外执行
     - 异步函数添加到消息队列的尾部
     - 异步函数添加到微任务队列中，这样可以在当前任务的末尾处执行微任务。

2. XMLHttpRequest 运行机制

   ![XMLHttpRequest运行机制](https://ddcdn.jd.com/ddimg/jfs/t1/149901/39/5453/170935/5f364216E585c7393/7baeb14379e789f7.png)

   调用`xhr.send`来发起网络请求

   - 渲染进程会将请求发送给网络进程，然后网络进程负责资源的下载
   - 等网络进程接收到数据之后，就会利用 IPC 来通知渲染进程；
   - 渲染进程接收到消息之后，会将 xhr 的回调函数封装成任务并添加到消息队列中，
   - 等主线程循环系统执行到该任务的时候，就会根据相关的状态来调用对应的回调函数。

3. XMLHttpRequest 坑
   1. 跨域问题
   2. HTTPS 混合内容问题：HTTPS 网页中使用 XMLHttpRequest 来请求会报错

### 16. 宏任务和微任务

1. 宏任务
   宏任务包括：

   - 渲染事件（解析 DOM. 计算布局. 绘制）
   - 用户交互事件
   - JavaScript 脚本执行事件
   - 网络请求完成，文件读写完成事件

2. 微任务

   **微任务就是一个需要异步执行的函数，执行时机是在主函数执行结束之后、当前宏任务结束之前。**

   - 异步回调：

     1. 异步回调函数封装成宏任务，添加到消息队列尾部，当循环系统执行到该任务的时候执行回调函数
     2. 执行时机是在主函数执行结束之后，当前宏任务结束之前执行回调函数，这种以微任务实现。

   - 微任务包括：

     1. `MutationObserver`监控 DOM 节点
     2. Promise 中调用`Promise.resolve()`或者`Promise.reject()`，也会产生微任务。

   - 检查点：执行微任务的时间
     当前宏任务中的 JavaScript 快执行完成时，也就在 JavaScript 引擎准备退出全局执行上下文并清空调用栈的时候，JavaScript 引擎会检查全局执行上下文中的微任务队列，然后按照顺序执行队列中的微任务。

     ![微任务添加](https://ddcdn.jd.com/ddimg/jfs/t1/133929/17/6959/235973/5f36600fE7e0c2705/761de8d5e17ee575.png)

     ![微任务执行](https://ddcdn.jd.com/ddimg/jfs/t1/117104/25/15001/219194/5f36601aEd3eb479c/341bbcd2870c7bf5.png)

   在 JavaScript 脚本的后续执行过程中，分别通过 Promise 和 removeChild 创建了两个微任务，并被添加到微任务列表中。接着 JavaScript 执行结束，准备退出全局执行上下文，这时候就到了检查点了，JavaScript 引擎会检查微任务列表，发现微任务列表中有微任务，那么接下来，依次执行这两个微任务。等微任务队列清空之后，就退出全局执行上下文。

   分析得知：

   1. 微任务和宏任务是绑定的，每个宏任务在执行时，会创建自己的微任务队列。
   2. 微任务的执行时长会影响到当前宏任务的时长。比如一个宏任务在执行过程中，产生了 100 个微任务，执行每个微任务的时间是 10 毫秒，那么执行这 100 个微任务的时间就是 1000 毫秒，也可以说这 100 个微任务让宏任务的执行时间延长了 1000 毫秒。所以你在写代码的时候一定要注意控制微任务的执行时长。
   3. 在一个宏任务中，分别创建一个用于回调的宏任务和微任务，无论什么情况下，微任务都早于宏任务执行

3. 监听 DOM 变化方法演变

   - 原因：Web 应用需要**监视 DOM 变化并及时地做出响应**。

   - 版本：

     - 早期版本：Mutation Event

       Mutation Event 采用了**观察者的设计模式**，当 DOM 有变动时就会立刻触发相应的事件，这种方式属于同步回调。有性能问题，已经删除

     - 当前版本：MutationObserver

       MutationObserver 将响应函数改成异步调用，可以不用在每次 DOM 变化都触发异步调用，而是等多次 DOM 变化后，**一次触发异步调用**，并且还会使用一个数据结构来记录这期间所有的 DOM 变化。

   - MutationObserver 实现：

     MutationObserver 采用了“**异步 + 微任务**”的策略。

     - 通过**异步**操作解决了同步操作的**性能问题**；
     - 通过**微任务**解决了**实时性的问题**。

### 17. Promise

1. 异步编程的问题：代码逻辑不连续、地狱回调

   ![image.png](https://ddcdn.jd.com/ddimg/jfs/t1/145764/28/5411/213078/5f366359Eceec2fda/c99713468b7b1c6f.png)

2. 封装异步代码

   ![封装过程](https://ddcdn.jd.com/ddimg/jfs/t1/125914/37/9825/110345/5f366388Eb1fb44f3/990b6f247cca96e9.png)

3. Promise 如何解决地狱回调

   1. **Promise 实现了回调函数的延时绑定**。回调函数的延时绑定在代码上体现就是先创建 Promise 对象 x1，通过 Promise 的构造函数 executor 来执行业务逻辑；创建好 Promise 对象 x1 之后，再使用 x1.then 来设置回调函数。

```js
// 创建 Promise 对象 x1，并在 executor 函数中执行业务逻辑
function executor(resolve, reject) {
  resolve(100);
}
let x1 = new Promise(executor);

//x1 延迟绑定回调函数 onResolve
function onResolve(value) {
  console.log(value);
}
x1.then(onResolve);
```

2.  **需要将回调函数 onResolve 的返回值穿透到最外层**。

创建新的 Promise 对象，并 return 到外层

![回调函数返回值穿透到最外层](https://ddcdn.jd.com/ddimg/jfs/t1/120029/18/9562/232339/5f36665eEa149f7b1/3bf57e8120dd4646.png)

3. Promise 与微任务联系

   Promise 之所以要使用微任务是由 Promise 回调函数延迟绑定技术导致的。在调用 onResolve 时，then 方法还没有执行

```js
function Bromise(executor) {
  var onResolve_ = null;
  var onReject_ = null;
  // 模拟实现 resolve 和 then，暂不支持 rejcet
  this.then = function(onResolve, onReject) {
    onResolve_ = onResolve;
  };
  function resolve(value) {
    //setTimeout(()=>{
    onResolve_(value); //此时方法未调用， onResolve_是null
    // },0)
  }
  executor(resolve, null);
}

function executor(resolve, reject) {
  resolve(100);
}
// 将 Promise 改成我们自己的 Bromsie
let demo = new Bromise(executor);

function onResolve(value) {
  console.log(value);
}
demo.then(onResolve);
```

### 18.async/await

**ES7 引入了 async/await，这是 JavaScript 异步编程的一个重大改进，提供了在不阻塞主线程的情况下使用同步代码实现异步访问资源的能力，并且使得代码逻辑更加清晰**。

#### 1.生成器和协程

生成器函数是一个带星号函数，而且是可以暂停执行和恢复执行的。

```js
function* genDemo() {
  console.log(" 开始执行第一段 ");
  yield "generator 2";

  console.log(" 开始执行第二段 ");
  yield "generator 2";
}

console.log("main 0");
let gen = genDemo();
console.log(gen.next().value);
console.log("main 1");
console.log(gen.next().value);
console.log("main 2");
```

生成器函数使用方式：

1. 在生成器函数内部执行一段代码，如果遇到 yield 关键字，那么 JavaScript 引擎将返回关键字后面的内容给外部，并暂停该函数的执行。

2. 外部函数可以通过 next 方法恢复函数的执行。

**协程是一种比线程更加轻量级的存在**。协程是跑在线程上的任务，一个线程上可以存在多个协程，但是线程上同时只能执行一个协程。比如当前执行的是 A 协程，要启动 B 协程，那么 A 协程就需要将主线程的控制权交给 B 协程，这就体现在 A 协程暂停执行，B 协程恢复执行；同样，也可以从 B 协程中启动 A 协程。通常，**如果从 A 协程启动 B 协程，我们就把 A 协程称为 B 协程的父协程**。

![协程执行流程图](https://ddcdn.jd.com/ddimg/jfs/t1/134117/33/7011/141224/5f391eefEf1f2c24d/2621b949241da30d.png)

从图中可以看出来协程的四点规则：

1. 通过调用生成器函数 genDemo 来创建一个协程 gen，创建之后，gen 协程并没有立即执行。
2. 要让 gen 协程执行，需要通过调用 gen.next。
3. 当协程正在执行的时候，可以通过 yield 关键字来暂停 gen 协程的执行，并返回主要信息给父协程。
4. 如果协程在执行期间，遇到了 return 关键字，那么 JavaScript 引擎会结束当前协程，并将 return 后面的内容返回给父协程。

父协程与 gen 协程是交互执行，通过 yield 和 gen.next 配合完成，JavaScript 引擎会保存调用栈信息。

![gen协程和父协程之间切换](https://ddcdn.jd.com/ddimg/jfs/t1/140625/38/5694/153304/5f391fdcEe8c837d5/b77d5042645ed91a.png)

```js
// 利用生成器和Promise实现
function* foo() {
  let response1 = yield fetch("https://www.geekbang.org");
  console.log("response1");
  console.log(response1);
  let response2 = yield fetch("https://www.geekbang.org/test");
  console.log("response2");
  console.log(response2);
}

// 执行 foo 函数的代码
let gen = foo();
function getGenPromise(gen) {
  return gen.next().value;
}
getGenPromise(gen)
  .then((response) => {
    console.log("response1");
    console.log(response);
    return getGenPromise(gen);
  })
  .then((response) => {
    console.log("response2");
    console.log(response);
  });
```

#### 2. async/await

async/await 技术背后的秘密就是 Promise 和生成器应用，往低层说就是微任务和协程应用。

1. async

   根据 MDN 定义，async 是一个通过**异步执行**并**隐式返回 Promise** 作为结果的函数。

   - 异步执行
   - 隐式返回 Promise

2. await

```js
async function foo() {
  console.log(1);
  let a = await 100;
  console.log(a);
  console.log(2);
}
console.log(0);
foo();
console.log(3);
```

返回结果依次为 0->1->3->100->2

![async/await执行过程](https://ddcdn.jd.com/ddimg/jfs/t1/130633/29/7292/133954/5f3941e0E03744528/d11239b67a3a53c1.png)

1.  打印 0

2.  执行 foo，因为 foo 是 async 标记过的，引擎会保存当前调用栈信息，将主线程控制权交给 foo 协程，打印 1

3.  执行 await 100，默认创建 Promise 对象

```js
let promise_ = new Promise((resolve,reject){
  resolve(100)//将resolve提交微任务队列
})
```

引擎暂停当前 foo 协程执行，将主线程控制权交给父协程，同时将 promise\_对象返回父协程

4.  父协程调用 promise\_.then 监控 promise 状态的改变，打印 3

5.  父协程执行结束，进入微任务检查点，执行微任务队列，其中微任务队列中有 resolve(100)任务等待执行，执行 resolve 时，会触发 promise\_.then 中回调函数

```js
promise_.then((value) => {
  // 回调函数被激活后
  // 将主线程控制权交给 foo 协程，并将 vaule 值传给协程
});
```

6.  主线程控制权交给 foo 协程，同时将 value 值传给协程。
7.  foo 协程继续执行语句，执行完成后，将控制权还给父协程。

## 五、 浏览器中的页面

### 17. chrome 开发者工具

![chrome工具](https://ddcdn.jd.com/ddimg/jfs/t1/122386/37/9753/241179/5f394dd5E69765133/136e3b1eb594c81c.png)
待整理。。

### 18. DOM 树

- HTML 解析器（随着 HTML 文档加载边加载边解析）
- 网络进程和渲染进程之间会建立一个共享数据的管道
- 字节流转换 DOM 三个阶段

  1. 通过分词器将字节流转换为 Token（HTML 解析器维护一个 Token 栈）
  2. Token 解析为 DOM 节点
  3. DOM 节点添加到 DOM 树（2. 3 同步进行）

- JavaScript 会阻塞 DOM，CSS 会阻塞 JavaScript 的执行，不阻塞 JavaScript 的加载

### 19. 渲染流水线 CSS

- CSSOM
  - 提供 JavaScript 操作样式表的能力
  - 为布局树的合成提供基础的样式信息
- 缩短白屏时间

  1. 压缩文件大小
  2. JavaScript 标记 syns 和 defer
  3. CSS 文件通过媒体查询进行拆分，`<link media='' />`
     - all
     - print
     - screen
     - speech
     - 媒体特性
       - orientation（屏幕方向）
       - portrait 纵向
       - landscape 横向

### 20. 分层与合成机制

- 基础
  1. 显示器显示图像
     - 刷新频率 60HZ
     - 图片来自于显卡的前缓冲区
     - 显卡负责合成新的图像，并保存到后缓冲区
     - 前后缓冲区互换，显卡更新频率和显示器刷新频率一致
  2. 帧和频率
     - 帧率 60HZ（60FPS）
- 分层和合成
  - 为了提升每帧渲染效率，引入分层和合成机制
  - 合成操作是在合成线程完成，不影响主线程
  - 在首次合成图块时使用低分辨率的图片
  - will-change，渲染引擎将该元素单独实现一层，直接通过合成线程处理 css，这是 css 动画比 JavaScript 动画高效的原因（会增加内存）
  - 技术关键：分层. 分块. 合成

### 21. 优化页面性能

- 加载阶段

  1. 阻塞网页首次渲染的资源称为关键资源
     - 资源的个数
     - 资源的大小
     - 请求关键资源需要多少个 RTT（Round Trip Time）：TCP 请求时往返的时延，RTT 是网络中重要的性能指标，表示从发送端发送数据开始，刀发送端收到接收端的确认，总共经历的时延。一个 HTTP 数据包 14k
  2. 优化原则：减少关键资源个数，降低关键资源大小，降低关键资源 RTT 次数

     - 资源个数

       1. 内联样式（实际不操作）
       2. JavaScript sync 和 defer 模式
       3. css 媒体监听（media）

     - 大小
       - 移除注释，减少文件大小
     - RTT
       - CDN

- 交互阶段（优化帧率）

  1. 减少 JavaScript 脚本执行时间

     - JavaScript 分解任务
     - Web Workers：主线程之外的线程，可以执行 JavaScript 脚本，没有 DOM CSSOM 环境，可以执行 DOM 无关的任务

  2. 避免强制同步布局：是指 JavaScript 强制将计算样式和布局操作提前到当前的任务中
  3. 避免布局抖动（多次同步布局）
  4. 合理利用 CSS 合成动画（合成线程）
  5. 避免频繁的垃圾回收（优化存储结构，避免小颗粒对象产生）

### 22. 虚拟 DOM 和实际 DOM

1. DOM 的缺陷

- DOM 元素的变化会引起一系列渲染 ，牵一发而动全身
- 还可能引起强制同步布局和布局抖动

2. 虚拟 DOM

![虚拟DOM执行阶段](https://ddcdn.jd.com/ddimg/jfs/t1/114804/31/15209/90246/5f3bd79aE0f0e1be7/1337f9a5d4452b24.png)

- 创建阶段：虚拟 DOM 结构，反应了真实的 DOM 树的结构。
- 更新阶段：如果数据发生了变化，会根据新的数据创建一个新的虚拟 DOM，在比较两个树，找出变化的地方，并一次性更新到真实的 DOM 树上，最后渲染引擎更新渲染流水线，并生成新的页面

3. React Fiber 更新机制

- 核心算法 Fiber reconciler
- Fiber：协程的称呼叫 Fiber，让出主线程，主线程和协程交替进行

4. 双缓存：虚拟 DOM 是双缓存的实现

5. MVC 模式

   ![MVC基础结构](https://ddcdn.jd.com/ddimg/jfs/t1/123902/11/10006/123423/5f3bd934Ed0b9b630/3f6f6da4125e451e.png)

   ![基于React和Redux构建MVC模型](https://ddcdn.jd.com/ddimg/jfs/t1/143003/34/5746/108287/5f3bd97aE5e465ac3/1192abd7b168ff7f.png)

- 核心思想：将数据和视图分开
- 实现过程：
  - 控制器是用来监控 DOM 的变化，一旦 DOM 发生变化，控制器便会通知模型，让其更新数据；
  - 模型数据更新好之后，控制器会通知视图，告诉它模型的数据发生了变化；
  - 视图接收到更新消息之后，会根据模型所提供的数据来生成新的虚拟 DOM；
  - 新的虚拟 DOM 生成好之后，就需要与之前的虚拟 DOM 进行比较，找出变化的节点；
  - 比较出变化的节点之后，React 将变化的虚拟节点应用到 DOM 上，这样就会触发 DOM 节点的更新；
  - DOM 节点的变化又会触发后续一系列渲染流水线的变化，从而实现页面的更新。

### 27. 渐进式网页应用（PWA）

- web 网页的缺陷（使用网络模块）
  - 离线使用能力（弱网）
  - 消息推送
  - 一级入口（桌面）
- server worker
  - 拦截请求
  - 缓存资源
  - 可以执行 JavaScript，没有 DOM 环境，可以返回给主线程
  - 储存功能
  - https 协议

### 28. webcomponent（对内高内聚，对外低耦合）

1. 阻碍前端组件化的因素

- CSS

```js
// 伪代码
// 两个不同样式作用于同一个p标签
p {
    background-color: red;
    color: blue;
}

<p>time.geekbang</p> //第一个p

p {
    background-color: blue;
    color: blue;
}
<p>time.geekbang</p>//第二个p
```

全局属性会影响组件化，相同的样式会被覆盖

- DOM：DOM 可以被直接读取和修改

2. WebComponent 组件化开发

   三元素：

   - custom elements 自定义元素
   - shadow DOM 影子 DOM（#shadow-root）
     - 影子 DOM 中元素对于整个网页是不可见
     - 影子 DOM 的 CSS 不会影响到整个网页 CSSOM，只对内部 CSS 元素起作用
     - 影子 DOM 可以隔离 CSS 和 DOM，不会隔离 JavaScript
   - HTML templates HTML 模板

   步骤：

   - 使用 template 属性创建模板
   - 创建类
     - 查找模板内容
     - 创建影子 DOM
     - 将模板添加到影子 DOM 上
     - 使用元素

3. 浏览器如何实现影子 DOM？

   ![影子DOM](https://ddcdn.jd.com/ddimg/jfs/t1/124980/29/9959/227884/5f3bdd63E3573d8c0/d589d218adf6e2b4.png)

   - DOMAPI 无法查询影子 DOM

     过 DOM 接口去查找元素时，渲染引擎会去判断 geek-bang 属性下面的 shadow-root 元素是否是影子 DOM，如果是影子 DOM，那么就直接跳过 shadow-root 元素的查询操作。

   - CSS 样式

     当生成布局树的时候，渲染引擎也会判断 geek-bang 属性下面的 shadow-root 元素是否是影子 DOM，如果是，那么在影子 DOM 内部元素的节点选择 CSS 样式的时候，会直接使用影子 DOM 内部的 CSS 属性。

## 六、浏览器中的网络：HTTP

#### 1. 超文本传输协议 HTTP0.9

![Http0.9请求流程](https://ddcdn.jd.com/ddimg/jfs/t1/130445/37/7372/106282/5f3bdec3E248343a0/c3bf4e482678bf13.png)

- 只有请求行，没有请求头和请求体
- 没有返回头信息
- ASCII 字符流传输

#### 2. 被浏览器推动的 HTTP1.0

![HTTP1.0](https://ddcdn.jd.com/ddimg/jfs/t1/115731/27/15214/117021/5f3bdf5eEd721a3cf/d4e6e0f293149222.png)

- 支持多种类型的文件下载
- 状态码
- Cache 机制：缓存
- 用户代理

#### 3. 缝缝补补的 HTTP1.1

1. 改进持久连接

   ![HTTP1.0短连接](https://ddcdn.jd.com/ddimg/jfs/t1/141357/7/5798/183857/5f3be008E507242c6/a487d9785be5324f.png)

   **HTTP/1.1 中增加了持久连接的方法，它的特点是在一个 TCP 连接上可以传输多个 HTTP 请求，只要浏览器或者服务器没有明确断开连接，那么该 TCP 连接会一直保持**。

   ![HTTP1.1持久连接](https://ddcdn.jd.com/ddimg/jfs/t1/127918/35/9984/86912/5f3be03dE946f3de5/c876ab8fd2e33634.png)

   持久连接可以有效减少 TCP 建立连接和断开连接的次数，HTTP1.1 中默认开启

2. 不成熟的 HTTP 管线化

   队头阻塞问题

3. 提供虚拟主机的支持 Host

   增加了 Host 字段

4. 对动态生成的内容提供了完美支持

   引入（Chunk transfer 机制）

5. 客户端 Cookie 安全机制

#### 4. HTTP2

1. HTTP1.1 优化

   1. 增加了持久连接；
   2. 浏览器为每个域名最多同时维护 6 个 TCP 持久连接；
   3. 使用 CDN 的实现域名分片机制。

2. HTTP1.1 问题

带宽的利用率不理想

- TCP 慢启动
- 同时开启多条 TCP 连接，会竞争固定的带宽（不能协商关键资源的优先下载）
- 队头阻塞

3. 多路复用

![HTTP2多路复用](https://ddcdn.jd.com/ddimg/jfs/t1/115633/10/15052/204892/5f3be232Ef93c7a97/ba59fba9a5742431.png)

![HTTP2协议栈](https://ddcdn.jd.com/ddimg/jfs/t1/113665/3/15249/124196/5f3d2d57E02be825d/247193785a76baff.png)

1. 多路复用的实现：引入二进制分帧层

2. 请求和接收过程：

- 首先，浏览器准备好请求数据，包括了请求行、请求头等信息，如果是 POST 方法，那么还要有请求体。
- 这些数据经过二进制分帧层处理之后，会被转换为一个个带有请求 ID 编号的帧，通过协议栈将这些帧发送给服务器。
- 服务器接收到所有帧之后，会将所有相同 ID 的帧合并为一条完整的请求信息。
- 然后服务器处理该条请求，并将处理的响应行、响应头和响应体分别发送至二进制分帧层。
- 同样，二进制分帧层会将这些响应数据转换为一个个带有请求 ID 编号的帧，经过协议栈发送给浏览器。
- 浏览器接收到响应帧之后，会根据 ID 编号将帧的数据提交给对应的请求

从上面的流程可以看出，**通过引入二进制分帧层，就实现了 HTTP 的多路复用技术**。

4. HTTP2 其他特性

1. 可以设置请求优先级

1. 服务器推送，请求 HTML 文件时同时拿到 HTML，CSS，JavaScript 文件

1. 头部压缩

#### 5. HTTP3（未来）

1. HTTP2 问题

- TCP 队头阻塞：由于单个数据包的丢失而造成的阻塞，丢包率达到 2%时，HTTP1.1 效率更高

  ![HTTP正常传输](https://ddcdn.jd.com/ddimg/jfs/t1/120219/10/10136/58582/5f3d2f04E88d3357a/e117d930973b99f1.png)

  ![TCP丢包状态](https://ddcdn.jd.com/ddimg/jfs/t1/123605/1/10294/84222/5f3d2f31E57ea18b7/ba94c1813843a880.png)

  ![HTTP2多路复用](https://ddcdn.jd.com/ddimg/jfs/t1/144766/40/5753/62659/5f3d2f5bE64ac69af/b7aa8013b5d9f7c5.png)

- TCP 建立连接（握手）的延时（RTT）

  我们把从浏览器发送一个数据包到服务器，再从服务器返回数据包到浏览器的整个往返时间称为 RTT。

  RTT 是反映网络性能的一个重要指标。

- TCP 协议及中间设备僵化，操作系统也是导致 TCP 协议僵化的另一个原因

2. QUIC 协议

   ![HTTP2和HTTP3协议栈](https://ddcdn.jd.com/ddimg/jfs/t1/129262/3/10185/89310/5f3d2fbdEee4ecbb5/7a59e096bb6dc67f.png)

1. QUIC：基于 UDP 实现类似 TCP 多路复用数据流（解决队头阻塞），传输可靠性等功能

1. QUIC 的实现：（TCP+HTTP2 多路复用+TLS）

- 实现了类似 TCP 的流量控制. 传输可靠性的功能

- 集成 TLS 加密功能

- 实现了 HTTP2 多路复用

  ![HTTP3多路复用](https://ddcdn.jd.com/ddimg/jfs/t1/115250/12/15329/82458/5f3d3027Ed6b7b59b/4e2c7bf80dcb874c.png)

  QUIC 实现了在同一物理连接上有多个独立逻辑数据流，实现了数据流的单独传输，解决了队头阻塞

- 实现快速握手，因为是基于 UDP，0-RTT 或者 1-RTT 建立连接

3. HTTP3 挑战

- 服务器和浏览器的支持不完整
- 系统内核对 UDP 优化没有 TCP 好
- 中间设备对 UDP 优化也不好，丢包率高

## 七、浏览器网络安全

### 29. 同源策略（Same-origin）

1. 同源

   **如果两个 URL 的协议、域名和端口都相同，我们就称这两个 URL 同源**。

   同源策略主要表现在 DOM，Web 数据和网络三个方面

   1. DOM 层：同源策略限制了来自不同源的 JavaScript 脚本对当前 DOM 对象读和写的操作。
   2. 数据层：。同源策略限制了不同源的站点读取当前站点的 Cookie、IndexDB、LocalStorage 等数据。
   3. 网络层：同源策略限制了通过 XMLHttpRequest 等方式将站点的数据发送给不同源的站点。

2. 安全和便利性的权衡

   1. 页面中可以嵌入第三方资源

      为了解决 XSS 攻击，浏览器中引入了内容安全策略，称为 CSP。**CSP 的核心思想是让服务器决定浏览器能够加载哪些资源，让服务器决定浏览器是否能够执行内联 JavaScript 代码**。

   2. 跨域资源共享和跨文档消息机制

      跨域资源共享(CORS)：可以跨域访问

      跨文档消息机制：两个不同源 DOM 之间通信，可以通过`window.postMessage`通信。

### 30.跨站脚本攻击 XSS（跨站脚本，恶意注入脚本）

- 做的小坏事
  - 窃取 Cookie 信息（document.cookie）
  - 监听用户行为（addEventListener）
  - 修改 DOM，伪造假的登录窗口
  - 在页面生成浮窗广告
- 恶意脚本如何注入的

  - 1、存储型 XSS 攻击

    - 利用站点漏洞上传恶意代码到数据库
      用户想网站请求包含恶意 JavaScript 脚本的页面
      当用户浏览该页面时，恶意脚本就会将用户的 Cookie 信息上传服务器

  - 2、反射型 XSS 攻击

    - 用户将一段含有恶意代码的请求提交给 Web 服务器，Web 服务器接收到请求时，又将恶意代码反射给了浏览器端，这就是反射型 XSS 攻击。在现实生活中，黑客经常会通过 QQ 群或者邮件等渠道诱导用户去点击这些恶意链接
    - Web 服务器不会存储反射型 XSS 攻击的脚本

  - 3、基于 DOM 的 XSS 攻击：修改 HTML 页面内容

- 阻止的策略
  - 1、服务器对输入的脚本进行过滤或转码
  - 2、利用 CSP
    - 1、限制加载其他域下的资源文件
    - 2、禁止向第三方域提交数据
    - 3、禁止执行内联脚本和未授权的脚本
    - 4、提供上报机制
  - 3、使用 Cookie 的 HttpOnly 属性
    只能在 HTTP 请求中，不能在 JavaScript 中读取 cookie，不能通过 document.cookie 读取

### 31. CSRF 攻击（跨站请求伪造）

- CSRF 攻击就是黑客利用用户的登录状态，并通过第三方的站点来做坏事
  - 1、自动发起 get 请求（img）
  - 2、自动发起 POST 请求（隐藏表单）
  - 3、引诱用户点击链接
- CSRF 攻击不需要将恶意代码注入用户页面，仅仅是利用服务器的漏洞和用户登录状态来实施攻击
- 如何阻止 CSRF

  - 1、利用 cookie 的 samesite 属性：Cookie 是浏览器和服务器之间维护登录状态关键数据
    - 如果是第三方站点发起请求，就禁止发送关键 cookie
      `set-cookie：; expires=Tue, 19-Nov-2019 06:36:21 GMT; path=/; domain=.google.com; SameSite=none`
    - SameSite：Strict 浏览器完全禁止第三方 Cookie
    - SameSite：Lax 跨站点情况下，从第三方站点链接打开和第三方站点提交 GET 方式都会携带 cookie，使用 Post 方法，或者通过 img，iframe 等标签加载的 URL，不会携带 cookie
    - Samesite：none 任何情况都会发送 cookie
  - 2、验证请求的来源站点

    - Referer：记录 HTTP 请求的来源地址（包含路径等详细信息），出于安全考虑
    - Origin 属性：来源地址（不包含路径信息）

  - 3、CSRF Token：服务器生成字符串植入到页面中，并且每次请求需要传入字符串，请求没有 token 会拒绝

### 浏览器系统安全

#### 安全沙箱

![浏览器内核](https://ddcdn.jd.com/ddimg/jfs/t1/145843/1/5981/516488/5f3e3365E6e81e62a/c8d0e80f632a7931.png)
![浏览器内核和渲染流程各自职责](https://ddcdn.jd.com/ddimg/jfs/t1/133968/15/7563/113833/5f3e339fE25e98f45/a944fefcc488b641.png)

- 将渲染进程和操作系统隔离，防止黑客攻击获得渲染控制权，从而攻击操作系统
  影响
  - 1、持久储存（在浏览器内核实现）
    - 存储 Cookie 数据的读写。通常浏览器内核会维护一个存放所有 Cookie 的 Cookie 数据库，然后当渲染进程通过 JavaScript 来读取 Cookie 时，渲染进程会通过 IPC 将读取 Cookie 的信息发送给浏览器内核，浏览器内核读取 Cookie 之后再将内容返回给渲染进程。
    - 缓存文件的读写，例如网络文件缓存的读取
  - 2、网络访问
  - 3、用户交互
    - 限制渲染进程监控有用户输入事件的能力，所以事件由浏览器内核接受，在通过 IPC 将事件发送给渲染进程
- 站点隔离：将同一站点（包括相同根域名和相同协议地址）相互关联的页面放到同一渲染进程中执行

#### HTTPS

- HTTPS 协议栈中引入安全层（SSL/TLS）
  对发起 HTTP 请求数据进行加密操作和对接到 HTTP 内容进行解密操作
  ![HTTP VS HTTPS](https://ddcdn.jd.com/ddimg/jfs/t1/135235/10/7492/93562/5f3e3409E13b65d6a/80043f15f355bf59.png)

- 加密

  1. 对称加密（加密和解密使用相同的密钥）
     ![对称加密](https://ddcdn.jd.com/ddimg/jfs/t1/150005/33/5983/156348/5f3e3439E33f9d81b/10c47783ba58535f.png)
  2. 非对称加密（公钥和私钥）
     ![非对称加密](https://ddcdn.jd.com/ddimg/jfs/t1/118830/34/15342/138303/5f3e3473E6be9a8fe/eb8f2aee894660d6.png)

  非对称加密算法有 A、B 两把密钥，如果你用 A 密钥来加密，那么只能使用 B 密钥来解密；反过来，如果你要 B 密钥来加密，那么只能用 A 密钥来解密。

  公钥是每个人都能获取到的，而私钥只有服务器才能知道，不对任何人公开。

  3. 混合加密（数据用对称加密，密钥用非对称加密）
     ![混合加密](https://ddcdn.jd.com/ddimg/jfs/t1/117798/10/15282/219143/5f3e34f0E47ff2eb1/34ec58c733cd168e.png)

     - pre-master 是经过公钥加密之后传输的，所以黑客无法获取到 pre-master，这样黑客就无法生成密钥，也就保证了黑客无法破解传输过程中的数据了
     - 首先浏览器向服务器发送对称加密套件列表. 非对称加密套件列表和随机数 client-random；
     - 服务器保存随机数 client-random，选择对称加密和非对称加密的套件，- 然后生成随机数 service-random，向浏览器发送选择的加密套件. service-random 和公钥；
     - 浏览器保存公钥，并利用 client-random 和 service-random 计算出来 pre-master，然后利用公钥对 pre-master 加密，并向服务器发送加密后的数据；
     - 最后服务器拿出自己的私钥，解密出 pre-master 数据，并返回确认消息。

  4. 数字证书（保证网站是安全的，证明网站是要访问的安全网站）
     ![数字证书](https://ddcdn.jd.com/ddimg/jfs/t1/150310/2/6034/250040/5f3e3535E72c27ee6/d9362588c6cfeb07.png)

  - CA 颁发的数字证书，一证明身份，二是数字证书包含了服务器公钥
