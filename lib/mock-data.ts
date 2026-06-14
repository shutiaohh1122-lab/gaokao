import {
  AdmissionScore,
  DataCatalogManifest,
  Major,
  MajorCatalogEntry,
  Province,
  RecommendationResult,
  SearchFilters,
  University,
  UniversityCatalogEntry,
  YearOption
} from "@/lib/types";

export const provinces: Province[] = [
  { id: "beijing", name: "北京", region: "华北", subjects: ["综合"] },
  { id: "tianjin", name: "天津", region: "华北", subjects: ["综合"] },
  { id: "hebei", name: "河北", region: "华北", subjects: ["物理", "历史"] },
  { id: "shanxi", name: "山西", region: "华北", subjects: ["理科", "文科"] },
  { id: "inner-mongolia", name: "内蒙古", region: "华北", subjects: ["理科", "文科"] },
  { id: "liaoning", name: "辽宁", region: "东北", subjects: ["物理", "历史"] },
  { id: "jilin", name: "吉林", region: "东北", subjects: ["理科", "文科"] },
  { id: "heilongjiang", name: "黑龙江", region: "东北", subjects: ["物理", "历史"] },
  { id: "shanghai", name: "上海", region: "华东", subjects: ["综合"] },
  { id: "jiangsu", name: "江苏", region: "华东", subjects: ["物理", "历史"] },
  { id: "zhejiang", name: "浙江", region: "华东", subjects: ["综合"] },
  { id: "anhui", name: "安徽", region: "华东", subjects: ["物理", "历史"] },
  { id: "fujian", name: "福建", region: "华东", subjects: ["物理", "历史"] },
  { id: "jiangxi", name: "江西", region: "华东", subjects: ["物理", "历史"] },
  { id: "shandong", name: "山东", region: "华东", subjects: ["综合"] },
  { id: "henan", name: "河南", region: "华中", subjects: ["理科", "文科"] },
  { id: "hubei", name: "湖北", region: "华中", subjects: ["物理", "历史"] },
  { id: "hunan", name: "湖南", region: "华中", subjects: ["物理", "历史"] },
  { id: "guangdong", name: "广东", region: "华南", subjects: ["物理", "历史"] },
  { id: "guangxi", name: "广西", region: "华南", subjects: ["物理", "历史"] },
  { id: "hainan", name: "海南", region: "华南", subjects: ["综合"] },
  { id: "chongqing", name: "重庆", region: "西南", subjects: ["物理", "历史"] },
  { id: "sichuan", name: "四川", region: "西南", subjects: ["理科", "文科"] },
  { id: "guizhou", name: "贵州", region: "西南", subjects: ["物理", "历史"] },
  { id: "yunnan", name: "云南", region: "西南", subjects: ["理科", "文科"] },
  { id: "tibet", name: "西藏", region: "西南", subjects: ["理科", "文科"] },
  { id: "shaanxi", name: "陕西", region: "西北", subjects: ["理科", "文科"] },
  { id: "gansu", name: "甘肃", region: "西北", subjects: ["理科", "文科"] },
  { id: "qinghai", name: "青海", region: "西北", subjects: ["理科", "文科"] },
  { id: "ningxia", name: "宁夏", region: "西北", subjects: ["理科", "文科"] },
  { id: "xinjiang", name: "新疆", region: "西北", subjects: ["理科", "文科"] },
  { id: "hong-kong", name: "香港", region: "港澳台", subjects: ["综合"] },
  { id: "macao", name: "澳门", region: "港澳台", subjects: ["综合"] },
  { id: "taiwan", name: "台湾", region: "港澳台", subjects: ["综合"] }
];

export const years: YearOption[] = [2025, 2024, 2023, 2022, 2021].map((value) => ({
  value,
  label: `${value} 年`
}));

export const universities: University[] = [
  {
    id: "tsinghua",
    name: "清华大学",
    city: "北京",
    province: "北京",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "自强不息，厚德载物",
    description: "以理工科见长的顶尖研究型大学，拥有强势的工科、计算机、经济管理与交叉学科平台。",
    foundedYear: 1911,
    affiliation: "教育部",
    dominantMajors: ["计算机科学与技术", "人工智能", "临床医学"],
    graduateRate: 86,
    employmentRate: 97
  },
  {
    id: "peking",
    name: "北京大学",
    city: "北京",
    province: "北京",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "爱国、进步、民主、科学",
    description: "文理医工多学科均衡发展的综合性大学，人文学科和基础学科优势突出。",
    foundedYear: 1898,
    affiliation: "教育部",
    dominantMajors: ["法学", "临床医学", "经济学"],
    graduateRate: 88,
    employmentRate: 96
  },
  {
    id: "fudan",
    name: "复旦大学",
    city: "上海",
    province: "上海",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "博学而笃志，切问而近思",
    description: "以上海为中心的高水平研究型大学，在新闻传播、医学、经济管理等方向影响力突出。",
    foundedYear: 1905,
    affiliation: "教育部",
    dominantMajors: ["新闻学", "临床医学", "软件工程"],
    graduateRate: 81,
    employmentRate: 95
  },
  {
    id: "sjtu",
    name: "上海交通大学",
    city: "上海",
    province: "上海",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "饮水思源，爱国荣校",
    description: "工科、医学、船舶海洋与人工智能方向强势，产学研联系紧密。",
    foundedYear: 1896,
    affiliation: "教育部",
    dominantMajors: ["电子信息工程", "机械工程", "人工智能"],
    graduateRate: 79,
    employmentRate: 96
  },
  {
    id: "zju",
    name: "浙江大学",
    city: "杭州",
    province: "浙江",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "求是创新",
    description: "综合实力强、学科覆盖广，在工科、农业、医学、计算机等领域全面领先。",
    foundedYear: 1897,
    affiliation: "教育部",
    dominantMajors: ["计算机科学与技术", "自动化", "临床医学"],
    graduateRate: 76,
    employmentRate: 95
  },
  {
    id: "nju",
    name: "南京大学",
    city: "南京",
    province: "江苏",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "诚朴雄伟，励学敦行",
    description: "基础学科扎实，人文社科和自然科学并重，科研氛围浓厚。",
    foundedYear: 1902,
    affiliation: "教育部",
    dominantMajors: ["天文学", "软件工程", "金融学"],
    graduateRate: 80,
    employmentRate: 94
  },
  {
    id: "whu",
    name: "武汉大学",
    city: "武汉",
    province: "湖北",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "自强 弘毅 求是 拓新",
    description: "测绘、法学、新闻传播、遥感与医学方向突出，校园综合资源丰富。",
    foundedYear: 1893,
    affiliation: "教育部",
    dominantMajors: ["法学", "测绘工程", "计算机科学与技术"],
    graduateRate: 73,
    employmentRate: 93
  },
  {
    id: "hust",
    name: "华中科技大学",
    city: "武汉",
    province: "湖北",
    type: "理工",
    tierTags: ["985", "211", "双一流"],
    slogan: "明德厚学，求是创新",
    description: "工科和医学兼强，光电、机械、临床医学是其核心优势板块。",
    foundedYear: 1952,
    affiliation: "教育部",
    dominantMajors: ["光电信息科学与工程", "机械工程", "临床医学"],
    graduateRate: 70,
    employmentRate: 95
  },
  {
    id: "sysu",
    name: "中山大学",
    city: "广州",
    province: "广东",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "博学 审问 慎思 明辨 笃行",
    description: "华南地区综合实力强校，医学、工商管理、海洋科学与电子信息都较有竞争力。",
    foundedYear: 1924,
    affiliation: "教育部",
    dominantMajors: ["临床医学", "工商管理", "电子信息工程"],
    graduateRate: 74,
    employmentRate: 94
  },
  {
    id: "scut",
    name: "华南理工大学",
    city: "广州",
    province: "广东",
    type: "理工",
    tierTags: ["985", "211", "双一流"],
    slogan: "博学慎思，明辨笃行",
    description: "建筑、轻工、材料、电子信息等专业优势明显，与粤港澳大湾区产业联系紧密。",
    foundedYear: 1952,
    affiliation: "教育部",
    dominantMajors: ["建筑学", "材料科学与工程", "计算机科学与技术"],
    graduateRate: 68,
    employmentRate: 95
  },
  {
    id: "xmu",
    name: "厦门大学",
    city: "厦门",
    province: "福建",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "自强不息，止于至善",
    description: "经管、海洋、化学与新闻传播表现突出，区位与国际化优势较好。",
    foundedYear: 1921,
    affiliation: "教育部",
    dominantMajors: ["会计学", "海洋科学", "新闻学"],
    graduateRate: 71,
    employmentRate: 93
  },
  {
    id: "sdu",
    name: "山东大学",
    city: "济南",
    province: "山东",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "学无止境，气有浩然",
    description: "综合实力稳健，数学、临床医学、材料学与人文学科基础扎实。",
    foundedYear: 1901,
    affiliation: "教育部",
    dominantMajors: ["数学与应用数学", "临床医学", "材料科学与工程"],
    graduateRate: 66,
    employmentRate: 92
  },
  {
    id: "hit",
    name: "哈尔滨工业大学",
    city: "哈尔滨",
    province: "黑龙江",
    type: "理工",
    tierTags: ["985", "211", "双一流"],
    slogan: "规格严格，功夫到家",
    description: "航天、控制、计算机和机械工程方向实力强劲，工科底色鲜明。",
    foundedYear: 1920,
    affiliation: "工业和信息化部",
    dominantMajors: ["飞行器设计与工程", "控制科学与工程", "软件工程"],
    graduateRate: 69,
    employmentRate: 96
  },
  {
    id: "uestc",
    name: "电子科技大学",
    city: "成都",
    province: "四川",
    type: "理工",
    tierTags: ["985", "211", "双一流"],
    slogan: "求实求真，大气大为",
    description: "电子信息特色鲜明，通信、集成电路、计算机方向就业竞争力高。",
    foundedYear: 1956,
    affiliation: "教育部",
    dominantMajors: ["通信工程", "电子科学与技术", "人工智能"],
    graduateRate: 67,
    employmentRate: 96
  },
  {
    id: "scu",
    name: "四川大学",
    city: "成都",
    province: "四川",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "海纳百川，有容乃大",
    description: "医学、口腔、文学、材料与计算机方向较强，是西南地区重要综合性大学。",
    foundedYear: 1896,
    affiliation: "教育部",
    dominantMajors: ["口腔医学", "汉语言文学", "软件工程"],
    graduateRate: 65,
    employmentRate: 92
  },
  {
    id: "hnu",
    name: "湖南大学",
    city: "长沙",
    province: "湖南",
    type: "综合",
    tierTags: ["985", "211", "双一流"],
    slogan: "实事求是，敢为人先",
    description: "土木、机械、设计与经济管理兼有优势，办学风格务实。",
    foundedYear: 1903,
    affiliation: "教育部",
    dominantMajors: ["工业设计", "机械设计制造及其自动化", "金融学"],
    graduateRate: 63,
    employmentRate: 91
  },
  {
    id: "cuhk-sz",
    name: "香港中文大学（深圳）",
    city: "深圳",
    province: "广东",
    type: "综合",
    tierTags: ["双一流"],
    slogan: "结合传统与现代，融会中国与西方",
    description: "国际化特色鲜明，金融科技、数据科学、经管类专业热度高。",
    foundedYear: 2014,
    affiliation: "广东省",
    dominantMajors: ["数据科学与大数据技术", "金融学", "统计学"],
    graduateRate: 58,
    employmentRate: 95
  },
  {
    id: "szu",
    name: "深圳大学",
    city: "深圳",
    province: "广东",
    type: "综合",
    tierTags: ["双一流建设高校候选"],
    slogan: "自立、自律、自强",
    description: "区位优势强，计算机、电子信息、建筑学与金融相关专业热度较高。",
    foundedYear: 1983,
    affiliation: "广东省",
    dominantMajors: ["计算机科学与技术", "电子信息工程", "建筑学"],
    graduateRate: 57,
    employmentRate: 93
  },
  {
    id: "jnu",
    name: "暨南大学",
    city: "广州",
    province: "广东",
    type: "综合",
    tierTags: ["211", "双一流"],
    slogan: "忠信笃敬",
    description: "新闻传播、临床医学、经济管理和华文教育方向具有特色。",
    foundedYear: 1906,
    affiliation: "中央统战部",
    dominantMajors: ["新闻学", "临床医学", "金融学"],
    graduateRate: 60,
    employmentRate: 92
  },
  {
    id: "sustech",
    name: "南方科技大学",
    city: "深圳",
    province: "广东",
    type: "理工",
    tierTags: ["双一流"],
    slogan: "明德求是，日新自强",
    description: "新型研究型大学，理工与交叉学科发展快，科研平台与国际合作资源突出。",
    foundedYear: 2011,
    affiliation: "广东省",
    dominantMajors: ["人工智能", "生物医学工程", "计算机科学与技术"],
    graduateRate: 62,
    employmentRate: 95
  }
];

export const majors: Major[] = [
  ["computer-science", "计算机科学与技术", "工学"],
  ["software-engineering", "软件工程", "工学"],
  ["artificial-intelligence", "人工智能", "工学"],
  ["data-science", "数据科学与大数据技术", "工学"],
  ["electronic-info", "电子信息工程", "工学"],
  ["communication", "通信工程", "工学"],
  ["automation", "自动化", "工学"],
  ["mechanical", "机械设计制造及其自动化", "工学"],
  ["electrical", "电气工程及其自动化", "工学"],
  ["civil", "土木工程", "工学"],
  ["architecture", "建筑学", "工学"],
  ["clinical-medicine", "临床医学", "医学"],
  ["stomatology", "口腔医学", "医学"],
  ["pharmacy", "药学", "医学"],
  ["law", "法学", "法学"],
  ["economics", "经济学", "经济学"],
  ["finance", "金融学", "经济学"],
  ["accounting", "会计学", "管理学"],
  ["business", "工商管理", "管理学"],
  ["marketing", "市场营销", "管理学"],
  ["journalism", "新闻学", "文学"],
  ["chinese", "汉语言文学", "文学"],
  ["english", "英语", "文学"],
  ["mathematics", "数学与应用数学", "理学"],
  ["physics", "应用物理学", "理学"],
  ["chemistry", "应用化学", "理学"],
  ["biology", "生物科学", "理学"],
  ["biomedical", "生物医学工程", "工学"],
  ["materials", "材料科学与工程", "工学"],
  ["environment", "环境工程", "工学"],
  ["marine", "海洋科学", "理学"],
  ["statistics", "统计学", "理学"],
  ["psychology", "心理学", "教育学"],
  ["education", "教育学", "教育学"],
  ["preschool", "学前教育", "教育学"],
  ["history-major", "历史学", "历史学"],
  ["philosophy", "哲学", "哲学"],
  ["public-admin", "公共事业管理", "管理学"],
  ["urban", "城乡规划", "工学"],
  ["ic-design", "集成电路设计与集成系统", "工学"],
  ["cyber-security", "网络空间安全", "工学"],
  ["robotics", "机器人工程", "工学"],
  ["digital-media", "数字媒体技术", "工学"],
  ["industrial-design", "工业设计", "工学"],
  ["aerospace", "飞行器设计与工程", "工学"],
  ["surveying", "测绘工程", "工学"],
  ["ocean-engineering", "船舶与海洋工程", "工学"],
  ["financial-tech", "金融科技", "经济学"],
  ["translation", "翻译", "文学"],
  ["international-business", "国际经济与贸易", "经济学"]
].map(([id, name, category], index) => ({
  id,
  name,
  category,
  degree: ["工学", "理学", "管理学", "文学", "医学", "经济学"].includes(category)
    ? `${category}学士`
    : "学士",
  duration: ["建筑学", "临床医学", "口腔医学"].includes(name) ? "5年" : "4年",
  tuition: 5200 + (index % 6) * 900,
  subjectRequirements: ["临床医学", "口腔医学", "药学", "人工智能", "计算机科学与技术"].includes(name)
    ? "首选物理，再选不限"
    : index % 3 === 0
      ? "不限"
      : "首选物理",
  overview: `${name}专业聚焦${category}领域的核心理论、方法与实践能力，培养适应未来产业与科研发展的复合型人才。`,
  careers: [`${name}相关研发`, "产品与运营", "咨询与分析"],
  courses: ["专业导论", "核心理论", "实践项目", "行业专题"],
  heat: 64 + (index % 10) * 3
}));

const importedUniversityCatalogSeed = [
  "中国人民大学",
  "北京航空航天大学",
  "北京师范大学",
  "同济大学",
  "东南大学",
  "中南大学",
  "西安交通大学",
  "兰州大学",
  "吉林大学",
  "东北大学",
  "大连理工大学",
  "华东师范大学",
  "中国农业大学",
  "中央财经大学",
  "对外经济贸易大学",
  "中国政法大学",
  "北京邮电大学",
  "中国传媒大学",
  "南京航空航天大学",
  "南京理工大学",
  "苏州大学",
  "河海大学",
  "江南大学",
  "南京师范大学",
  "华南师范大学",
  "深圳技术大学",
  "南昌大学",
  "福州大学",
  "郑州大学",
  "云南大学",
  "西北工业大学",
  "西北大学",
  "新疆大学",
  "海南大学",
  "宁波大学",
  "广西大学",
  "贵州大学",
  "内蒙古大学",
  "青海大学",
  "石河子大学"
];

const importedMajorCatalogSeed = [
  "智能制造工程",
  "区块链工程",
  "储能科学与工程",
  "量子信息科学",
  "密码科学与技术",
  "智能建造",
  "数字经济",
  "跨境电子商务",
  "人工智能教育",
  "智慧交通",
  "智慧农业",
  "临床药学",
  "医学影像技术",
  "康复治疗学",
  "法语",
  "德语",
  "日语",
  "俄语",
  "国际组织与全球治理",
  "社会工作",
  "社会学",
  "文物与博物馆学",
  "遥感科学与技术",
  "地理信息科学",
  "地质工程",
  "能源与动力工程",
  "给排水科学与工程",
  "食品科学与工程",
  "食品质量与安全",
  "植物保护",
  "动物医学",
  "园林",
  "风景园林",
  "信息与计算科学",
  "微电子科学与工程",
  "海洋技术",
  "航空航天工程",
  "交通运输",
  "交通工程",
  "审计学"
];

export const importedUniversityCatalog: UniversityCatalogEntry[] = importedUniversityCatalogSeed.map((name, index) => {
  const province = provinces[index % provinces.length];
  return {
    id: `catalog-university-${index + 1}`,
    name,
    city: province.name,
    province: province.name,
    type: index % 4 === 0 ? "综合" : index % 4 === 1 ? "理工" : index % 4 === 2 ? "师范" : "财经",
    tierTags: index % 5 === 0 ? ["211", "双一流"] : ["双一流"],
    source: "imported"
  };
});

export const importedMajorCatalog: MajorCatalogEntry[] = importedMajorCatalogSeed.map((name, index) => ({
  id: `catalog-major-${index + 1}`,
  name,
  category: index % 4 === 0 ? "工学" : index % 4 === 1 ? "管理学" : index % 4 === 2 ? "理学" : "文学",
  level: "本科",
  subjectRequirements: index % 3 === 0 ? "首选物理" : "不限",
  source: "imported"
}));

export const universityCatalog: UniversityCatalogEntry[] = [
  ...universities.map((item) => ({
    id: item.id,
    name: item.name,
    aliases: [],
    city: item.city,
    province: item.province,
    type: item.type,
    tierTags: item.tierTags,
    affiliation: item.affiliation,
    source: "mock" as const
  })),
  ...importedUniversityCatalog
];

export const majorCatalog: MajorCatalogEntry[] = [
  ...majors.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    level: "本科",
    subjectRequirements: item.subjectRequirements,
    source: "mock" as const
  })),
  ...importedMajorCatalog
];

export const dataCatalogManifest: DataCatalogManifest = {
  provinceCount: provinces.length,
  mockUniversityCount: universities.length,
  mockMajorCount: majors.length,
  importedUniversityCount: importedUniversityCatalog.length,
  importedMajorCount: importedMajorCatalog.length,
  supportsNationwideImport: true,
  lastUpdated: "2026-06-07",
  notes: [
    "当前录取分数仍使用高质量 Mock 数据，用于演示查询、趋势图和推荐流程。",
    "全国院校目录与专业目录已升级为可导入结构，后续可直接接入教育部专业目录、学校名录和历年招录数据。",
    "若要实现真正的“全国所有大学所有专业历年录取数据”，下一步应接入真实数据源与数据库导入脚本。"
  ]
};

const subjectDefaults: Record<string, Array<AdmissionScore["subjectType"]>> = Object.fromEntries(
  provinces.map((province) => [province.id, province.subjects as Array<AdmissionScore["subjectType"]>])
);

function scoreBase(universityIndex: number, majorIndex: number) {
  return 660 - universityIndex * 4 - (majorIndex % 8) * 3;
}

function subjectBonus(subjectType: string) {
  return ["物理", "理科", "综合"].includes(subjectType) ? 6 : 0;
}

function makeRank(score: number, yearOffset: number, subjectType: string) {
  const base = 1200 + (680 - score) * 35 + yearOffset * 220;
  return base + (["历史", "文科"].includes(subjectType) ? 600 : 0);
}

export const admissionScores: AdmissionScore[] = [];

provinces.forEach((province, provinceIndex) => {
  const subjects = subjectDefaults[province.id] || ["物理", "历史"];
  years.forEach((yearItem, yearIndex) => {
    universities.forEach((university, universityIndex) => {
      majors.slice(0, 12 + (universityIndex % 10)).forEach((major, majorIndex) => {
        const subjectType = subjects[(majorIndex + universityIndex) % subjects.length];
        const baseScore = scoreBase(universityIndex, majorIndex) - provinceIndex * 2 - yearIndex;
        const minScore = Math.max(500, baseScore + subjectBonus(subjectType));
        const avgScore = minScore + 5 + (majorIndex % 4);
        const maxScore = avgScore + 6 + (universityIndex % 3);
        const minRank = makeRank(minScore, yearIndex, subjectType);
        const avgRank = Math.max(1, minRank - (400 + (majorIndex % 5) * 60));
        const provinceControlLine = Math.max(430, minScore - 42 - (majorIndex % 4) * 3);
        const planCount = 4 + (universityIndex % 5) + (majorIndex % 4);
        const admittedCount = Math.max(3, planCount - (majorIndex % 2));

        admissionScores.push({
          id: `${province.id}-${yearItem.value}-${university.id}-${major.id}`,
          provinceId: province.id,
          year: yearItem.value,
          subjectType,
          universityId: university.id,
          majorId: major.id,
          batch: minScore > 620 ? "本科提前批 / 本科批" : "本科批",
          planCount,
          admittedCount,
          minScore,
          avgScore,
          maxScore,
          minRank,
          avgRank,
          provinceControlLine,
          scoreGap: minScore - provinceControlLine
        });
      });
    });
  });
});

export function getProvinceById(provinceId: string) {
  return provinces.find((item) => item.id === provinceId);
}

export function getUniversityById(universityId: string) {
  return universities.find((item) => item.id === universityId);
}

export function getMajorById(majorId: string) {
  return majors.find((item) => item.id === majorId);
}

export function searchAdmissions(filters: SearchFilters) {
  const normalizedUniversity = filters.universityKeyword?.trim().toLowerCase();
  const normalizedMajor = filters.majorKeyword?.trim().toLowerCase();

  return admissionScores.filter((item) => {
    const university = getUniversityById(item.universityId);
    const major = getMajorById(item.majorId);
    if (!university || !major) return false;
    if (filters.provinceId && item.provinceId !== filters.provinceId) return false;
    if (filters.year && item.year !== filters.year) return false;
    if (filters.subjectType && item.subjectType !== filters.subjectType) return false;
    if (filters.tierTag && !university.tierTags.includes(filters.tierTag)) return false;
    if (filters.city && university.city !== filters.city) return false;
    if (normalizedUniversity && !university.name.toLowerCase().includes(normalizedUniversity)) return false;
    if (normalizedMajor && !major.name.toLowerCase().includes(normalizedMajor)) return false;
    return true;
  });
}

export function getUniversityAdmissions(universityId: string) {
  return admissionScores.filter((item) => item.universityId === universityId);
}

export function getMajorAdmissions(majorId: string) {
  return admissionScores.filter((item) => item.majorId === majorId);
}

export function getUniversityTrend(universityId: string, provinceId: string, subjectType?: string) {
  return years
    .map(({ value }) => {
      const list = admissionScores.filter(
        (item) =>
          item.universityId === universityId &&
          item.provinceId === provinceId &&
          (!subjectType || item.subjectType === subjectType) &&
          item.year === value
      );

      if (!list.length) return null;

      const avgMinScore = Math.round(list.reduce((sum, item) => sum + item.minScore, 0) / list.length);
      const avgMinRank = Math.round(list.reduce((sum, item) => sum + item.minRank, 0) / list.length);

      return {
        year: value,
        minScore: avgMinScore,
        minRank: avgMinRank
      };
    })
    .filter(Boolean);
}

export function getMajorTrend(majorId: string, provinceId: string, subjectType?: string) {
  return years
    .map(({ value }) => {
      const list = admissionScores.filter(
        (item) =>
          item.majorId === majorId &&
          item.provinceId === provinceId &&
          (!subjectType || item.subjectType === subjectType) &&
          item.year === value
      );

      if (!list.length) return null;

      const avgMinScore = Math.round(list.reduce((sum, item) => sum + item.minScore, 0) / list.length);
      const avgMinRank = Math.round(list.reduce((sum, item) => sum + item.minRank, 0) / list.length);

      return {
        year: value,
        minScore: avgMinScore,
        minRank: avgMinRank
      };
    })
    .filter(Boolean);
}

export function getHotMajors(universityId: string) {
  const university = getUniversityById(universityId);
  if (!university) return [];

  return university.dominantMajors
    .map((name) => majors.find((item) => item.name === name))
    .filter(Boolean)
    .map((major) => ({
      name: major!.name,
      heat: major!.heat
    }));
}

export function getProvinceComparison(subjectType?: string) {
  return provinces.slice(0, 8).map((province) => {
    const list = admissionScores.filter(
      (item) => item.provinceId === province.id && (!subjectType || item.subjectType === subjectType)
    );
    const averageScore = Math.round(list.reduce((sum, item) => sum + item.minScore, 0) / list.length);
    return {
      province: province.name,
      averageScore
    };
  });
}

export function getRecommendations(provinceId: string, score: number, subjectType: string): RecommendationResult[] {
  const latestYear = years[0].value;
  const pool = admissionScores
    .filter((item) => item.provinceId === provinceId && item.year === latestYear && item.subjectType === subjectType)
    .sort((a, b) => b.minScore - a.minScore);

  const targets = [
    { label: "冲刺院校" as const, minDelta: -6, maxDelta: 8 },
    { label: "稳妥院校" as const, minDelta: -18, maxDelta: -7 },
    { label: "保底院校" as const, minDelta: -35, maxDelta: -19 }
  ];

  return targets
    .map((target) => {
      const match = pool.find((item) => {
        const delta = score - item.minScore;
        return delta >= target.minDelta && delta <= target.maxDelta;
      });

      if (!match) return null;
      const university = getUniversityById(match.universityId);
      const major = getMajorById(match.majorId);
      if (!university || !major) return null;

      return {
        type: target.label,
        universityId: university.id,
        universityName: university.name,
        majorName: major.name,
        expectedScore: match.minScore,
        expectedRank: match.minRank,
        reason:
          target.label === "冲刺院校"
            ? `近三年该专业最低分与您的分数接近，适合作为冲刺目标；${university.city}区位与学校层次也有明显优势。`
            : target.label === "稳妥院校"
              ? "该专业往年录取波动较小，最低位次更贴近当前分数段，录取把握更均衡。"
              : "该专业近年录取门槛明显低于当前分数，能作为志愿组合中的安全垫。"
      };
    })
    .filter(Boolean) as RecommendationResult[];
}

export function summarizeAdmissions(records: AdmissionScore[]) {
  if (!records.length) {
    return {
      avgMinScore: 0,
      avgMinRank: 0,
      avgPlanCount: 0
    };
  }

  return {
    avgMinScore: Math.round(records.reduce((sum, item) => sum + item.minScore, 0) / records.length),
    avgMinRank: Math.round(records.reduce((sum, item) => sum + item.minRank, 0) / records.length),
    avgPlanCount: Math.round(records.reduce((sum, item) => sum + item.planCount, 0) / records.length)
  };
}
