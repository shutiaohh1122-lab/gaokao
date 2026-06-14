# 高考历年录取分数查询系统

## 1. 产品需求文档（PRD）

### 1.1 项目定位
高考历年录取分数查询系统面向高中生、考生、家长与志愿填报用户，提供基于省份、年份、科类、院校、专业的多维查询，帮助用户更快完成院校筛选、专业判断与志愿决策。

### 1.2 核心目标
- 查询某省份、某年份、某大学、某专业的历年录取分数和位次
- 查看大学详情、专业详情与录取趋势
- 提供基于分数输入的冲刺、稳妥、保底院校推荐
- 覆盖 34 个省级地区，并具备承接全国院校目录、专业目录与真实招录数据的能力

### 1.3 核心用户场景
- 学生按省份和科类快速查某大学专业录取门槛
- 家长对比不同学校近年分数和位次波动
- 志愿填报用户根据当前分数获取院校推荐
- 用户进入大学页或专业页进一步查看趋势与招生计划

### 1.4 MVP 功能范围
- 首页
  - 标题、副标题、快捷入口、核心查询区
  - 省份、年份、科类、大学、专业筛选
  - 智能推荐模块
- 查询结果页
  - 表格展示年份、省份、大学、专业、最低分、最低位次、招生人数
  - 支持分页、排序、搜索、筛选
  - 手机端卡片模式
- 大学详情页
  - 学校简介
  - 985、211、双一流等层次标签
  - 历年分数趋势图和位次趋势图
  - 热门专业分布图
  - 专业录取情况与招生计划
- 专业详情页
  - 专业介绍
  - 就业方向
  - 历年录取分数与位次趋势图
  - 各院校专业录取样本

### 1.5 非功能要求
- Next.js + TypeScript + TailwindCSS
- 使用 Mock Data，便于后续接数据库
- 响应式设计
- 深色模式
- Loading 状态
- Empty 状态

### 1.6 当前数据说明
- 省级地区：已扩展到 `34` 个省级行政区
- 院校目录：当前内置“可导入结构”，已包含演示院校和扩展目录入口
- 专业目录：当前内置“可导入结构”，已包含演示专业和扩展目录入口
- 历年录取分数：当前仍为高质量 Mock 数据，用于演示完整交互、图表和推荐链路
- 如果目标是“全国所有大学所有专业历年录取分数”，下一阶段必须接入真实数据库和正式数据源

### 1.7 后续迭代方向
- 接入真实数据库与后台管理系统
- 院校对比、专业对比、收藏和最近查询
- 细化推荐逻辑，引入位次、计划数波动、城市偏好和专业偏好
- 导入全国院校名录、专业目录与逐省逐年招录明细

## 2. 页面结构图

```text
首页 /
├── 顶部导航
├── Hero 信息区
├── 查询面板
├── 热门入口
├── 各省录取对比图
└── 智能推荐模块

查询结果页 /results
├── 查询条件概览
├── 结果表格（桌面端）
├── 结果卡片（移动端）
├── 分页控件
└── 后续扩展能力提示

大学详情页 /universities/[id]
├── 学校头部信息
├── 层次标签与简介
├── 指标概览卡片
├── 分数趋势图
├── 位次趋势图
├── 专业录取表
└── 热门专业热度图

专业详情页 /majors/[id]
├── 专业头部信息
├── 专业介绍 / 就业方向 / 核心课程
├── 分数趋势图
├── 位次趋势图
└── 各院校录取样本表
```

## 3. 数据库设计

### 3.1 核心实体

#### Province
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 省份唯一标识 |
| name | string | 省份名称 |
| region | string | 大区 |
| subjects | string[] | 支持的科类 |

#### Year
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| value | number | 年份值 |
| label | string | 年份展示文案 |

#### University
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 学校唯一标识 |
| name | string | 学校名称 |
| city | string | 所在城市 |
| province | string | 所在省份 |
| type | string | 院校类型 |
| tierTags | string[] | 985 / 211 / 双一流 |
| slogan | string | 校训 |
| description | string | 学校简介 |
| foundedYear | number | 建校年份 |
| affiliation | string | 隶属单位 |
| dominantMajors | string[] | 热门专业 |
| graduateRate | number | 升学比例 |
| employmentRate | number | 就业比例 |

#### Major
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 专业唯一标识 |
| name | string | 专业名称 |
| category | string | 专业门类 |
| degree | string | 学位 |
| duration | string | 学制 |
| tuition | number | 学费 |
| subjectRequirements | string | 选科要求 |
| overview | string | 专业介绍 |
| careers | string[] | 就业方向 |
| courses | string[] | 核心课程 |
| heat | number | 热度值 |

#### AdmissionScore
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 唯一记录 ID |
| provinceId | string | 省份 ID |
| year | number | 年份 |
| subjectType | string | 科类 |
| universityId | string | 学校 ID |
| majorId | string | 专业 ID |
| batch | string | 录取批次 |
| planCount | number | 招生计划 |
| admittedCount | number | 实际录取人数 |
| minScore | number | 最低分 |
| avgScore | number | 平均分 |
| maxScore | number | 最高分 |
| minRank | number | 最低位次 |
| avgRank | number | 平均位次 |
| provinceControlLine | number | 省控线 |
| scoreGap | number | 线差 |

### 3.2 后续真实数据库建议
- `PostgreSQL` 或 `MySQL`
- ORM 可选 `Prisma`
- 建议索引
  - `admission_scores (province_id, year, subject_type)`
  - `admission_scores (university_id, major_id)`
  - `universities (name)`
  - `majors (name)`

### 3.3 面向全国全量数据的补充表设计

#### university_catalog
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 院校目录 ID |
| name | string | 院校名称 |
| aliases | json | 别名 |
| city | string | 城市 |
| province | string | 省份 |
| type | string | 院校类型 |
| tier_tags | json | 层次标签 |
| affiliation | string | 隶属 |
| source | string | 数据来源 |

#### major_catalog
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 专业目录 ID |
| name | string | 专业名称 |
| category | string | 专业门类 |
| level | string | 本科/专科 |
| subject_requirements | string | 选科要求 |
| source | string | 数据来源 |

#### admission_import_jobs
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 导入任务 ID |
| province_id | string | 省份 |
| year | number | 年份 |
| source_file | string | 原始文件 |
| status | string | pending / running / success / failed |
| imported_rows | number | 导入行数 |
| created_at | datetime | 创建时间 |

## 4. API 设计

### 4.1 首页统计
- `GET /api/summary`
- 返回平台基础统计信息

### 4.2 查询结果
- `GET /api/admissions`
- Query 参数
  - `provinceId`
  - `year`
  - `subjectType`
  - `universityKeyword`
  - `majorKeyword`
  - `sortBy`
  - `order`
  - `page`
  - `pageSize`

### 4.2.1 全国目录搜索
- `GET /api/catalog/universities`
- `GET /api/catalog/majors`
- 用于接入真实院校库和专业库后的模糊搜索、联想和筛选

### 4.2.2 录取查询返回结构
- `GET /api/admissions`
- 返回字段包含：
  - `provinceName`
  - `universityName`
  - `universityTags`
  - `majorName`
  - `minScore`
  - `avgScore`
  - `maxScore`
  - `minRank`
  - `avgRank`
  - `pagination`
- 结果页可以直接消费，无需前端再次根据 ID 拼名称

### 4.3 院校详情
- `GET /api/universities/:id`
- 返回学校基本信息、趋势数据、热门专业、招生计划

### 4.4 专业详情
- `GET /api/majors/:id`
- 返回专业介绍、就业方向、趋势数据、录取样本

### 4.5 推荐接口
- `POST /api/recommendations`
- 请求体
  - `provinceId`
  - `score`
  - `subjectType`
- 返回
  - `冲刺院校`
  - `稳妥院校`
  - `保底院校`
  - `推荐理由`

### 4.6 数据导入接口
- `POST /api/import/catalogs`
  - 导入省份、院校目录、专业目录
- `POST /api/import/admissions`
  - 导入逐省逐年录取明细
- 当前支持 JSON 请求体，适合先把 CSV / Excel 转换后的结构贴进后台页验证

### 4.7 导入前校验接口
- `POST /api/import/catalogs/validate`
- `POST /api/import/admissions/validate`
- 返回内容包括：
  - 总行数
  - 可导入行数
  - 错误数
  - 警告数
  - 问题列表

## 5. 项目目录结构

```text
app/
  api/
    summary/route.ts
  majors/[id]/page.tsx
  results/page.tsx
  universities/[id]/page.tsx
  globals.css
  layout.tsx
  loading.tsx
  not-found.tsx
  page.tsx
components/
  charts.tsx
  recommendation-panel.tsx
  search-panel.tsx
  site-header.tsx
  theme-toggle.tsx
data/
  import/
    admissions.sample.json
    majors.sample.json
    provinces.sample.json
    universities.sample.json
docs/
  gaokao-system-plan.md
lib/
  data-source.ts
  mock-data.ts
  prisma.ts
  types.ts
  utils.ts
prisma/
  schema.prisma
scripts/
  import-admissions.ts
  import-catalogs.ts
  prisma-client.ts
public/
  原有静态资源保留
```

## 6. 完整代码

完整代码已在当前工作区实现，核心页面和模块位于：
- [首页](/Users/jelly/Documents/New%20project/app/page.tsx)
- [查询结果页](/Users/jelly/Documents/New%20project/app/results/page.tsx)
- [大学详情页](/Users/jelly/Documents/New%20project/app/universities/[id]/page.tsx)
- [专业详情页](/Users/jelly/Documents/New%20project/app/majors/[id]/page.tsx)
- [数据模型与 Mock 数据](/Users/jelly/Documents/New%20project/lib/mock-data.ts)
- [统一数据源入口](/Users/jelly/Documents/New%20project/lib/data-source.ts)
- [Prisma Schema](/Users/jelly/Documents/New%20project/prisma/schema.prisma)
- [类型定义](/Users/jelly/Documents/New%20project/lib/types.ts)

## 7. 本地运行步骤

1. 安装依赖
   - `npm install`
2. 启动开发环境
   - `npm run dev`
3. 浏览器打开
   - `http://localhost:3000`
4. 生产构建验证
   - `npm run build`

### 7.1 当你要接入“全国所有大学所有专业”真实数据时
1. 准备全国院校目录数据
2. 准备全国本科专业目录数据
3. 准备逐省逐年录取分数与位次数据
4. 编写导入脚本写入 `university_catalog`、`major_catalog`、`admission_scores`
5. 将前端搜索从本地 mock 切换到数据库 API

### 7.2 当前已经具备的真实数据底座
1. Prisma Schema 已创建
2. SQLite 本地数据库配置已预留
3. 院校/专业/省份目录导入脚本已创建
4. 录取数据导入脚本已创建
5. 前端已具备 `mock / database` 双数据源切换结构

### 7.3 切换到数据库模式的步骤
1. 复制环境变量模板
   - 将 `.env.example` 复制为 `.env`
2. 设置环境变量
   - `DATABASE_URL="file:/private/tmp/gaokao.db"`
   - `DATA_SOURCE="database"`
3. 安装依赖
   - `npm install`
4. 生成 Prisma Client
   - `npm run prisma:generate`
5. 创建数据库表
   - `npm run prisma:push`
6. 导入基础目录
   - `npm run import:catalogs`
7. 导入录取数据
   - `npm run import:admissions`
8. 启动项目
   - `npm run dev`

### 7.4 当前导入脚本说明
- `scripts/import-catalogs.ts`
  - 导入省份、院校目录、专业目录
- `scripts/import-admissions.ts`
  - 导入历年录取分数数据
- `data/import/*.sample.json`
  - 作为样例结构，可替换成真实数据文件

### 7.4.1 后台导入台
- 路径：`/admin/import`
- 支持上传 `CSV / Excel`
- 支持预览首个工作表数据
- 支持逐列字段映射
- 支持将映射结果预览成导入 JSON
- 当前适合做字段校验、目录关系验证、样例入库

### 7.5 真实数据字段映射建议

#### 全国院校目录 -> universities
| 原始字段 | 目标字段 |
| --- | --- |
| 学校代码 | id |
| 学校名称 | name |
| 所在城市 | city |
| 所在省份 | province |
| 院校类型 | type |
| 院校层次 | tierTags |
| 隶属单位 | affiliation |

#### 本科专业目录 -> majors
| 原始字段 | 目标字段 |
| --- | --- |
| 专业代码 | id |
| 专业名称 | name |
| 专业门类 | category |
| 学位授予门类 | degree |
| 修业年限 | duration |
| 选科要求 | subjectRequirements |

#### 录取数据明细 -> admission_scores
| 原始字段 | 目标字段 |
| --- | --- |
| 省份 | provinceId |
| 年份 | year |
| 科类 | subjectType |
| 学校代码 | universityId |
| 专业代码 | majorId |
| 批次 | batch |
| 招生计划 | planCount |
| 实录人数 | admittedCount |
| 最低分 | minScore |
| 平均分 | avgScore |
| 最高分 | maxScore |
| 最低位次 | minRank |
| 平均位次 | avgRank |
| 省控线 | provinceControlLine |
| 线差 | scoreGap |

### 7.6 CSV / Excel 上传工作流
1. 进入 `/admin/import`
2. 选择导入类型
   - 省份目录
   - 院校目录
   - 专业目录
   - 录取明细
3. 上传 `csv / xlsx / xls`
4. 系统自动读取第一个工作表并展示表头
5. 手动将原始列映射到系统字段
6. 先点击“校验”
7. 检查前 5 行预览、映射结果 JSON 和校验报告
8. 确认无误后提交导入

### 7.7 当前校验报告覆盖的问题类型
- 必填字段缺失
- 数字字段格式错误
- 同一批数据内的重复 ID
- 录取数据里的省份 ID 不存在
- 录取数据里的学校 ID 不存在
- 录取数据里的专业 ID 不存在

### 7.9 自动匹配建议机制
- 当 `provinceId / universityId / majorId` 缺失或无效时
- 系统会尝试使用这些名称列做精确匹配：
  - `provinceName / province / 省份 / 生源地`
  - `universityName / university / schoolName / 学校名称 / 院校名称`
  - `majorName / major / 专业名称`
- 如果唯一命中：
  - 校验报告会给出建议值
  - 实际导入时会自动补齐缺失 ID
- 如果没有命中：
  - 校验报告会保留错误，要求先补目录或修正名称

### 7.10 批量修复工作流
1. 上传数据文件
2. 完成字段映射
3. 点击“先校验”
4. 在报告里查看建议
5. 点击“应用建议”
   - 将建议值回填到当前导入结果
   - 不会修改原始文件本身
6. 如果仍有问题，点击“导出问题行”
   - 生成带 `__issues` 列的 Excel 文件
   - 便于线下批量修正后重新导入

### 7.11 部分导入模式
- `导入全部映射行`
  - 不区分校验结果，直接提交当前映射数据
- `仅导入校验通过行`
  - 自动跳过存在错误的行
  - 导入结果中会显示跳过行数
  - 适合全国大批量数据先分批落库

### 7.12 多 Sheet 自动识别
- 上传 Excel 后，系统会读取全部工作表
- 如果存在多个 sheet：
  - 可手动切换当前工作表
  - 系统会根据表头自动猜测更像哪种数据
    - 省份目录
    - 院校目录
    - 专业目录
    - 录取明细
- 自动识别只是默认建议，仍然可以手动修改数据类型和字段映射

### 7.8 常见导入顺序建议
1. 先导入省份目录
2. 再导入院校目录
3. 再导入专业目录
4. 最后导入录取明细

## 8. Vercel 部署步骤

1. 将当前项目推送到 Git 仓库
2. 登录 [Vercel](https://vercel.com/)
3. 导入该仓库
4. Framework Preset 选择 `Next.js`
5. 构建命令使用默认值 `next build`
6. 输出目录保持默认
7. 点击 Deploy

### 8.1 后续部署建议
- 接入真实数据库后，将数据库连接串写入 Vercel Environment Variables
- 将推荐逻辑和查询逻辑迁移到 API Route 或 Server Action
- 使用 ISR 或缓存策略降低高频查询开销
