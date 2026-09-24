# GeoHidro AI

Dashboard profissional e responsivo para apoio à decisão em monitoramento e alertas antecipados de riscos geo-hidrológicos, alinhado à **Meta 2.2.4 do PN-PDC 2025–2035**.

## O que está implementado

- Console operacional em dark mode com linguagem visual de Defesa Civil + IA.
- Mapa do Brasil com Google Maps via `iframe` `output=embed`, sem API key exposta no front-end.
- Camada GeoHidro AI sobreposta ao iframe, calculada em Web Mercator a partir de latitude/longitude.
- Marcadores georreferenciados para municípios demonstrativos: Petrópolis, Blumenau, Manaus, Recife, São Luís e Porto Alegre.
- Marcadores com estados de cobertura: monitorado, candidato e piloto.
- Seleção de município integrada ao dashboard e à fila operacional.
- Fila de alertas com supervisão humana: aprovar, reavaliar e rejeitar.
- Métricas da Meta 2.2.4: linha de base, cobertura atual, marcos de 2027/2031/2035 e lacuna restante.
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

A camada oferece círculos de risco, pulsação para sinalização, tooltip hidrológico, seleção, filtro por UF e filtro por risco. A arquitetura suporta centenas de municípios desde que os pontos sejam fornecidos por uma API ou stream externo. Como o iframe é isolado, pan e zoom livres do Google Maps ficam desabilitados para manter os marcadores alinhados; para navegação geográfica totalmente sincronizada, a evolução de produção deve usar um mapa controlável por SDK em um ambiente com credencial restrita por domínio.

Em produção, os dados demonstrativos devem ser substituídos por uma API segura ou serviço de streaming que forneça coordenadas, status de cobertura, risco, timestamp, qualidade e proveniência. A aplicação estática não deve conter credenciais privadas nem emitir alertas públicos autonomamente.

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
