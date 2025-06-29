# 地图文件示例

这个文件夹包含了用于测试本地地图加载功能的示例文件。

## 文件说明

### sample_map.yaml
这是一个标准的 ROS 地图配置文件，包含以下参数：

- `image`: PGM 图像文件名
- `resolution`: 地图分辨率（米/像素）
- `origin`: 地图原点坐标 [x, y, theta]
- `negate`: 是否反转颜色（0=否，1=是）
- `occupied_thresh`: 占用阈值
- `free_thresh`: 自由空间阈值

## 如何使用

1. 在 AGV 地图监控页面中选择"本地文件"模式
2. 上传您的 PGM 图像文件和对应的 YAML 配置文件
3. 点击"加载地图"按钮

## PGM 文件格式

PGM (Portable Gray Map) 是一种简单的灰度图像格式，常用于 ROS 地图：

- 文件头包含格式标识符 "P5"
- 图像尺寸（宽度 高度）
- 最大灰度值（通常是 255）
- 二进制图像数据

在占用栅格地图中：
- 0 = 障碍物（黑色）
- 255 = 自由空间（白色）
- 其他值 = 未知区域（灰色）

## 支持的功能

- 缩放（鼠标滚轮或控制按钮）
- 平移（鼠标拖拽）
- 重置视图
- 显示地图元数据信息
