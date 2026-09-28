# GeoHidro AI

Dashboard profissional e responsivo para apoio à decisão em monitoramento e alertas antecipados de riscos geo-hidrológicos, alinhado à **Meta 2.2.4 do PN-PDC 2025–2035**.

## O que está implementado

- Console operacional em dark mode com linguagem visual de Defesa Civil + IA.
- Mapa do Brasil com Google Maps via `iframe` `output=embed`, sem API key exposta no front-end.
- Camada GeoHidro AI sobreposta ao iframe, calculada em Web Mercator a partir de latitude/longitude.
- Viewport nacional fixo, sem arraste ou zoom, garantindo a visualização simultânea do Brasil e de seus estados.
- Coordenadas alinhadas à `baseCities` do exemplo fornecido, usando exatamente centro `(-14.2350, -51.9253)`, zoom `4` e projeção Web Mercator em escala 1:1.
- Marcadores georreferenciados para municípios demonstrativos: Petrópolis, Blumenau, Manaus, Recife, São Luís e Porto Alegre.
- Marcadores com estados de cobertura: monitorado, candidato e piloto.
- Classificação única de risco em todo o produto: **Crítico (vermelho) → Alto (laranja) → Moderado (azul)**, incluindo círculos, legenda, fila, tabela e evidências.
- Filtro territorial do mapa por região: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.
- Seleção de município integrada ao dashboard e à fila operacional.
- Fila de alertas com supervisão humana: aprovar, reavaliar e rejeitar.
- Métricas da Meta 2.2.4: linha de base, cobertura atual, marcos de 2027/2031/2035 e lacuna restante.
- Indicador próprio MAV — 120 municípios adicionais validados para expansão assistida por IA, sobre a lacuna de referência de 1.205 municípios, com progresso visual de 9,96%.
- Saúde das fontes de dados, lineage, qualidade e freshness.
- Catálogo responsivo de municípios.
- Visão navegável da arquitetura: entrada, processamento, armazenamento, inferência, decisão e canais oficiais.
- Simulação de ingestão com feedback visual e registro demonstrativo da versão do modelo.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- shadcn/ui
- Lucide React
- Google Maps via iframe sem chave + camada React de marcadores em `client/src/components/Map.tsx`
- Wouter para navegação client-side

## Executar localmente

```bash
pnpm install
pnpm dev
```

Validar tipos e build:

```bash
pnpm run check
pnpm run build
```

## Google Maps sem API key

O mapa-base usa `https://maps.google.com/maps?...&output=embed`, conforme o exemplo fornecido, e não expõe API key. Como o conteúdo do iframe pertence a outro domínio, a aplicação não tenta inserir objetos JavaScript dentro do Google Maps. Em vez disso, o React mantém uma camada transparente acima do iframe e calcula a posição dos municípios por latitude/longitude usando projeção Web Mercator, com centro e zoom fixos iguais aos parâmetros do iframe.

A camada oferece círculos de risco priorizados por z-index, pulsação para sinalização, tooltip hidrológico, seleção, filtro por região e filtro por risco. A posição é calculada pelo mesmo algoritmo do exemplo anexado: `project(lat, lng, zoom)` com escala `tileSize * 2 ** zoom` e deslocamento em pixels a partir do centro do iframe, sem fator heurístico de compressão ou correção visual. A base demonstrativa inclui as onze cidades da `baseCities`, com latitudes, longitudes, regiões, probabilidades, chuva e modelo de IA. O iframe permanece deliberadamente não interativo para manter o enquadramento nacional estável e permitir a comparação visual dos municípios em um único painel, sem tentar acessar o DOM do Google Maps. A arquitetura suporta centenas de municípios desde que os pontos sejam fornecidos por uma API ou stream externo.

Em produção, os dados demonstrativos devem ser substituídos por uma API segura ou serviço de streaming que forneça coordenadas, status de cobertura, risco, timestamp, qualidade e proveniência. A aplicação estática não deve conter credenciais privadas nem emitir alertas públicos autonomamente.

## Indicador MAV

O MAV (Municípios Adicionais Validados para Monitoramento Assistido por IA) é um indicador interno do GeoHidro AI. Ele conta municípios que concluíram os gates de qualidade dos dados, validação espaço-temporal, desempenho técnico, OOD/abstention, shadow mode, auditabilidade e supervisão humana. No protótipo, o valor demonstrativo é **120** e a referência é a lacuna `2.500 − 1.295 = 1.205`; portanto, o progresso visual é `120 / 1.205 × 100 = 9,96%`. O MAV não representa municípios oficialmente incorporados ou monitorados pelo Cemaden.

## Organização principal

```text
client/src/pages/Home.tsx       # Dashboard, mapa, alertas e arquitetura
client/src/components/Map.tsx   # Loader e wrapper Google Maps
client/src/index.css            # Tokens, identidade visual e responsividade
client/index.html                # Metadados e fontes
```

## Escopo acadêmico e evolução para produção

O protótipo demonstra o fluxo de apoio à decisão, mas não substitui Cemaden, Cenad ou as Defesas Civis. O próximo passo de produção é conectar dados históricos e streams autenticados de pluviômetros, radar, satélite, rios, solo, relevo, geologia e ocorrências; adicionar persistência da trilha de auditoria; implementar modelos calibrados com validação espacial/temporal; e integrar somente os canais institucionais autorizados.

Os dados atuais de municípios, risco e qualidade são demonstrativos e devem ser claramente substituídos por fontes oficiais antes de qualquer uso operacional.
