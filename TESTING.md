# 🧪 测试指南 - Contrast Heatmap 扩展

## ✅ 构建成功!

你的扩展已经成功编译。`dist/` 文件夹现在包含了完整的扩展。

---

## 📋 测试步骤

### 步骤 1: 在 Chrome 中加载扩展

1. **打开 Chrome**，访问 `chrome://extensions/`
2. **启用开发者模式**（右上角的开关）
3. **点击 "Load unpacked"（加载解压的扩展程序）**
4. **选择** `/Users/eden/Code/contrast-heatmap/dist/` 文件夹
5. **点击选择**

✅ 扩展现在应该出现在你的 Chrome 扩展列表中！

---

## 🎯 功能测试

### 测试 1: 弹出窗口 UI
1. **点击工具栏中的扩展图标**
2. 应该看到一个弹出窗口，包含：
   - ✅ "Enable Scanner" 开关
   - ✅ "Heatmap Opacity" 滑块
   - ✅ WCAG 等级图例
   - ✅ "Scans visible text for WCAG 2.0 contrast compliance" 文本

### 测试 2: 打开扫描功能
1. **打开任何网站**（例如 google.com、github.com）
2. **点击扩展图标，打开弹出窗口**
3. **点击 "Enable Scanner" 开关**（应该变成蓝色）
4. **返回网页**
5. **应该看到彩色叠加层**出现在文本上：
   - 🔵 **蓝色** = 对比度失败 (< 4.5:1)
   - 🟠 **橙色** = AA 级别 (4.5:1 - 6.9:1)
   - 🔴 **红色** = AAA 级别 (7:1+)

### 测试 3: 不透明度滑块
1. **打开扩展弹出窗口**
2. **调整 "Heatmap Opacity" 滑块**（从 10% 到 80%）
3. **网页上的叠加层应该相应变得更透明或更不透明**

### 测试 4: 关闭扫描功能
1. **点击 "Enable Scanner" 开关关闭**（应该变成灰色）
2. **网页上的彩色叠加层应该消失**

### 测试 5: 状态持久化
1. **启用扫描功能**
2. **调整不透明度到 50%**
3. **关闭弹出窗口**
4. **重新打开弹出窗口**
5. ✅ **状态应该被保存**（扫描仍然启用，不透明度仍然是 50%）

---

## 🔍 调试

### 查看控制台错误

#### 查看弹出窗口错误
```
1. 右键点击扩展弹出窗口
2. 选择 "Inspect"
3. 打开 DevTools 并检查 Console 标签
```

#### 查看内容脚本错误
```
1. 在任何网页上打开 DevTools (F12)
2. 进入 Console 标签
3. 应该看到内容脚本的日志
```

#### 查看服务工作线程错误
```
1. 打开 chrome://extensions/
2. 找到 "Contrast Heatmap"
3. 点击 "Details"
4. 在 "Inspect views" 部分，点击 "service worker"
```

---

## 📊 测试清单

- [ ] 扩展在 Chrome 中加载成功
- [ ] 弹出窗口 UI 显示正确
- [ ] "Enable Scanner" 开关有效
- [ ] 彩色叠加层出现在文本上
- [ ] 蓝色、橙色、红色颜色正确
- [ ] "Heatmap Opacity" 滑块有效
- [ ] 关闭开关时叠加层消失
- [ ] 状态在刷新后保持
- [ ] 没有 JavaScript 错误
- [ ] 性能良好（无卡顿）

---

## 🌐 建议的测试网站

| 网站 | 用途 |
|------|------|
| [Google.com](https://google.com) | 简单，明确的对比度 |
| [GitHub.com](https://github.com) | 复杂的布局，多种对比度 |
| [WebAIM 对比度检查器](https://webaim.org/resources/contrastchecker/) | 参考标准 |
| [MDN Web Docs](https://developer.mozilla.org/) | 好的例子 |
| 本地网站 | 测试不同的文本样式 |

---

## 💡 调试技巧

### 1. 检查存储状态
在任何网页的 DevTools 中运行：
```javascript
chrome.storage.local.get(['enabled', 'opacity'], (result) => {
  console.log('Storage:', result);
});
```

### 2. 手动触发扫描
```javascript
// 从网页 DevTools 控制台
chrome.runtime.sendMessage(
  { type: 'ENABLE_HEATMAP' },
  (response) => console.log(response)
);
```

### 3. 清除存储
```javascript
chrome.storage.local.clear();
console.log('Storage cleared');
```

### 4. 重新加载扩展
```
1. 打开 chrome://extensions/
2. 找到 "Contrast Heatmap"
3. 点击刷新图标（⟲）
```

---

## 🚀 开发模式测试

如果你想在开发期间进行实时更改：

```bash
# 在一个终端中启动开发服务器
npm run dev

# 在另一个终端中监视构建
npm run build -- --watch

# 或者只是运行一次构建
npm run build
```

然后在 `chrome://extensions/` 中点击刷新按钮以重新加载扩展。

---

## 📱 跨浏览器兼容性

这个扩展使用 **Manifest V3**，兼容：
- ✅ Chrome / Chromium (v88+)
- ✅ Edge
- ✅ Brave
- ✅ Opera

---

## 🐛 常见问题

### 问题: 扩展不出现
**解决方案**:
- 检查 `dist/manifest.json` 是否存在
- 尝试重新加载扩展
- 查看 Chrome 扩展页面的错误消息

### 问题: 弹出窗口为空白
**解决方案**:
- 打开 DevTools（右键 > Inspect）
- 检查 Console 是否有错误
- 检查 Network 标签是否有加载失败

### 问题: 叠加层不出现
**解决方案**:
- 检查网页 DevTools Console 是否有错误
- 确保已启用扫描功能
- 尝试刷新页面
- 检查页面中是否有文本（某些网站可能不兼容）

### 问题: 颜色看起来不对
**解决方案**:
- 检查 `src/utils/color.js` 中的 RGB 值
- 验证 `getHeatmapColor()` 函数
- 比较与 WebAIM 对比度检查器的结果

---

## 📈 性能测试

如果扩展运行缓慢，请检查：

1. **MutationObserver 频率**
   - 编辑 `src/content/index.js` 中的防抖超时（目前为 500ms）

2. **TreeWalker 效率**
   - 考虑跳过某些元素类型

3. **Canvas 绘制优化**
   - 减少重绘频率

---

## ✅ 完成测试后

一旦你验证了所有功能都正常工作：

1. **运行生产构建**
   ```bash
   npm run build
   ```

2. **将扩展发布到 Chrome Web Store**（可选）

3. **与他人分享反馈**（可选）

---

## 📞 需要帮助？

检查这些文档文件：
- `QUICKSTART.md` - 快速开始
- `SETUP.md` - 详细的设置指南
- `CODE_REFERENCE.md` - 函数参考
- `CONFIGURATION.md` - 配置详情

---

## 🎉 测试完成！

你现在有一个完全可运行的 Chrome 扩展！

享受测试吧！ 🚀

---

**祝你的 Contrast Heatmap 扩展测试顺利！**
