export const catalogFieldDefinitions = {
  provinces: [
    { key: "id", label: "省份 ID", required: true },
    { key: "name", label: "省份名称", required: true },
    { key: "region", label: "地区", required: true },
    { key: "subjects", label: "科类列表", required: true }
  ],
  universities: [
    { key: "id", label: "学校 ID", required: true },
    { key: "name", label: "学校名称", required: true },
    { key: "city", label: "城市", required: true },
    { key: "province", label: "省份", required: true },
    { key: "type", label: "院校类型", required: true },
    { key: "tierTags", label: "院校层次", required: true },
    { key: "affiliation", label: "隶属单位", required: false }
  ],
  majors: [
    { key: "id", label: "专业 ID", required: true },
    { key: "name", label: "专业名称", required: true },
    { key: "category", label: "专业门类", required: true },
    { key: "degree", label: "学位", required: false },
    { key: "duration", label: "学制", required: false },
    { key: "subjectRequirements", label: "选科要求", required: false }
  ]
} as const;

export const admissionFieldDefinitions = [
  { key: "id", label: "记录 ID", required: true },
  { key: "provinceId", label: "省份 ID", required: true },
  { key: "year", label: "年份", required: true },
  { key: "subjectType", label: "科类", required: true },
  { key: "universityId", label: "学校 ID", required: true },
  { key: "majorId", label: "专业 ID", required: true },
  { key: "batch", label: "批次", required: false },
  { key: "planCount", label: "招生计划", required: false },
  { key: "admittedCount", label: "实录人数", required: false },
  { key: "minScore", label: "最低分", required: true },
  { key: "avgScore", label: "平均分", required: false },
  { key: "maxScore", label: "最高分", required: false },
  { key: "minRank", label: "最低位次", required: true },
  { key: "avgRank", label: "平均位次", required: false },
  { key: "provinceControlLine", label: "省控线", required: false },
  { key: "scoreGap", label: "线差", required: false }
] as const;
