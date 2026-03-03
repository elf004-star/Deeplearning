# Neural Playground

一个基于浏览器的交互式神经网络可视化工具。可在画布上拖拽节点、连接神经元，并实时调整权重与偏置。

## 快速启动

**环境要求：** Node.js 18+

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

启动后访问 [http://localhost:5173](http://localhost:5173)

## 其他命令

```bash
# 构建生产版本（输出至 dist/）
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 使用方法

- 点击底部工具栏的 **Input / Neuron / Output** 按钮添加节点
- **拖拽节点**移动位置
- **拖拽端口**（节点左右两侧的圆点）连接节点，靠近目标端口时自动吸附
- 点击连接线上的权重标签可修改权重值
