/**
 * 素材处理脚本（幂等，可重复运行）
 *
 * 数据源：E:\素材\一次分类(1)\一次分类 （只读，绝不修改/重命名/删除源文件）
 *
 * 产出：
 *  1. 精选照片 34 张 + 面具记录 47 张 → 压缩为 Web 母版（最长边 2400px JPEG）
 *     输出到 src/assets/media/（供 Astro <Image>/getImage 构建期优化）
 *  2. 13 段原始视频 → 20–60 秒 1080p H.264 压缩短片 → public/media/video/
 *     同时为每段生成 poster 封面 → src/assets/media/video/
 *  3. 生成数据清单：src/content/masks/masks.json、src/content/media/media.json
 *
 * 用法：node src/scripts/prepare-media.mjs [--force]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = 'E:\\素材\\一次分类(1)\\一次分类';
const PHOTO_SRC = join(SRC, '精选照片');
const MASK_SRC = join(SRC, '面具记录');
const VIDEO_SRC = join(SRC, '视频分类', '处理后');
const ASSETS_OUT = join(ROOT, 'src', 'assets', 'media');
const VIDEO_OUT = join(ROOT, 'public', 'media', 'video');
const FORCE = process.argv.includes('--force');

/** 精选照片映射：源相对路径 → [输出目录, 输出文件名, alt] */
const PHOTO_MAP = [
  // 8-4 广顺镇：燕世忠工坊、广顺城门、合照
  ['8-4\\1.燕世忠雕刻图1.JPG', 'fieldwork', '0804-carving-1.jpg', '燕世忠在工坊中雕刻地戏面具'],
  ['8-4\\2.燕世忠雕刻图2.JPG', 'fieldwork', '0804-carving-2.jpg', '燕世忠雕刻面具的近景'],
  ['8-4\\3.燕世忠家合照.JPG', 'fieldwork', '0804-group-yan-home.jpg', '实践团在燕世忠家中合影'],
  ['8-4\\4.燕世忠个人照.JPG', 'people', 'yan-shizhong.jpg', '面具雕刻手艺人燕世忠肖像'],
  ['8-4\\5.燕世忠采访现场图.JPG', 'fieldwork', '0804-interview-yan.jpg', '燕世忠采访现场'],
  ['8-4\\6.燕世忠儿子武器讲解.JPG', 'fieldwork', '0804-weapons.jpg', '燕世忠儿子讲解地戏兵器'],
  ['8-4\\7.燕世忠儿子采访现场图.JPG', 'fieldwork', '0804-interview-son.jpg', '燕世忠儿子采访现场'],
  ['8-4\\8.燕世忠面具摆放图1.JPG', 'fieldwork', '0804-masks-display-1.jpg', '燕世忠家中摆放的地戏面具（一）'],
  ['8-4\\9.燕世忠面具摆放图2.JPG', 'fieldwork', '0804-masks-display-2.jpg', '燕世忠家中摆放的地戏面具（二）'],
  ['8-4\\10.广顺政府前合照.JPG', 'fieldwork', '0804-group-gov.jpg', '实践团在广顺镇政府前合影'],
  ['8-4\\11.党群服务中心前合照.JPG', 'fieldwork', '0804-group-service-center.jpg', '实践团在党群服务中心前合影'],
  ['8-4\\12.广顺东城门.JPG', 'villages', 'guangshun-east-gate.jpg', '长顺县广顺镇东城门'],
  ['8-4\\13.广顺南城门.JPG', 'villages', 'guangshun-south-gate.jpg', '长顺县广顺镇南城门'],
  // 8-5 马路乡：长顺农民剧团
  ['8-5\\1.地戏曲目封面图.JPG', 'outcomes', 'repertoire-cover.jpg', '地戏曲目手抄本封面'],
  ['8-5\\2.地戏曲目内容图.JPG', 'outcomes', 'repertoire-content.jpg', '地戏曲目手抄本内页'],
  ['8-5\\3.马路乡剧团合照1（只学生）.JPG', 'fieldwork', '0805-group-students.jpg', '实践团在马路乡剧团合影'],
  ['8-5\\4.马路乡剧团合照2（含团长）.JPG', 'fieldwork', '0805-group-troupe.jpg', '实践团与马路乡剧团团长及成员合影'],
  ['8-5\\5.剧团荣誉墙.JPG', 'outcomes', 'troupe-honors.jpg', '长顺农民剧团荣誉墙'],
  ['8-5\\6.剧团武器架.JPG', 'outcomes', 'troupe-weapons.jpg', '剧团存放地戏兵器的武器架'],
  ['8-5\\7.方仁良采访图.JPG', 'people', 'fang-renliang.jpg', '老地戏表演者方仁良接受采访'],
  ['8-5\\8.金老伍采访图1（穆欣怡）.JPG', 'people', 'jin-laowu-1.jpg', '剧团成员金老伍接受采访（一）'],
  ['8-5\\9.金老伍采访图2(李迪雅）.JPG', 'people', 'jin-laowu-2.jpg', '剧团成员金老伍接受采访（二）'],
  // 源文件名记作「肖同学」，实为少年地戏演员金玉婷（源目录只读，文件名不可改）
  ['8-5\\10.肖同学采访图1（特写）（穆欣怡）.JPG', 'fieldwork', '0805-interview-student-1.jpg', '少年地戏演员金玉婷采访特写'],
  ['8-5\\11.肖同学采访图2（李迪雅）.JPG', 'fieldwork', '0805-interview-student-2.jpg', '少年地戏演员金玉婷采访现场'],
  ['8-5\\12.金团长采访图.JPG', 'people', 'jin-yunxiang.jpg', '长顺农民剧团团长金云祥接受采访'],
  ['8-5\\13.金老伍服装讲解图.JPG', 'fieldwork', '0805-costume.jpg', '金老伍讲解地戏服装'],
  // 8-6 天龙古镇演武堂
  ['8-6\\1.天龙石刻地标图1.JPG', 'villages', 'tianlong-stone-1.jpg', '天龙古镇石刻地标（一）'],
  ['8-6\\2天龙石刻地标图2.JPG', 'villages', 'tianlong-stone-2.jpg', '天龙古镇石刻地标（二）'],
  ['8-6\\3.天龙屯堡名称图.JPG', 'villages', 'tianlong-name.jpg', '天龙屯堡名称石刻'],
  ['8-6\\4.演武堂地戏人物特写.JPG', 'hero', 'yanwutang-closeup.jpg', '演武堂地戏演员面具特写'],
  ['8-6\\5.演武堂表演现场图.JPG', 'performance', 'yanwutang-scene.jpg', '演武堂地戏表演现场'],
  ['8-6\\6.冯圣平采访图1.JPG', 'people', 'feng-shengping-1.jpg', '演武堂讲解员冯圣平接受采访（一）'],
  ['8-6\\7.冯圣平采访图2.JPG', 'people', 'feng-shengping-2.jpg', '演武堂讲解员冯圣平接受采访（二）'],
  ['8-6\\8.青年学徒采访图.JPG', 'people', 'young-apprentice.jpg', '青年地戏学徒接受采访'],
];

/**
 * 视频映射：源文件 → slug/标题/分类/截取区间
 * （02 开头有遮挡，截取后段；区间依据 ffprobe 实测时长设定）
 */
const VIDEO_MAP = [
  { src: '01-进入燕世忠先生家中.MP4', slug: '01-yan-workshop', title: '走进燕世忠的工坊', category: 'workshop', categoryLabel: '工坊环境', ss: 20, t: 45, people: ['yan-shizhong'], captureDate: '2026-08-04', summary: '跟随镜头进入面具雕刻手艺人燕世忠家中，记录工坊环境与面具陈列。' },
  { src: '02-燕世忠先生采访01.MP4', slug: '02-yan-interview-1', title: '燕世忠口述史（一）', category: 'interview', categoryLabel: '人物采访', ss: 180, t: 45, people: ['yan-shizhong'], captureDate: '2026-08-04', summary: '燕世忠讲述地戏面具雕刻工艺与屯堡人的来历。' },
  { src: '03-燕世忠先生采访02.MP4', slug: '03-yan-interview-2', title: '燕世忠口述史（二）', category: 'interview', categoryLabel: '人物采访', ss: 300, t: 50, people: ['yan-shizhong'], captureDate: '2026-08-04', summary: '燕世忠逐尊讲解面具角色：关羽、曹操、赵云与他们的故事。' },
  { src: '04-燕世忠先生采访03.MP4', slug: '04-yan-interview-3', title: '燕世忠口述史（三）', category: 'interview', categoryLabel: '人物采访', ss: 60, t: 40, people: ['yan-shizhong'], captureDate: '2026-08-04', summary: '燕世忠回忆过去春节跳地戏、围场子的场景与方言唱调。' },
  { src: '05-采访老传承人.mp4', slug: '05-fang-renliang', title: '老表演者方仁良：十八九岁入剧团', category: 'interview', categoryLabel: '人物采访', ss: 90, t: 45, people: ['fang-renliang'], captureDate: '2026-08-05', summary: '方仁良回忆初中毕业后加入地戏组织、数十年的表演经历。' },
  { src: '06-采访中年传承人01.mp4', slug: '06-jin-laowu-1', title: '金老伍：剧团里的摄影记录者', category: 'interview', categoryLabel: '人物采访', ss: 120, t: 45, people: ['jin-laowu'], captureDate: '2026-08-05', summary: '金老伍讲述他十八九年的摄影经历与为剧团留下的影像。' },
  { src: '07-采访中年传承人02.mp4', slug: '07-jin-laowu-2', title: '金老伍：地戏里的英雄崇拜', category: 'interview', categoryLabel: '人物采访', ss: 30, t: 40, people: ['jin-laowu'], captureDate: '2026-08-05', summary: '金老伍谈地戏演绎的保家卫国情怀与英雄人物。' },
  { src: '08-采访少年.mp4', slug: '08-jin-yuting', title: '少年演员金玉婷：四年级开始学地戏', category: 'interview', categoryLabel: '人物采访', ss: 120, t: 45, people: ['jin-yuting'], captureDate: '2026-08-05', summary: '14 岁的金玉婷讲述小学四年级起接触地戏、在学校表演的经历。' },
  { src: '09-中年传承人展示面具.mp4', slug: '09-mask-demo-1', title: '金老伍展示面具（一）：戴法与保存', category: 'mask', categoryLabel: '面具讲解', ss: 60, t: 50, people: ['jin-laowu'], captureDate: '2026-08-05', summary: '金老伍演示面具佩戴方式，讲解纱布遮盖与白纸包裹的保存方法。' },
  { src: '10-中年传承人展示面具02.mp4', slug: '10-mask-demo-2', title: '金老伍展示面具（二）：角色与性格', category: 'mask', categoryLabel: '面具讲解', ss: 10, t: 45, people: ['jin-laowu'], captureDate: '2026-08-05', summary: '金老伍讲解伍天锡等角色面具的造型讲究与选角门道。' },
  { src: '11-采访天龙古镇演武堂讲解员.mp4', slug: '11-feng-shengping', title: '冯圣平：演武堂与剧团的故事', category: 'interview', categoryLabel: '人物采访', ss: 90, t: 45, people: ['feng-shengping'], captureDate: '2026-08-06', summary: '演武堂讲解员冯圣平介绍剧团缘起、演员来源与每日剧目安排。' },
  { src: '12-采访地戏学徒.mp4', slug: '12-young-apprentice', title: '青年学徒：寒暑假来学戏', category: 'interview', categoryLabel: '人物采访', ss: 60, t: 45, people: ['young-apprentice'], captureDate: '2026-08-06', summary: '来自吉昌村的青年学徒讲述初二起学戏、跟随师兄进步的经历。' },
  { src: '13-地戏实拍（三英战吕布）.MP4', slug: '13-performance-sanying', title: '地戏实拍：《三英战吕布》', category: 'performance', categoryLabel: '地戏表演', ss: 60, t: 60, people: [], captureDate: '2026-08-06', summary: '天龙古镇演武堂地戏表演《三英战吕布》现场实录片段。' },
];

/** 首页「精选面具」候选（墙面陈列编号，查看照片后确定） */
const FEATURED_MASKS = ['8530', '8532', '8552', '8554', '8557', '8608', '8612', '8619'];

/** 仅录入照片中实体标签清晰可辨的角色名；其余统一保留“待考证” */
const MASK_ROLE_OVERRIDES = {
  '8536': '呼天宝',
  '8551': '呼天庆',
  '8554': '赵公明',
  '8555': '小军',
  '8608': '薛应龙',
};

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: ['ignore', 'ignore', 'inherit'] });
}

function probeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Math.round(parseFloat(out.toString().trim()));
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

let done = 0;
let skipped = 0;

// ---------- 1. 精选照片 ----------
console.log('== 精选照片 ==');
for (const [rel, dir, name] of PHOTO_MAP) {
  const src = join(PHOTO_SRC, rel);
  const outDir = join(ASSETS_OUT, dir);
  const out = join(outDir, name);
  ensureDir(outDir);
  if (!existsSync(src)) {
    console.error(`  [缺失] ${rel}`);
    continue;
  }
  if (existsSync(out) && !FORCE) {
    skipped++;
    continue;
  }
  run('ffmpeg', ['-y', '-i', src, '-vf', "scale='min(2400,iw)':-2", '-q:v', '3', '-map_metadata', '-1', out]);
  done++;
}

// ---------- 2. 面具记录 ----------
console.log('== 面具记录 ==');
const maskOutDir = join(ASSETS_OUT, 'masks');
ensureDir(maskOutDir);
const maskFiles = readdirSync(MASK_SRC).filter((f) => /^IMG_\d+\.JPG$/i.test(f)).sort();
const masks = [];
for (const f of maskFiles) {
  const num = f.match(/IMG_(\d+)\.JPG/i)[1];
  const isWorkshop = Number(num) >= 7912 && Number(num) <= 7921;
  const set = isWorkshop ? 'workshop' : 'wall';
  const name = `mask-${num}.jpg`;
  const out = join(maskOutDir, name);
  if (!existsSync(out) || FORCE) {
    run('ffmpeg', ['-y', '-i', join(MASK_SRC, f), '-vf', "scale='min(2400,iw)':-2", '-q:v', '3', '-map_metadata', '-1', out]);
    done++;
  } else {
    skipped++;
  }
  masks.push({
    id: `mask-${num}`,
    slug: `mask-${num}`,
    image: `masks/${name}`,
    alt: isWorkshop ? `燕世忠工坊地戏面具实物近景（编号 ${num}）` : `演武堂墙面陈列地戏面具（编号 ${num}）`,
    set,
    setLabel: isWorkshop ? '燕世忠工坊实物近景' : '演武堂墙面陈列',
    index: masks.length + 1,
    captureDate: isWorkshop ? '2026-08-04' : '2026-08-06',
    place: isWorkshop ? '长顺县广顺镇·燕世忠工坊' : '安顺市天龙古镇·演武堂',
    role: MASK_ROLE_OVERRIDES[num] ?? '待考证',
    relatedPeople: isWorkshop ? ['yan-shizhong'] : [],
    featured: FEATURED_MASKS.includes(num),
    visibility: 'public',
    consentLevel: 'confirmed',
  });
}
ensureDir(join(ROOT, 'src', 'content', 'masks'));
writeFileSync(join(ROOT, 'src', 'content', 'masks', 'masks.json'), JSON.stringify(masks, null, 2));
console.log(`  面具清单 ${masks.length} 条 → src/content/masks/masks.json`);

// ---------- 3. 视频压缩短片 + poster ----------
console.log('== 视频 ==');
ensureDir(VIDEO_OUT);
ensureDir(join(ASSETS_OUT, 'video'));
const mediaItems = [];
for (const v of VIDEO_MAP) {
  const src = join(VIDEO_SRC, v.src);
  const mp4 = join(VIDEO_OUT, `${v.slug}.mp4`);
  const poster = join(ASSETS_OUT, 'video', `${v.slug}.jpg`);
  if (!existsSync(src)) {
    console.error(`  [缺失] ${v.src}`);
    continue;
  }
  if (!existsSync(mp4) || FORCE) {
    console.log(`  [转码] ${v.slug} (ss=${v.ss} t=${v.t})`);
    run('ffmpeg', ['-y', '-ss', String(v.ss), '-t', String(v.t), '-i', src,
      '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4]);
    done++;
  } else {
    skipped++;
  }
  if (!existsSync(poster) || FORCE) {
    run('ffmpeg', ['-y', '-ss', String(v.ss + Math.floor(v.t / 2)), '-i', src,
      '-frames:v', '1', '-update', '1', '-vf', "scale='min(1600,iw)':-2", '-q:v', '4', '-map_metadata', '-1', poster]);
    done++;
  }
  mediaItems.push({
    id: v.slug,
    slug: v.slug,
    title: v.title,
    src: `/media/video/${v.slug}.mp4`,
    poster: `video/${v.slug}.jpg`,
    durationSec: existsSync(mp4) ? probeDuration(mp4) : v.t,
    category: v.category,
    categoryLabel: v.categoryLabel,
    summary: v.summary,
    people: v.people,
    captureDate: v.captureDate,
    visibility: 'public',
    consentLevel: 'confirmed',
  });
}
ensureDir(join(ROOT, 'src', 'content', 'media'));
writeFileSync(join(ROOT, 'src', 'content', 'media', 'media.json'), JSON.stringify(mediaItems, null, 2));
console.log(`  影像清单 ${mediaItems.length} 条 → src/content/media/media.json`);

console.log(`\n完成：新处理 ${done} 项，跳过已存在 ${skipped} 项（--force 可强制重做）。`);
