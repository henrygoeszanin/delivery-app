import type { TypeCreateOrderDTO } from "../dtos/createOrderDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { Order } from "../../domain/entities/Order";
import type { IEventPublisher } from "../../domain/messaging/IEventPubliser";
import type {
  GetItemsDetails,
  ItemDetails,
  OrderCreated,
} from "packages/order.events";

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly publisher: IEventPublisher,
  ) {}

  async execute(dto: TypeCreateOrderDTO) {
    const getItemsDetailsEvent: GetItemsDetails = {
      eventId: crypto.randomUUID(),
      eventType: "get.items.details",
      occurredAt: new Date(),
      payload: {
        itemIds: dto.items.map((item) => item.productId),
      },
    };

    const itemsDetails: ItemDetails[] =
      await this.publisher.getItemsData(getItemsDetailsEvent);

    const itemsWithDetails = dto.items.map((requestedItem) => {
      const detail = itemsDetails.find(
        (item) => item.productId === requestedItem.productId,
      );

      if (!detail) {
        throw new Error(
          `Product ${requestedItem.productId} not found or unavailable`,
        );
      }

      if (requestedItem.quantity > detail.quantity) {
        throw new Error(
          `Insufficient stock for product ${requestedItem.productId}. ` +
            `Requested: ${requestedItem.quantity}, Available: ${detail.quantity}`,
        );
      }

      return {
        productId: requestedItem.productId,
        quantity: requestedItem.quantity,
        unitPrice: detail.unitPrice,
      };
    });

    const order = Order.create(dto.customerId, itemsWithDetails);

    await this.orderRepository.save(order);

    const event: OrderCreated = {
      eventId: crypto.randomUUID(),
      eventType: "order.created",
      occurredAt: new Date(),
      payload: {
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        totalAmount: order.totalAmount,
      },
    };

    await this.publisher.createOrder(event);

    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
