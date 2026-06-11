import type {
  GetItemsDetails,
  OrderCreated,
  ItemDetails,
} from "packages/order.events";

export interface IEventPublisher {
  createOrder(event: OrderCreated): Promise<void>;
  getItemsData(event: GetItemsDetails): Promise<ItemDetails[]>;
}
