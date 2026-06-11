import type {
  TypeCreateOrderDTO,
  TypeCreateOrderResponseDTO,
} from "../dtos/createOrderDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { Order } from "../../domain/entities/Order";
import type { IEventPublisher } from "../../domain/messaging/IEventPubliser";
import type {
  GetItemsDetails,
  ItemDetails,
  GetPixCode,
} from "packages/order.events";

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly publisher: IEventPublisher,
  ) {}

  async execute(dto: TypeCreateOrderDTO): Promise<TypeCreateOrderResponseDTO> {
    const getItemsDetailsEvent: GetItemsDetails = {
      eventId: crypto.randomUUID(),
      eventType: "get.items.details",
      occurredAt: new Date(),
      payload: {
        itemIds: dto.items.map((item) => item.productId),
      },
    };

    console.debug("Requesting items details from inventory service");

    const itemsDetails: ItemDetails[] =
      await this.publisher.getItemsData(getItemsDetailsEvent);

    console.debug("Received items details from inventory service");

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

    order.id = await this.orderRepository.save(order);

    const event: GetPixCode = {
      eventId: crypto.randomUUID(),
      eventType: "get.pix.code",
      occurredAt: new Date(),
      payload: {
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        totalAmount: order.totalAmount,
      },
    };

    console.debug(
      "Requesting pix code from payment service, orderId:",
      order.id,
    );
    const pixCode = await this.publisher.getPixCode(event);
    console.debug("Received pix code from payment service");

    //todo change items status in inventory service to reserved those items for this order

    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      pixCode,
    };
  }
}
