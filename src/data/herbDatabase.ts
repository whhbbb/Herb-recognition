/**
 * 中草药数据库
 * 包含常见中草药的详细信息，用于模拟识别结果
 */
import { HerbInfo } from '../store/atoms';

export const herbDatabase: HerbInfo[] = [
  {
    id: '1',
    name: '当归',
    scientificName: 'Angelica sinensis',
    properties: '甘、辛，温',
    functions: ['补血调经', '活血止痛', '润肠通便'],
    usage: '煎服，6-12g',
    cautions: ['湿阻中满及大便溏泄者慎服'],
    image: 'https://picsum.photos/400/300?random=1',
    description: '当归为伞形科植物当归的干燥根。主产于甘肃东南部，以岷县产量多，质量好，其次为云南、四川、陕西、湖北等省亦有出产。',
    category: '补虚药'
  },
  {
    id: '2',
    name: '人参',
    scientificName: 'Panax ginseng',
    properties: '甘、微苦，微温',
    functions: ['大补元气', '复脉固脱', '补脾益肺', '生津止渴', '安神益智'],
    usage: '煎服，3-9g；研粉吞服，1-3g',
    cautions: ['不宜与萝卜同服', '实证、热证而正气不虚者忌服'],
    image: 'https://picsum.photos/400/300?random=2',
    description: '人参为五加科植物人参的干燥根和根茎。栽培者为"园参"，野生者为"山参"。多于秋季采挖，洗净，晒干。',
    category: '补虚药'
  },
  {
    id: '3',
    name: '黄芪',
    scientificName: 'Astragalus membranaceus',
    properties: '甘，微温',
    functions: ['补气固表', '敛汗固脱', '利水消肿', '生津养血'],
    usage: '煎服，9-30g',
    cautions: ['表实邪盛，气滞湿阻，食积停滞，痈疽初起或溃后热毒尚盛等实证，以及阴虚阳亢者，均须禁服'],
    image: 'https://picsum.photos/400/300?random=3',
    description: '黄芪为豆科植物蒙古黄芪或膜荚黄芪的干燥根。春秋二季采挖，除去须根和根头，晒干。',
    category: '补虚药'
  },
  {
    id: '4',
    name: '川芎',
    scientificName: 'Ligusticum chuanxiong',
    properties: '辛，温',
    functions: ['活血行气', '祛风止痛'],
    usage: '煎服，3-10g',
    cautions: ['阴虚火旺，上盛下虚及气弱之人忌服'],
    image: 'https://picsum.photos/400/300?random=4',
    description: '川芎为伞形科植物川芎的干燥根茎。夏季当茎叶茂盛时采割地上部分；秋季挖根茎，除去泥沙，晒干，再除去须根。',
    category: '活血化瘀药'
  },
  {
    id: '5',
    name: '甘草',
    scientificName: 'Glycyrrhiza uralensis',
    properties: '甘，平',
    functions: ['补脾益气', '清热解毒', '祛痰止咳', '缓急止痛', '调和诸药'],
    usage: '煎服，2-10g',
    cautions: ['不宜与京大戟、芫花、甘遂、海藻同用'],
    image: 'https://picsum.photos/400/300?random=5',
    description: '甘草为豆科植物甘草、胀果甘草或光果甘草的干燥根和根茎。春、秋二季采挖，除去须根，晒干。',
    category: '补虚药'
  },
  {
    id: '6',
    name: '白芍',
    scientificName: 'Paeonia lactiflora',
    properties: '苦、酸，微寒',
    functions: ['养血调经', '敛阴止汗', '柔肝止痛', '平抑肝阳'],
    usage: '煎服，6-15g',
    cautions: ['虚寒腹痛泄泻者慎服'],
    image: 'https://picsum.photos/400/300?random=6',
    description: '白芍为毛茛科植物芍药的干燥根。夏、秋二季采挖，洗净，除去头尾和细根，置沸水中煮后除去外皮或去皮后再煮，晒干。',
    category: '补虚药'
  },
  {
    id: '7',
    name: '茯苓',
    scientificName: 'Poria cocos',
    properties: '甘、淡，平',
    functions: ['利水渗湿', '健脾', '宁心'],
    usage: '煎服，10-15g',
    cautions: ['虚寒精滑或气虚下陷者忌服'],
    image: 'https://picsum.photos/400/300?random=7',
    description: '茯苓为多孔菌科真菌茯苓的干燥菌核。多于7~9月采挖，挖出后除去泥沙，堆置"发汗"后，摊开晾至表面干燥，再"发汗"，反复数次至现皱纹、内部水分大部散失后，阴干，称为"茯苓个"；或将鲜茯苓按不同部位切制，阴干，分别称为"茯苓块"和"茯苓片"。',
    category: '利水渗湿药'
  },
  {
    id: '8',
    name: '枸杞子',
    scientificName: 'Lycium barbarum',
    properties: '甘，平',
    functions: ['滋补肝肾', '益精明目'],
    usage: '煎服，6-12g',
    cautions: ['外邪实热，脾虚有湿及泄泻者忌服'],
    image: 'https://picsum.photos/400/300?random=8',
    description: '枸杞子为茄科植物宁夏枸杞的干燥成熟果实。夏、秋二季果实呈红色时采收，热风烘干，除去果梗，或晾至皮皱后，晒干，除去果梗。',
    category: '补虚药'
  }
];

// 根据关键词搜索中草药
export const searchHerbs = (keyword: string): HerbInfo[] => {
  if (!keyword.trim()) return herbDatabase;
  
  const lowerKeyword = keyword.toLowerCase();
  return herbDatabase.filter(herb => 
    herb.name.includes(keyword) ||
    herb.scientificName.toLowerCase().includes(lowerKeyword) ||
    herb.functions.some(func => func.includes(keyword)) ||
    herb.category.includes(keyword)
  );
};

// 模拟识别结果
export const mockRecognition = async (imageData: string): Promise<HerbInfo | null> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  // 随机返回一个识别结果
  const randomIndex = Math.floor(Math.random() * herbDatabase.length);
  return herbDatabase[randomIndex];
};
