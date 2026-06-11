import type {
  GetItemsDetails,
  GetPixCode,
  ItemDetails,
} from "packages/order.events";

export interface IEventPublisher {
  getPixCode(event: GetPixCode): Promise<string>;
  getItemsData(event: GetItemsDetails): Promise<ItemDetails[]>;
}
