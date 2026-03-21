# 中医药图像数据集筛选（识别任务）

## 筛选标准
- 有论文或期刊数据文章背书（优先 Data in Brief / Scientific Data）
- 有公开可访问的数据仓库（Mendeley / Figshare）
- 任务与本项目匹配（中药材/药用植物图像分类）
- 明确许可协议，便于训练和发布

## 推荐优先级

### 1) TCMP-300（优先作为主训练集）
- 论文：Scientific Data 2025，`TCMP-300: A Comprehensive Traditional Chinese Medicinal Plant Dataset for Plant Recognition`
- 规模：`52,089` 张图像，`300` 类（细粒度药用植物）
- 数据来源与清洗：文中说明了爬取 + 自动清洗 + 专家复核
- 数据链接（论文指向）：`10.6084/m9.figshare.29432726`
- 参考：
  - https://www.nature.com/articles/s41597-025-05522-7
  - https://doi.org/10.6084/m9.figshare.29432726

### 2) NB-TCM-CHM（优先作为药材果实域适配集）
- 论文：Data in Brief 2024，`NB-TCM-CHM: Image dataset of the Chinese herbal medicine fruits...`
- 规模：`3,384`（网页抓取）+ `400`（药房手机实拍），共 `20` 类
- 特点：包含实拍域数据，适合做真实场景微调与域泛化验证
- 数据链接：Mendeley Data，`10.17632/2kjmzjyrmd.2`（建议使用最新版本）
- 参考：
  - https://doi.org/10.1016/j.dib.2024.110405
  - https://data.mendeley.com/datasets/2kjmzjyrmd/2

### 3) Chinese medicinal blossom-dataset（可作补充）
- 论文：Data in Brief 2021，`Image dataset on the Chinese medicinal blossoms...`
- 规模：原始 `1,716`，增强后 `12,538`，`12` 类
- 特点：类别少，但标注结构清晰，可用于快速验证训练流程
- 数据链接：Mendeley Data，`10.17632/r3z6vp396m.2`
- 参考：
  - https://doi.org/10.1016/j.dib.2021.107655
  - https://data.mendeley.com/datasets/r3z6vp396m/2

## 给本项目的落地建议
- 训练主线：`TCMP-300` 预训练/主训练 -> `NB-TCM-CHM` 微调
- 快速验证：先用 `Chinese medicinal blossom` 跑通训练-评估闭环
- 类别对齐：将外部数据的类别名映射到本项目内置类别（中文名/学名）
- 评估策略：
  - 随机划分验证集（至少 20%）
  - 单独保留“手机实拍”测试集（优先 NB-TCM-CHM Dataset 2）
  - 输出 Top-1 / Top-3 准确率、混淆矩阵
