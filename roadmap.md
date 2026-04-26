# Visão do projeto

A ideia é construir uma plataforma de delivery com serviços independentes para pedidos, estoque, pagamento e notificação, usando comunicação síncrona quando a resposta precisa ser imediata e eventos assíncronos quando o fluxo pode seguir desacoplado.

Em microsserviços, cada serviço deve ter sua própria responsabilidade clara e, idealmente, sua própria persistência, porque transações ACID entre bancos diferentes deixam de ser práticas e o problema vira consistência distribuída.

## Escopo inicial

Comece com um recorte pequeno, mas completo:

- `api-gateway`
- `order-service`
- `inventory-service`
- `payment-service`
- `notification-service`
- RabbitMQ
- PostgreSQL por serviço
- observabilidade básica com logs estruturados

Esse recorte já permite praticar separação de serviços, mensageria assíncrona, Saga e leitura/escrita separadas sem explodir a complexidade no início.

## Arquitetura alvo

Para o seu caso, a melhor abordagem inicial é Saga por coreografia: o `order-service` publica `order.created`, o `inventory-service` reage reservando estoque, o `payment-service` processa pagamento e os serviços seguintes reagem a sucesso ou falha por eventos.

Essa abordagem aumenta o desacoplamento, embora complique rastreamento e debug, então você deve compensar isso com nomes de eventos consistentes, correlation IDs e logs bem estruturados.

## Serviços e responsabilidades

| Serviço                | Responsabilidade                                       |
| ---------------------- | ------------------------------------------------------ |
| `api-gateway`          | Entrada HTTP, auth simples, roteamento, rate limit     |
| `order-service`        | Criar pedido, mudar status, expor comandos e consultas |
| `inventory-service`    | Reservar e liberar estoque                             |
| `payment-service`      | Simular cobrança, aprovar ou falhar                    |
| `notification-service` | Consumir eventos finais e “enviar” notificações        |

Cada serviço deve ser pequeno, ter domínio claro e evitar compartilhar tabela ou schema com outro serviço, porque o padrão “database per service” reduz acoplamento e reforça autonomia do domínio.

## Roadmap por fases

### Fase 1

Antes de codar microsserviços, feche a base de sistemas distribuídos: comunicação síncrona vs assíncrona, consistência eventual, modos de falha, observabilidade e desenho de APIs.

Essa fase evita o erro comum de sair criando serviços sem entender que falha parcial, retries e duplicidade de mensagem são parte normal do sistema, não exceção.

#### O que estudar e decidir

- Quando usar HTTP e quando usar eventos
- O que é consistência eventual
- O que é idempotência
- O que é Saga e compensação
- Como nomear eventos
- Como propagar correlationId entre serviços

#### Entrega da fase

Ao fim dessa fase, produza um documento simples com:

- contexto do sistema
- lista de serviços
- responsabilidades
- eventos do domínio
- fluxos principais
- fluxos de falha

### Fase 2

Agora modele o domínio antes da infraestrutura. O pedido de delivery é um ótimo caso porque já traz estados, regras e compensações.

#### Modelagem mínima do domínio

##### Pedido

Estados sugeridos:

- `PENDING`
- `AWAITING_STOCK`
- `STOCK_CONFIRMED`
- `PAYMENT_APPROVED`
- `CONFIRMED`
- `CANCELLED`
- `PAYMENT_FAILED`
- `STOCK_FAILED`

##### Estoque

- produto
- quantidade disponível
- reserva por pedido
- liberação de reserva

##### Pagamento

- tentativa de cobrança
- status
- motivo da falha
- referência externa simulada

#### Regras principais

- Pedido só confirma se estoque e pagamento derem certo
- Se estoque falhar, pedido cancela
- Se pagamento falhar depois da reserva, estoque deve ser liberado
- Eventos devem ser imutáveis
- Comandos não devem depender da read model

Esses fluxos refletem a ideia central de Saga: cada serviço executa uma transação local, e falhas acionam ações compensatórias em vez de rollback distribuído tradicional.

### Fase 3

Monte o monorepo com Bun workspaces e padronize tudo desde o começo. O maior erro em projeto paralelo avançado é deixar cada serviço “com uma cara”. Seu objetivo aqui é consistência arquitetural.

#### Estrutura sugerida

- `apps/api-gateway`
- `apps/order-service`
- `apps/inventory-service`
- `apps/payment-service`
- `apps/notification-service`
- `packages/shared-kernel`
- `packages/contracts`
- `packages/test-utils`

#### Padronizações

- Bun + TypeScript em tudo
- Fastify para endpoints HTTP
- driver/ORM igual em todos os serviços
- logger padronizado
- validação com Zod
- config via `.env`
- Docker Compose para ambiente local

#### Entrega da fase

Subir localmente:

- RabbitMQ
- um PostgreSQL por serviço, ou bancos separados no mesmo Postgres
- todos os serviços respondendo `/health`

### Fase 4

Implemente primeiro o fluxo síncrono mínimo. Isso parece contraintuitivo em microsserviços, mas reduz ansiedade e te ajuda a validar o domínio antes da saga completa.

#### Primeiro fluxo

- `POST /orders`
- `order-service` valida payload
- cria pedido com status inicial
- persiste no write model
- retorna `orderId`

#### Objetivo

Aqui você ainda não fecha o pedido inteiro; você só garante que o serviço de pedidos existe, está limpo, e possui separação de:

- rota
- use case
- domínio
- repositório
- persistência

#### Entrega da fase

- criar pedido
- buscar pedido
- testes unitários do domínio
- testes de integração do endpoint

### Fase 5

Agora entra a mensageria. RabbitMQ faz sentido aqui porque o sistema é orientado a eventos e a fila ajuda a desacoplar os serviços.

#### Comece simples

Implemente:

- publisher no `order-service`
- consumer no `inventory-service`

#### Evento inicial

- `order.created`

#### Resposta do estoque

- `inventory.stock-reserved`
- `inventory.stock-rejected`

#### Cuidados obrigatórios

- mensagem com `eventId`
- `correlationId`
- `occurredAt`
- `eventType`
- `version`
- `payload`

#### Idempotência

Mensagens podem ser entregues mais de uma vez; por isso, o consumidor deve ser idempotente e capaz de ignorar reprocessamento do mesmo evento. Isso é uma das coisas mais importantes em qualquer arquitetura orientada a eventos com fila.

### Fase 6

Agora implemente a Saga principal do pedido. Em microservices, Saga é o padrão típico para coordenar transações distribuídas sem depender de two-phase commit, que traz latência alta e fragilidade.

#### Fluxo feliz

- Cliente cria pedido
- `order-service` publica `order.created`
- `inventory-service` reserva estoque e publica `inventory.stock-reserved`
- `payment-service` consome esse evento, processa pagamento e publica `payment.approved`
- `order-service` consome `payment.approved` e confirma pedido
- `notification-service` consome `order.confirmed`

#### Fluxo de falha

- Pedido criado
- Estoque reservado
- Pagamento falha
- `payment-service` publica `payment.failed`
- `inventory-service` consome `payment.failed` e libera estoque
- `order-service` muda pedido para cancelado
- `notification-service` notifica falha

Esse desenho mostra a essência de compensação em Saga: em vez de “desfazer” tudo com uma transação global, cada serviço faz sua parte e publica eventos para compensar falhas posteriores.

### Fase 7

Aqui entra CQRS de forma útil, não por modismo. CQRS separa comandos e consultas, o que permite modelos diferentes para escrita e leitura, e isso é especialmente útil quando o lado de leitura precisa ser mais rápido ou mais agregador.

#### Como aplicar sem exagerar

No `order-service`:

- write side: entidade rica, regras de negócio, transições de estado
- read side: tabela denormalizada para consulta rápida de pedidos

#### Queries sugeridas

- listar pedidos por cliente
- detalhar pedido
- listar pedidos por status
- dashboard simples de pedidos do dia

#### Projeções

As projeções podem ser atualizadas a partir dos eventos do domínio, construindo uma read model otimizada para resposta rápida. Esse é o ponto mais interessante do CQRS no projeto: mostrar que o modelo de leitura não precisa ser igual ao modelo transacional.

### Fase 8

Adicione consistência operacional. É aqui que o projeto deixa de ser “toy project”.

#### Itens obrigatórios

- Outbox Pattern no serviço de pedidos
- retries com backoff
- dead-letter queue
- consumer idempotente
- versionamento de eventos

A adoção de retry e monitoramento de filas é prática essencial em sistemas assíncronos, porque falhas transitórias são esperadas e precisam de tratamento explícito. Sem isso, sua arquitetura fica bonita no diagrama e frágil na execução.

#### Ordem recomendada

- idempotência
- retry
- dead-letter queue
- outbox
- reprocessamento manual de mensagens falhas

### Fase 9

Adicione observabilidade. Quanto mais coreografia por eventos, mais você precisa enxergar o fluxo distribuído.

#### Comece com o básico

- logs JSON
- `correlationId` em toda requisição e evento
- métricas simples
- health checks
- tracing depois

#### O que logar

- evento publicado
- evento consumido
- transição de estado
- erro de processamento
- retry
- compensação executada

A necessidade de monitorar filas, tempo de processamento e taxa de erro aparece como prática crítica em sistemas com RabbitMQ e microsserviços. Sem isso, você não consegue depurar falhas parciais nem provar que sua Saga está funcionando.

### Fase 10

Agora sim, coloque uma borda HTTP mais amigável. O `api-gateway` entra como porta de entrada única e ponto de políticas transversais, como autenticação e rate limiting.

#### O gateway deve fazer

- autenticar usuário
- rotear requests
- repassar `correlationId`
- limitar taxa
- centralizar headers comuns

#### O gateway não deve fazer

- regra de negócio de pedido
- orquestração da saga
- acessar banco de outros serviços

### Fase 11

Crie um front-end mínimo só para demo. Como você é backend-first, mantenha o front intencionalmente simples:

- criar pedido
- acompanhar status
- listar pedidos
- ver falha ou sucesso

Isso valoriza o projeto em portfólio, porque mostra o fluxo inteiro, inclusive eventual consistency e mudança de status em tempo real ou por polling.

### Fase 12

Teste em camadas. Em sistemas distribuídos, teste unitário sozinho não basta.

#### Estratégia

- unitário no domínio
- integração por serviço
- contrato dos eventos
- teste de fluxo E2E local com Docker Compose

#### Cenários obrigatórios

- pedido confirmado
- falta de estoque
- pagamento falho
- mensagem duplicada
- consumidor fora do ar
- reprocessamento após retorno do serviço

#### Ordem prática de implementação

##### Semana 1

- definir escopo
- modelar domínio
- desenhar eventos
- criar monorepo
- subir RabbitMQ e Postgres
- criar healthcheck em todos os serviços

##### Semana 2

- implementar `order-service`
- criar pedido
- consultar pedido
- testes do domínio

##### Semana 3

- integrar RabbitMQ
- publicar `order.created`
- implementar `inventory-service`
- reservar estoque
- publicar sucesso/falha

##### Semana 4

- implementar `payment-service`
- simular aprovação e falha
- fechar saga principal
- atualizar status do pedido

##### Semana 5

- implementar `notification-service`
- logs estruturados
- `correlationId`
- retries básicos

##### Semana 6

- aplicar CQRS no `order-service`
- criar read model
- projeções
- endpoints de consulta

##### Semana 7

- outbox
- dead-letter queue
- idempotência completa
- testes de falha

##### Semana 8

- `api-gateway`
- auth simples
- rate limit
- front demo básico
- README técnico caprichado

## Stack recomendada para esse roadmap

Como você já prefere Bun, TypeScript e Fastify, eu iria de:

- Bun
- TypeScript
- Fastify
- RabbitMQ
- PostgreSQL
- Drizzle ou Prisma
- Zod
- Pino para logs
- Docker Compose
- Vitest

Fastify e RabbitMQ combinam bem com um estilo de microsserviços orientado a eventos, e a comunicação assíncrona ajuda a reduzir acoplamento entre serviços quando comparada a fluxos totalmente síncronos.

## Critérios de “projeto bom”

Seu projeto fica realmente forte quando consegue demonstrar:

- separação clara de bounded contexts
- banco por serviço
- eventos bem definidos
- saga com compensação
- CQRS aplicado onde faz sentido
- idempotência
- logs rastreáveis por `correlationId`
- ambiente local reproduzível
- testes de falha, não só de sucesso

Esses pontos refletem justamente os pilares mais recorrentes em roadmaps e padrões de microsserviços: comunicação entre serviços, consistência distribuída, Saga, CQRS, observabilidade e resiliência.

    inventory-service reserva estoque e publica inventory.stock-reserved

    payment-service consome esse evento, processa pagamento e publica payment.approved

    order-service consome payment.approved e confirma pedido

    notification-service consome order.confirmed

Fluxo de falha

    Pedido criado

    Estoque reservado

    Pagamento falha

    payment-service publica payment.failed

    inventory-service consome payment.failed e libera estoque

    order-service muda pedido para cancelado

    notification-service notifica falha

Esse desenho mostra a essência de compensação em Saga: em vez de “desfazer” tudo com uma transação global, cada serviço faz sua parte e publica eventos para compensar falhas posteriores.
Fase 7

Aqui entra CQRS de forma útil, não por modismo. CQRS separa comandos e consultas, o que permite modelos diferentes para escrita e leitura, e isso é especialmente útil quando o lado de leitura precisa ser mais rápido ou mais agregador.
Como aplicar sem exagerar

No order-service:

    write side: entidade rica, regras de negócio, transições de estado

    read side: tabela denormalizada para consulta rápida de pedidos

Queries sugeridas

    listar pedidos por cliente

    detalhar pedido

    listar pedidos por status

    dashboard simples de pedidos do dia

Projeções

As projeções podem ser atualizadas a partir dos eventos do domínio, construindo uma read model otimizada para resposta rápida. Esse é o ponto mais interessante do CQRS no projeto: mostrar que o modelo de leitura não precisa ser igual ao modelo transacional.
Fase 8

Adicione consistência operacional. É aqui que o projeto deixa de ser “toy project”.
Itens obrigatórios

    Outbox Pattern no serviço de pedidos

    retries com backoff

    dead-letter queue

    consumer idempotente

    versionamento de eventos

A adoção de retry e monitoramento de filas é prática essencial em sistemas assíncronos, porque falhas transitórias são esperadas e precisam de tratamento explícito. Sem isso, sua arquitetura fica bonita no diagrama e frágil na execução.
Ordem recomendada

    idempotência

    retry

    dead-letter queue

    outbox

    reprocessamento manual de mensagens falhas

Fase 9

Adicione observabilidade. Quanto mais coreografia por eventos, mais você precisa enxergar o fluxo distribuído.
Comece com o básico

    logs JSON

    correlationId em toda requisição e evento

    métricas simples

    health checks

    tracing depois

O que logar

    evento publicado

    evento consumido

    transição de estado

    erro de processamento

    retry

    compensação executada

A necessidade de monitorar filas, tempo de processamento e taxa de erro aparece como prática crítica em sistemas com RabbitMQ e microsserviços. Sem isso, você não consegue depurar falhas parciais nem provar que sua Saga está funcionando.
Fase 10

Agora sim, coloque uma borda HTTP mais amigável. O api-gateway entra como porta de entrada única e ponto de políticas transversais, como autenticação e rate limiting.
O gateway deve fazer

    autenticar usuário

    rotear requests

    repassar correlationId

    limitar taxa

    centralizar headers comuns

O gateway não deve fazer

    regra de negócio de pedido

    orquestração da saga

    acessar banco de outros serviços

Fase 11

Crie um front-end mínimo só para demo. Como você é backend-first, mantenha o front intencionalmente simples:

    criar pedido

    acompanhar status

    listar pedidos

    ver falha ou sucesso

Isso valoriza o projeto em portfólio, porque mostra o fluxo inteiro, inclusive eventual consistency e mudança de status em tempo real ou por polling.
Fase 12

Teste em camadas. Em sistemas distribuídos, teste unitário sozinho não basta.
Estratégia

    unitário no domínio

    integração por serviço

    contrato dos eventos

    teste de fluxo E2E local com Docker Compose

Cenários obrigatórios

    pedido confirmado

    falta de estoque

    pagamento falho

    mensagem duplicada

    consumidor fora do ar

    reprocessamento após retorno do serviço

Ordem prática de implementação
Semana 1

    definir escopo

    modelar domínio

    desenhar eventos

    criar monorepo

    subir RabbitMQ e Postgres

    criar healthcheck em todos os serviços

Semana 2

    implementar order-service

    criar pedido

    consultar pedido

    testes do domínio

Semana 3

    integrar RabbitMQ

    publicar order.created

    implementar inventory-service

    reservar estoque

    publicar sucesso/falha

Semana 4

    implementar payment-service

    simular aprovação e falha

    fechar saga principal

    atualizar status do pedido

Semana 5

    implementar notification-service

    logs estruturados

    correlation ID

    retries básicos

Semana 6

    aplicar CQRS no order-service

    criar read model

    projeções

    endpoints de consulta

Semana 7

    outbox

    dead-letter queue

    idempotência completa

    testes de falha

Semana 8

    api-gateway

    auth simples

    rate limit

    front demo básico

    README técnico caprichado

Stack recomendada para esse roadmap

Como você já prefere Bun, TypeScript e Fastify, eu iria de:

    Bun

    TypeScript

    Fastify

    RabbitMQ

    PostgreSQL

    Drizzle ou Prisma

    Zod

    Pino para logs

    Docker Compose

    Vitest

Fastify e RabbitMQ combinam bem com um estilo de microsserviços orientado a eventos, e a comunicação assíncrona ajuda a reduzir acoplamento entre serviços quando comparada a fluxos totalmente síncronos.
Critérios de “projeto bom”

Seu projeto fica realmente forte quando consegue demonstrar:

    separação clara de bounded contexts

    banco por serviço

    eventos bem definidos

    saga com compensação

    CQRS aplicado onde faz sentido

    idempotência

    logs rastreáveis por correlationId

    ambiente local reproduzível

    testes de falha, não só de sucesso

Esses pontos refletem justamente os pilares mais recorrentes em roadmaps e padrões de microsserviços: comunicação entre serviços, consistência distribuída, Saga, CQRS, observabilidade e resiliência.
