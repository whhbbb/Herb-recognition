import { HerbInfo } from '../store/atoms';
import { resolveApiBaseUrl } from '../utils/apiBase';

const fallbackHerbs: HerbInfo[] = [
  {
    id: '当归',
    name: '当归',
    scientificName: 'Angelica sinensis',
    properties: '甘、辛，温',
    meridian: '肝经、心经、脾经',
    functions: ['补血调经', '活血止痛', '润肠通便'],
    usage: '煎服，6-12g',
    cautions: ['湿阻中满及大便溏泄者慎服'],
    image: 'https://picsum.photos/400/300?random=1',
    description: '当归为伞形科植物当归的干燥根。',
    category: '补虚药',
  },
  {
    id: '人参',
    name: '人参',
    scientificName: 'Panax ginseng',
    properties: '甘、微苦，微温',
    meridian: '脾经、肺经、心经',
    functions: ['大补元气', '复脉固脱', '补脾益肺', '生津止渴', '安神益智'],
    usage: '煎服，3-9g；研粉吞服，1-3g',
    cautions: ['实证、热证而正气不虚者忌服'],
    image: 'https://picsum.photos/400/300?random=2',
    description: '人参为五加科植物人参的干燥根和根茎。',
    category: '补虚药',
  },
];

export let herbDatabase: HerbInfo[] = [...fallbackHerbs];

type HerbClassApiRow = {
  herbId: string;
  herbName: string;
  name?: string;
  scientificName?: string;
  properties?: string;
  meridian?: string;
  functions?: string[];
  usage?: string;
  cautions?: string[];
  image?: string;
  description?: string;
  category?: string;
};

export const loadHerbDatabaseFromApi = async (apiBase = resolveApiBaseUrl()): Promise<HerbInfo[]> => {
  try {
    const response = await fetch(`${apiBase}/herb-classes`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as HerbClassApiRow[];
    const mapped = data.map((item) => ({
      id: item.herbId,
      name: item.name?.trim() || item.herbName,
      scientificName: item.scientificName?.trim() || item.herbName,
      properties: item.properties?.trim() || '暂无',
      meridian: item.meridian?.trim() || '',
      functions: Array.isArray(item.functions) ? item.functions : [],
      usage: item.usage?.trim() || '暂无',
      cautions: Array.isArray(item.cautions) ? item.cautions : [],
      image: item.image?.trim() || 'https://picsum.photos/400/300?random=11',
      description: item.description?.trim() || '暂无',
      category: item.category?.trim() || '未分类',
    }));

    if (mapped.length > 0) {
      herbDatabase = mapped;
    }
    return herbDatabase;
  } catch (error) {
    console.warn('从后端加载草药资料失败，已回退本地数据', error);
    return herbDatabase;
  }
};

export const searchHerbs = (keyword: string): HerbInfo[] => {
  if (!keyword.trim()) return herbDatabase;

  const lowerKeyword = keyword.toLowerCase();
  return herbDatabase.filter((herb) => {
    return (
      herb.name.includes(keyword) ||
      herb.scientificName.toLowerCase().includes(lowerKeyword) ||
      herb.functions.some((func) => func.includes(keyword)) ||
      herb.category.includes(keyword)
    );
  });
};

export const mockRecognition = async (): Promise<HerbInfo | null> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (!herbDatabase.length) return null;
  const randomIndex = Math.floor(Math.random() * herbDatabase.length);
  return herbDatabase[randomIndex];
};
