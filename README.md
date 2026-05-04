# 3 anos — JP & Fer 💌

Página romântica de aniversário de 3 anos de namoro (05/05/2026).

## Estrutura

```
.
├── index.html              # SPA com 8 atos
├── erro.html               # página 404 (do botão "Não")
├── styles/
│   ├── base.css
│   ├── galaxia.css
│   ├── carta.css
│   └── pergaminho.css
├── scripts/
│   ├── main.js
│   ├── coracoes.js
│   ├── timeline.js
│   ├── carta.js
│   ├── contrato.js
│   └── final.js
├── assets/fotos/           # 12 fotos otimizadas (jpg + webp)
├── vercel.json
├── .vercelignore
├── optimize.js             # script Node pra comprimir originais
└── package.json
```

## Deploy no Vercel

1. Instalar Vercel CLI (uma vez): `npm i -g vercel`
2. Na raiz do projeto: `vercel --prod`
3. Escolher um nome de subdomínio na primeira vez (ex: `joaoefer`, `3anosnossos`, `piculinha`)
4. Pegar a URL e mandar pra Fer

Como `.vercelignore` exclui originais (58MB), só sobem os 1.6MB otimizados — deploy em segundos.

## Re-otimizar fotos (caso troque)

Coloque novas fotos numeradas `1.jpg` até `12.jpg` em `originais/`, depois:

```sh
npm install
npm run optimize
```

Saída em `assets/fotos/`. A pasta `originais/` está no `.gitignore` e `.vercelignore`,
então não vai pro repo nem pro deploy — só o conteúdo otimizado.

## Testar localmente

```sh
npx serve .
```

Abre em `http://localhost:3000`.

## Música

Spotify embed (Vem Cá + Saturno) — track IDs já configurados em `index.html`.
Se a Fer tiver Spotify free, tocam só 30s. Com Premium, tocam inteiras.

## O coração da página

Atos 1–5: galáxia (capa, declaração, timeline, apelidos, trilha)
**Ato 6: A Carta** — texto manuscrito digital (fonte Caveat) com reveal por scroll
Ato 7: Contrato de renovação (canvas de assinatura + botão "Não" fugitivo)
Ato 8: Final feliz (confete + download do contrato como PNG)
