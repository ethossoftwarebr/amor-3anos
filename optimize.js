import sharp from 'sharp';
import { readdirSync, mkdirSync, statSync } from 'fs';
import { join, parse } from 'path';

const SRC = './originais';
const OUT = './assets/fotos';
const MAX_DIM = 1600;
const JPG_QUALITY = 82;
const WEBP_QUALITY = 80;

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC)
  .filter((f) => /^\d+\.jpe?g$/i.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));

console.log(`Encontradas ${files.length} fotos.`);

let totalIn = 0;
let totalOut = 0;

for (const file of files) {
  const inPath = join(SRC, file);
  const { name } = parse(file);
  const outJpg = join(OUT, `${name}.jpg`);
  const outWebp = join(OUT, `${name}.webp`);

  const inSize = statSync(inPath).size;
  totalIn += inSize;

  const pipeline = sharp(inPath)
    .rotate()
    .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true });

  await pipeline.clone().jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(outJpg);
  await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(outWebp);

  const outJpgSize = statSync(outJpg).size;
  const outWebpSize = statSync(outWebp).size;
  totalOut += outJpgSize;

  console.log(
    `${file}: ${(inSize / 1024 / 1024).toFixed(2)}MB → ${(outJpgSize / 1024).toFixed(0)}KB jpg / ${(
      outWebpSize / 1024
    ).toFixed(0)}KB webp`,
  );
}

console.log(
  `\nTotal: ${(totalIn / 1024 / 1024).toFixed(2)}MB → ${(totalOut / 1024 / 1024).toFixed(2)}MB JPG (${(
    (1 - totalOut / totalIn) * 100
  ).toFixed(0)}% redução)`,
);
