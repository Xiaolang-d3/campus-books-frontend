export const bookHierarchy = {
  '计算机学院': {
    '软件工程': {
      '软件工程导论': ['第3版', '第4版'],
      '数据结构': ['2022版', '2024版'],
      '操作系统': ['第4版', '第5版'],
    },
    '计算机科学与技术': {
      '计算机组成原理': ['第3版', '第4版'],
      '数据库系统': ['第5版', '第6版'],
      '计算机网络': ['第7版', '第8版'],
    },
  },
  '文学院': {
    '汉语言文学': {
      '中国现代文学': ['2021版', '2023版'],
      '古代汉语': ['第2版', '第3版'],
    },
    '新闻学': {
      '新闻采访与写作': ['第4版', '第5版'],
      '传播学概论': ['2020版', '2023版'],
    },
  },
  '经济管理学院': {
    '会计学': {
      '基础会计': ['第8版', '第9版'],
      '财务管理': ['第6版', '第7版'],
    },
    '国际经济与贸易': {
      '国际贸易实务': ['第4版', '第5版'],
      '西方经济学': ['第8版', '第9版'],
    },
  },
  '理学院': {
    '数学与应用数学': {
      '高等数学': ['上册 第7版', '下册 第7版'],
      '线性代数': ['第6版', '第7版'],
    },
    '物理学': {
      '大学物理': ['第3版', '第4版'],
      '理论力学': ['第8版', '第9版'],
    },
  },
}

export const getColleges = () => Object.keys(bookHierarchy)

export const getMajors = (college) => (college && bookHierarchy[college] ? Object.keys(bookHierarchy[college]) : [])

export const getCourses = (college, major) => {
  if (!college || !major || !bookHierarchy[college]?.[major]) return []
  return Object.keys(bookHierarchy[college][major])
}

export const getVersions = (college, major, course) => {
  if (!college || !major || !course || !bookHierarchy[college]?.[major]?.[course]) return []
  return bookHierarchy[college][major][course]
}

export const resolveHierarchyPath = (book) => {
  const parts = [book?.xueyuan, book?.zhuanye, book?.kecheng, book?.banben].filter(Boolean)
  return parts.join(' / ')
}
