## Delivery app structure

```text
┌─────────────────────────────────────────────────────┐
│ API Gateway                                         │
│ (Fastify + autenticação)                             │
└──────────┬──────────┬──────────┬────────────────────┘
           │          │
  ┌──────▼──┐ ┌─────▼───┐ ┌───▼──────────┐
  │ Order    │ │Inventory│ │ Payment      │
  │ Service  │ │ Service │ │ Service      │
  └──────┬──┘ └─────┬───┘ └───┬──────────┘
           │          │
           └──────────▼─────────┘
                 Message Broker
               (RabbitMQ / Kafka)
                       │
               ┌────────▼────────┐
               │ Notification   │
               │ Service        │
               └─────────────────┘
```

## 📦 Estrutura de Monorepo

A melhor forma de gerenciar isso com Bun é via Bun Workspaces.

```text
delivery-platform/
├── package.json ← workspace root
├── bun.lockb
├── docker-compose.yml
│
├── packages/
│   └── shared/ ← tipos, eventos, utils compartilhados
│       ├── package.json
│       └── src/
│           ├── events/ ← definição dos Domain Events
│           │   ├── order.events.ts
│           │   ├── inventory.events.ts
│           │   └── payment.events.ts
│           └── types/
│               ├── order.types.ts
│               └── result.types.ts
│
└── services/
    ├── api-gateway/
    ├── order-service/
    ├── inventory-service/
    ├── payment-service/
    └── notification-service/
```

## Cada serviço tem a mesma estrutura interna

```text
order-service/
├── package.json
├── src/
│   ├── main.ts ← bootstrap Fastify
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Order.ts ← Aggregate Root
│   │   ├── value-objects/
│   │   │   ├── OrderId.ts
│   │   │   └── Money.ts
│   │   ├── events/
│   │   │   └── OrderCreated.ts
│   │   └── repositories/
│   │       └── IOrderRepository.ts ← interface (porta)
│   ├── application/
│   │   ├── commands/
│   │   │   ├── CreateOrder.command.ts
│   │   │   └── CreateOrder.handler.ts
│   │   └── queries/
│   │       ├── GetOrder.query.ts
│   │       └── GetOrder.handler.ts
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── routes/
│   │   │   └── plugins/
│   │   ├── messaging/
│   │   │   ├── publisher.ts ← publica eventos no broker
│   │   │   └── consumer.ts ← consome eventos de outros serviços
│   │   └── persistence/
│   │       └── PostgresOrderRepository.ts
│   └── container.ts ← DI manual ou tsyringe
```

## 🔄 Fluxo CQRS + Saga

### Criação de um Pedido (Command Side)

```text
POST /orders
│
▼
CreateOrderHandler
│ valida domínio
▼
Order.create() → gera OrderCreated event
│
├─ salva no banco (write model)
└─ publica OrderCreated no broker
```

### Saga de Pagamento (orquestração por eventos)

```text
OrderCreated
│
▼
inventory-service → reserva estoque
│ sucesso
▼
StockReserved
│
▼
payment-service → processa pagamento
│ sucesso │ falha
▼ ▼
PaymentConfirmed PaymentFailed
│ │
▼ ▼
order atualizado StockReleased (compensação)
│ │
▼ ▼
notification notification
```
