# gdr-site

Sito personale su giochi di ruolo: recensioni, avventure, racconti, blog.
Astro + MDX, contenuti in Markdown, zero JavaScript nelle pagine.

- **Anteprima**: https://michele-mogul.github.io/gdr-site/
- **Produzione**: Cloudflare Pages (da configurare, vedi *Deploy*)

---

## Comandi

```bash
npm install          # una volta sola
npm run dev          # server locale con ricarica, http://localhost:4321/gdr-site/
npm run build        # astro check + astro build -> dist/
npm run build:fast   # solo build, senza controllo dei tipi
npm run preview      # serve dist/ come lo servirà il sito vero
npm run check        # solo tipi e schemi
```

`npm run build` fallisce se un contenuto è malformato: campo obbligatorio mancante,
valore fuori intervallo, o una chiave scritta male nel frontmatter. È voluto — meglio
una build rossa che una pagina sbagliata online.

---

## Aggiungere un contenuto

Un contenuto è un file `.md` o `.mdx` dentro `src/content/<collection>/`.
Il nome del file diventa l'URL: `src/content/reviews/mork-borg.mdx` →
`/recensioni/mork-borg`.

| Collection | Cartella | URL |
|---|---|---|
| Recensioni | `src/content/reviews/` | `/recensioni/...` |
| Avventure | `src/content/adventures/` | `/avventure/...` |
| Racconti | `src/content/stories/` | `/racconti/...` |
| Blog | `src/content/blog/` | `/blog/...` |

Le cartelle hanno nome inglese (sono codice), gli URL restano in italiano: la
corrispondenza sta in `src/config.ts`, sotto `COLLECTION_META`.

### Campi comuni a tutte e quattro

```yaml
title: Titolo del pezzo          # obbligatorio
date: 2026-03-14                 # obbligatorio
tags: [osr, cairn]               # obbligatorio, almeno uno
excerpt: "Una frase o due."      # obbligatorio, max 320 caratteri
draft: true                      # opzionale, default false
slug: url-diverso-dal-file       # opzionale
```

> **Attenzione ai due punti.** In YAML `excerpt: Una serata: che disastro` è un errore
> di sintassi. Se il testo contiene `:`, va tra virgolette. Vale per qualsiasi campo.

### Recensione

```yaml
---
title: Mörk Borg
system: Mörk Borg                # gioco recensito
publisher: Free League
year: 2020                       # 1974 .. anno prossimo
pages: 96
rating: 4.5                      # da 1 a 5, mezzi punti ammessi
format: entrambi                 # cartaceo | pdf | entrambi
date: 2026-03-14
tags: [osr, apocalisse]
excerpt: "Novantasei pagine che urlano."
cover: ../../assets/reviews/mork-borg.png
coverAlt: Copertina gialla e nera
---
```

### Avventura

```yaml
---
title: La palude che ricorda
system: Cairn
levels: { min: 1, max: 3 }       # oggetto, non stringa
players: { min: 3, max: 5 }
hours: 4                         # anche 2.5
pdf: https://files.esempio.it/palude.pdf   # opzionale
pdfSize: 4,2 MB                  # opzionale, mostrato sul bottone
date: 2026-02-01
tags: [one-shot, cairn]
excerpt: "Un villaggio che affoga."
image: ../../assets/adventures/palude.png
imageAlt: Palude notturna
---
```

Se `pdf` c'è, sulla pagina compare il bottone di download. Se non c'è, non compare
niente: nessun placeholder, nessun link morto.

### Racconto

```yaml
---
title: L'ultima sessione
date: 2026-01-05
tags: [narrativa]
excerpt: "Il gruppo si scioglie dopo undici anni."
---
```

`readingTime` **non si scrive**: lo calcola `src/loaders/glob-with-reading-time.ts`
contando le parole del testo (200 parole al minuto), ignorando codice e tag dei
componenti.

### Articolo del blog

Solo i campi comuni, più `image` e `imageAlt` opzionali (se metti l'una serve l'altra:
altrimenti la build si ferma).

---

## Immagini

Vanno in `src/assets/`, **non** in `public/`: solo così Astro le ottimizza, genera i
formati moderni e le dimensioni giuste. Nel frontmatter si referenziano con un percorso
relativo al file di contenuto (`../../assets/reviews/nome.png`).

Le copertine attuali sono **placeholder generati**: sostituisci i file in
`src/assets/reviews/` e `src/assets/adventures/` tenendo lo stesso nome e non c'è altro
da toccare.

`public/` resta per i file che devono uscire intatti e con un URL prevedibile
(`favicon.ico`, `robots.txt`).

---

## Componenti dentro i file MDX

Disponibili in qualsiasi `.mdx` **senza importarli** (in un `.md` semplice no: serve
l'estensione `.mdx`).

```jsx
<Statblock
  name="Cavaliere putrescente"
  meta="Non-morto, taglia media"
  stats={{ CA: 14, PF: 22, Morale: 9 }}
>
  Spadone arrugginito +4, 1d8+2 danni.
</Statblock>

<TabellaIncontri
  title="Incontri nella palude"
  die="d6"
  rows={['Tre banditi affamati', 'Un carro rovesciato']}
/>

<Citazione source="Mörk Borg, p. 12">
  Il mondo finisce. Fatevene una ragione.
</Citazione>
```

`TabellaIncontri` numera le righe da sola; per intervalli non uno-per-riga si passa
`rolls={['1-2', '3', '4-6']}`. Per aggiungerne altri: creali in `src/components/mdx/`
e registrali in `src/components/mdx/index.ts`.

---

## Bozze

`draft: true` rende un contenuto visibile **solo** in `npm run dev`. In build sparisce
da pagine, indici, home, feed RSS, sitemap e pagine tag: non esiste proprio. Il filtro
sta in un posto solo, `src/lib/content.ts`.

---

## Tag

I tag attraversano le quattro sezioni: `/tag` elenca tutto, `/tag/<slug>` mostra i
contenuti di qualsiasi collection. Vengono normalizzati in minuscolo e deduplicati, e
lo slug toglie accenti e spazi (`Mörk Borg` → `mork-borg`).

---

## Feed e SEO

- `/rss.xml` — tutto
- `/recensioni/rss.xml`, `/avventure/rss.xml`, `/racconti/rss.xml`, `/blog/rss.xml`
- `/sitemap-index.xml`
- OpenGraph e Twitter card su ogni pagina; le bozze in dev escono `noindex`

---

## Deploy

### GitHub Pages (anteprima, attivo)

`.github/workflows/pages.yml` builda a ogni push su `main` e pubblica su
`https://michele-mogul.github.io/gdr-site/`. Va abilitato una volta in
**Settings → Pages → Source: GitHub Actions** (il token dell'Action non può farlo).

### Cloudflare Pages (produzione)

`.github/workflows/deploy.yml` builda e deploya a ogni push su `main`, ma **si salta da
solo finché i secret non ci sono**, così il repo non resta rosso.

1. Su Cloudflare crea un progetto Pages chiamato `gdr-site` (Direct Upload, senza
   collegare il repo: ci pensa l'Action).
2. Crea un API token con il permesso *Cloudflare Pages: Edit*.
3. Su GitHub, **Settings → Secrets and variables → Actions**:
   - secret `CLOUDFLARE_API_TOKEN`
   - secret `CLOUDFLARE_ACCOUNT_ID`
   - variabile `PUBLIC_SITE_URL` con il dominio finale, es. `https://esempio.it`

### Quando arriva il dominio

Origine e sotto-percorso sono variabili d'ambiente, quindi non c'è niente da
riscrivere:

```bash
PUBLIC_SITE_URL=https://esempio.it BASE_PATH=/ npm run build
```

I default stanno in `src/config.ts` (`SITE.url`, `SITE.base`) e oggi puntano
all'anteprima su GitHub Pages. Cambia quelli quando il dominio diventa la casa vera del
sito. Tutti i link interni passano da `src/lib/href.ts`: **non scrivere `href="/blog"` a
mano**, o sotto un sotto-percorso si rompe.

---

## PDF delle avventure su Cloudflare R2

I PDF non stanno nel repo: si caricano su R2 e nel frontmatter si mette l'URL pubblico.

```bash
npx wrangler r2 object put gdr-file/avventure/la-palude.pdf \
  --file=./la-palude.pdf --content-type=application/pdf
```

Poi nel bucket abilita l'accesso pubblico (dominio `r2.dev` o, meglio, un sottodominio
tuo tipo `files.esempio.it`) e incolla l'URL nel campo `pdf:`.

---

## Commenti (Giscus)

Spenti. Con `GISCUS.enabled: false` in `src/config.ts` non viene emesso **niente**:
nessun markup, nessuno script, nessuna richiesta a terzi.

Per accenderli: abilita le Discussions sul repo, prendi gli id da
[giscus.app](https://giscus.app), mettili in `src/config.ts` e imposta `enabled: true`.
Anche da accesi, lo script si carica solo quando la sezione commenti entra nello
schermo.

---

## Struttura

```
src/
  assets/            immagini ottimizzate da Astro
  components/        componenti di pagina
    mdx/             componenti usabili dentro i contenuti
  content/           i contenuti, una cartella per collection
  layouts/           BaseLayout (head, header, footer) ed EntryLayout (pagina contenuto)
  lib/               filtro bozze, tag, feed, href, tempo di lettura
  loaders/           loader glob con calcolo del tempo di lettura
  pages/             rotte, feed RSS, 404
  styles/global.css  token del tema e stile del testo lungo
  config.ts          nome del sito, URL, collection, Giscus
  content.config.ts  schemi Zod delle quattro collection
```

## Stack

Astro 7 · MDX · TypeScript strict · Tailwind 4 (+ typography) · Zod ·
Content Collections · deploy statico
