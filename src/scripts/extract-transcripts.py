# 提取 13 份 DOCX 转写稿全文到 .notes/transcripts（仅作内部校对参考，不发布）
import zipfile, re, glob, os, sys

sys.stdout.reconfigure(encoding='utf-8')
SRC = r'E:\素材\一次分类(1)\一次分类\视频分类\素材转写\素材转写'
OUT = r'D:\展示网站\.notes\transcripts'
os.makedirs(OUT, exist_ok=True)

for f in sorted(glob.glob(os.path.join(SRC, '*.docx'))):
    with zipfile.ZipFile(f) as z:
        xml = z.read('word/document.xml').decode('utf-8')
    text = re.sub(r'<w:p[ >]', '\n', xml)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{2,}', '\n', text).strip()
    name = os.path.basename(f).replace('.docx', '.txt')
    open(os.path.join(OUT, name), 'w', encoding='utf-8').write(text)
    print(name, len(text))
