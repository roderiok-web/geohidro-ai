# GeoHidro AI

Dashboard profissional e responsivo para apoio à decisão em monitoramento e alertas antecipados de riscos geo-hidrológicos, alinhado à **Meta 2.2.4 do PN-PDC 2025–2035**.

## O que está implementado

- Console operacional em dark mode com linguagem visual de Defesa Civil + IA.
- Mapa real do Brasil usando o componente Google Maps provisionado pelo ambiente Manus.
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
- Google Maps JavaScript API via o `MapView` provisionado em `client/src/components/Map.tsx`
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

## Google Maps

A integração usa o proxy de mapas configurado pelo ambiente, sem solicitar uma chave ao usuário. O componente `MapView` carrega as bibliotecas `marker`, `places`, `geocoding` e `geometry`. Os marcadores são criados com `google.maps.marker.AdvancedMarkerElement` e recebem conteúdo HTML customizado para representar a cobertura GeoHidro AI.

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
