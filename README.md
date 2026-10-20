# GeoHidro AI

Dashboard web responsivo para apoio à decisão em monitoramento e alertas antecipados de riscos geo-hidrológicos, alinhado à **Meta 2.2.4 do Plano Nacional de Proteção e Defesa Civil (PN-PDC 2025–2035)**.

O repositório contém um protótipo de frontend com dados demonstrativos. A aplicação organiza cobertura territorial, alertas, indicadores, observabilidade e uma arquitetura de referência para expansão assistida por IA, sem substituir os sistemas ou a autoridade técnica de Cemaden, Cenad ou Defesas Civis.

## Estado atual

- Aplicação React com nove visões internas: **Visão operacional**, **Contrato de validação**, **Simulador**, **Comparar modelos**, **Monitoramento**, **Governança de score**, **Municípios**, **Fila de alertas** e **Arquitetura**.
- Interface em tema escuro, responsiva e com linguagem visual de machine learning, observabilidade e decisão supervisionada.
- Menu lateral minimizado por padrão em telas desktop. A logomarca alterna entre o estado fechado e aberto; em telas móveis, a barra superior permanece adaptada ao layout responsivo.
- Hero visual com rede hidrográfica/neural, cartões de métricas e grids de operação territorial.
- Navegação client-side com Wouter. A rota principal é `/`; `/404` e a rota de fallback exibem a página de não encontrado.
- Tratamento de erro da aplicação com `ErrorBoundary` e notificações com Sonner.

## Funcionalidades disponíveis

### Visão operacional

- Métricas demonstrativas da Meta 2.2.4:
  - 1.295 municípios monitorados;
  - lacuna de 1.205 municípios até 2035;
  - 03 alertas em análise;
  - saúde do pipeline de 98,6%.
- Mapa nacional com cobertura GeoHidro AI e marcadores sobrepostos.
- Fila operacional com supervisão humana e ações **Aprovar**, **Reavaliar** e **Rejeitar**.
- Trajetória da meta com linha de base, cobertura atual e marcos de 2027, 2031 e 2035.
- Indicador próprio MAV — Municípios Adicionais Validados — com valor demonstrativo, lacuna de referência e tooltip metodológico.
- Painel demonstrativo de saúde das fontes, qualidade, atualização e lineage.
- Botão de simulação de ingestão na visão da fila de alertas, com feedback visual e toast de conclusão.

### Municípios

- Tabela responsiva de municípios monitorados.
- Busca normalizada, sem diferenciação de acentos, em todos os campos apresentados e indexados: município, UF, nome completo do estado, região, tipologia, risco, cobertura, modelo, chuva, score e texto de atualização.
- Seleção de um município a partir da tabela para retornar à visão operacional.
- Botão de exportação presente como ação demonstrativa; a exportação real ainda não está conectada a um serviço.

### Fila de alertas

- Ordenação única por criticidade: **Crítico → Alto → Moderado**.
- Três alertas demonstrativos, com probabilidade, tempo de antecedência, motivo e estado da decisão.
- Atualização local do estado do alerta após as ações disponíveis.

### Validação e comparação de modelos

- **Contrato de validação** demonstrativo para o primeiro caso: inundação urbana, nível/vazão, bacias e estações, horizonte de 6 horas, frequência de 15 minutos e divisão temporal `70% treino · 15% validação · 15% teste temporal`.
- Catálogo de fontes com requisito, finalidade e status de definição para pluviômetros, nível/vazão, radar meteorológico e solo/uso do solo.
- Lista de métricas do protocolo comum: MAE, RMSE, recall de evento, falsos alarmes, antecedência média e calibração.
- **Simulador de cenários** com reprodução histórica, estresse de chuva persistente e resiliência a fonte atrasada, comparando LSTM Hidro, Transformer e GNN Bacias em modo de análise.
- **Comparação de modelos** com score demonstrativo, métricas de referência, gates de validade, gates mínimos, robustez temporal e envio para revisão humana.

### Monitoramento pós-seleção

- **Monitoramento** com KPIs de saúde das fontes, score do champion, drift de entrada e tempo desde a última revisão.
- Série visual de score por janelas móveis, sinais para investigação e registro de champion/challengers.
- Ação demonstrativa para abrir uma reavaliação quando houver sinal de degradação ou necessidade de revisão.

### Governança do score

- **Governança de score** com perfis demonstrativos por tipo de risco: Inundação urbana, Cheia fluvial e Movimento de massa.
- Sliders para editar pesos, direção de cada critério e soma dos pesos; a interface sinaliza quando a soma é consistente.
- Fluxo visual de aprovação com Administrador, Revisor técnico, Especialista do domínio e publicação pelo Administrador.
- Ações de salvar rascunho e enviar recomendações para revisão são locais e demonstrativas.

### Arquitetura

- Fluxo visual de referência entre:
  1. Fontes & borda;
  2. Ingestão & qualidade;
  3. Lakehouse geo;
  4. Modelos probabilísticos;
  5. Analista Cemaden.
- O conteúdo da arquitetura descreve IoT, APIs, MQTT, event bus, PostGIS, séries temporais, feature store, registry de modelos, LSTM, Transformer, GNN, calibração, incerteza, MLOps, auditoria e supervisão humana como referência de evolução.

## Mapa e dados territoriais

O mapa-base usa um `iframe` público do Google Maps com `output=embed`:

```text
https://maps.google.com/maps?ll=-14.2350,-51.9253&z=4&output=embed
```

A implementação atual:

- não coloca API key do Google Maps no frontend;
- mantém o iframe em um viewport nacional fixo, sem arraste ou zoom pela camada da aplicação;
- calcula a posição dos círculos em React usando projeção Web Mercator, centro `(-14.235, -51.9253)`, zoom `4` e `tileSize` `256`;
- mantém uma camada transparente sobre o iframe para círculos, pulsação, seleção, hover, tooltips e filtros;
- filtra os municípios por região — Norte, Nordeste, Centro-Oeste, Sudeste e Sul — e por risco;
- prioriza visualmente o município em hover ou foco para que seu tooltip permaneça acima dos demais marcadores;
- usa a classificação única de risco definida em `client/src/lib/risk.ts`:
  - **Crítico** — vermelho `#d9283e`;
  - **Alto** — laranja `#F37021`;
  - **Moderado** — azul `#1d5fa7`.

O dataset demonstrativo é declarado em `client/src/pages/Home.tsx` e contém 11 municípios:

- Petrópolis — RJ;
- Blumenau — SC;
- São Sebastião — SP;
- Recife — PE;
- Belo Horizonte — MG;
- Manaus — AM;
- Goiânia — GO;
- Rio Branco — AC;
- Porto Alegre — RS;
- Salvador — BA;
- Vitória — ES.

Os nomes, coordenadas, riscos, scores, tipologias, modelos, chuvas e estados de cobertura são dados estáticos do protótipo. Não há API de domínio, banco de dados ou stream operacional implementado no repositório.

## Atualização visual de satélite

O mapa exibe uma faixa horizontal translúcida em loop infinito para simular fluxo contínuo de atualização de dados. A animação:

- usa transformação CSS e não captura ponteiro;
- respeita `prefers-reduced-motion`;
- ajusta opacidade e duração conforme a freshness e o sinal retornados pela telemetria;
- não substitui uma imagem de satélite exibida sobre o mapa.

Durante a execução, `client/src/components/Map.tsx` consulta fontes públicas da NOAA:

- imagem: GOES-18 ABI GeoColor Full Disk;
- telemetria: série X-ray GOES de um dia.

A consulta ocorre inicialmente e depois a cada cinco minutos. O painel mostra os estados **Ao vivo**, **Atrasada**, **Indisponível**, **Sem conexão** ou **Sincronizando**, além do horário da imagem quando o cabeçalho público `Last-Modified` está disponível. Se a consulta falhar, a aplicação mantém um fallback visual seguro.

## Indicador MAV

O MAV (Municípios Adicionais Validados para Monitoramento Assistido por IA) é um indicador interno do GeoHidro AI. No protótipo, o valor demonstrativo é **120**.

A lacuna de referência é derivada da trajetória da meta:

```text
target2035 − currentCoverage
2.500 − 1.295 = 1.205 municípios
```

O progresso visual atual é calculado como:

```text
120 / 1.205 × 100 = 9,96%
```

O tooltip do MAV descreve gates de qualidade dos dados, validação espaço-temporal, desempenho técnico, OOD/abstention, shadow mode, auditabilidade e supervisão humana. O indicador não representa cobertura oficial do Cemaden. Em uma implementação real, deve contar apenas municípios adicionais únicos que concluíram todos os gates, sem duplicar municípios já contabilizados.

## Stack

- React 19;
- TypeScript;
- Vite 7;
- Tailwind CSS 4 com `@tailwindcss/vite`;
- componentes de interface baseados em shadcn/ui e Radix UI;
- Lucide React para ícones;
- Wouter para roteamento client-side;
- Sonner para notificações;
- Express e esbuild apenas para empacotar e servir o build produzido;
- Google Maps em iframe público, com camada React de marcadores;
- `pnpm` como gerenciador de pacotes, conforme o campo `packageManager` do `package.json`.

O template é classificado como `web-static`. O diretório `server/` contém apenas um servidor mínimo para servir arquivos estáticos do build e encaminhar as rotas client-side; não há endpoints de negócio, persistência ou API de domínio implementados.

## Pré-requisitos

- Node.js compatível com o ambiente Vite/TypeScript do projeto;
- pnpm 10.4.1, versão declarada no campo `packageManager` do `package.json`.

O repositório não contém `.nvmrc` nem outro arquivo que fixe a versão do Node.js.

## Instalação e execução local

Na raiz do projeto:

```bash
pnpm install
pnpm dev
```

O comando `pnpm dev` executa `vite --host`. A porta padrão configurada pelo projeto WebDev é `3000`; o servidor Vite pode usar a configuração de porta disponível no ambiente.

Para verificar tipos e gerar o build de produção:

```bash
pnpm run check
pnpm run build
```

O build executa duas etapas:

1. Vite gera o frontend em `dist/public`;
2. esbuild empacota `server/index.ts` em `dist/index.js`.

Depois do build, o servidor mínimo pode ser iniciado com:

```bash
pnpm start
```

`pnpm start` executa `NODE_ENV=production node dist/index.js`. A porta é definida por `PORT` quando informada; caso contrário, o código usa `3000`.

Para abrir o build com o servidor de preview do Vite:

```bash
pnpm run preview
```

Para formatar os arquivos conforme `.prettierrc`:

```bash
pnpm run format
```

Não há script `test` declarado no `package.json`; portanto, `pnpm test` não é um comando disponível pelo projeto neste estado.

## Configuração e variáveis de ambiente

Não há arquivo `.env.example` versionado. Os arquivos `.env*` são ignorados pelo `.gitignore`.

As referências de configuração encontradas no código são:

- `PORT`: porta usada pelo servidor mínimo de `server/index.ts`; padrão `3000`.
- `VITE_OAUTH_PORTAL_URL` e `VITE_APP_ID`: lidos por `client/src/const.ts` para montar uma URL de login OAuth quando esse helper é utilizado.
- `VITE_ANALYTICS_ENDPOINT` e `VITE_ANALYTICS_WEBSITE_ID`: referenciados no script de analytics de `client/index.html`.
- `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`: usados apenas pelo proxy de desenvolvimento `/manus-storage` definido em `vite.config.ts` para resolver assets armazenados no ambiente Manus.

Credenciais privadas não devem ser colocadas no frontend nem versionadas. A execução básica do dashboard não define uma API de domínio própria e usa dados demonstrativos locais.

O fundo neural do hero é referenciado no CSS por um caminho de armazenamento Manus (`/manus-storage/neural-hydro-field_68406db2.jpg`). Em um ambiente fora do runtime Manus, esse asset dependerá de uma substituição por arquivo ou serviço de armazenamento disponível nesse ambiente.

## Organização do repositório

```text
client/
  index.html                    # Metadados, título, fontes e analytics
  public/                       # Arquivos públicos pequenos; atualmente sem mídia do dashboard
  src/
    App.tsx                     # Tema, ErrorBoundary, Toaster e rotas Wouter
    main.tsx                    # Entrada React
    pages/Home.tsx              # Visões, dados demonstrativos e interações do dashboard
    pages/NotFound.tsx          # Fallback de página não encontrada
    components/Map.tsx          # Iframe do mapa, projeção, marcadores e telemetria NOAA
    components/ui/               # Primitivos Radix/shadcn/ui
    contexts/ThemeContext.tsx    # Contexto de tema
    hooks/                       # Hooks reutilizáveis do template
    lib/risk.ts                  # Níveis, prioridade, cores e classes de risco
    lib/model-governance.ts      # Contrato, métricas, cenários, scores e monitoramento
    lib/utils.ts                 # Utilitários de frontend
    const.ts                     # Helpers de configuração/OAuth
    index.css                    # Tokens, identidade visual, responsividade e animações
server/
  index.ts                      # Servidor mínimo para servir dist/public
shared/
  const.ts                      # Constantes compartilhadas pelo template
patches/
  wouter@3.7.1.patch             # Patch local da dependência Wouter
vite.config.ts                  # Plugins Vite, aliases e proxy de storage Manus
package.json                    # Scripts, dependências e package manager
pnpm-lock.yaml                  # Lockfile do pnpm
components.json                 # Configuração de aliases/componentes shadcn/ui
template.json                   # Metadados do template web-static
```

## Limitações atuais e evolução

O protótipo ainda não implementa:

- API de domínio;
- banco de dados ou persistência;
- ingestão real de pluviômetros, radares, rios, solo, relevo ou ocorrências;
- stream de municípios em tempo real;
- autenticação integrada às visões atuais;
- exportação real do catálogo;
- geração ou envio autônomo de alertas;
- treinamento ou inferência real de LSTM, Transformer ou GNN;
- execução real de métricas sobre previsões e observações;
- persistência do contrato, cenários, scores, versões, aprovações ou reavaliações;
- autenticação e autorização por perfil para a governança;
- publicação operacional de um champion ou alertas.

As telas de validação, simulador, comparação, monitoramento e governança são protótipos interativos: usam dados e resultados demonstrativos definidos em `client/src/lib/model-governance.ts`.

Para uma evolução em produção, os dados estáticos devem ser substituídos por serviços autenticados, com contratos de dados, proveniência, timestamps, qualidade, persistência da trilha de auditoria, validação espacial/temporal, modelos calibrados, guardrails e integração somente com canais institucionais autorizados.
