---
sidebar: auto
---

# typescript 类型挑战

> 关于 github 上[type-challenges](https://github.com/type-challenges/type-challenges)上 ts 学习代码

刷题记录

| 序号 | 题目         | 难度 | 问题 | 完成时间   |
| ---- | ------------ | ---- | ---- | ---------- |
| 4    | Pick         | 简单 |      | 2022.02.24 |
| 7    | ReadOnly     | 简单 |      | 2022.02.24 |
| 11   | 元组转对象   | 简单 |      | 2022.02.24 |
|      |              |      |      |            |
|      |              |      |      |            |
|      |              |      |      |            |
|      |              |      |      |            |
|      |              |      |      |            |
| 10   | 元组转合集   | 中等 |      | 2022.02.28 |
| 12   | 可串联构造器 | 中等 |      | 2022.02.28 |
| 15   | 最后的元素   | 中等 |      | 2022.02.28 |
| 10   | Pop          | 中等 |      | 2022.03.01 |
| 10   | Promise.all  | 中等 |      | 2022.03.02 |

## 一、Simple

### 1. Pick

题目：

实现 TS 内置的 `Pick<T, K>`，但不可以使用它。

**从类型 `T` 中选择出属性 `K`，构造成一个新的类型**。

例如：

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};
```

代码：

```ts
/**
 * extends 继承
 * keyof 获取类型所有key
 * in 指定属性在指定对象中
 */
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

### 2. ReadOnly

题目

不要使用内置的`Readonly<T>`，自己实现一个。

该 `Readonly` 会接收一个 _泛型参数_，并返回一个完全一样的类型，只是所有属性都会被 `readonly` 所修饰。

也就是不可以再对该对象的属性赋值。

例如：

```ts
interface Todo {
  title: string;
  description: string;
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar",
};

todo.title = "Hello"; // Error: cannot reassign a readonly property
todo.description = "barFoo"; // Error: cannot reassign a readonly property
```

代码：

```ts
/**
 * readonly 只读
 */
type MyReadonly<T> = { readonly [k in keyof T]: T[k] };
```

### 3. 元组转对象

题目

传入一个元组类型，将这个元组类型转换为对象类型，这个对象类型的键/值都是从元组中遍历出来。

例如：

```ts
const tuple = ["tesla", "model 3", "model X", "model Y"] as const;

type result = TupleToObject<typeof tuple>; // expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
```

代码：

```ts
type TupleToObject<T extends readonly string[]> = { [k in T[number]]: k };
```
