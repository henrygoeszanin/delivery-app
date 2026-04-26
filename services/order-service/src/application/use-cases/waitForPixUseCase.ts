import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";

type PixResult =
  | { ready: true; pixCode: string; paymentId: string; amount: number }
  | { ready: false };

export class WaitForPixUseCase {
  private readonly POLL_INTERVAL_MS = 1000; // checa a cada 1s
  private readonly TIMEOUT_MS = 60000; // desiste após 60s

  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(orderId: string): Promise<PixResult> {
    const deadline = Date.now() + this.TIMEOUT_MS;

    while (Date.now() < deadline) {
      const order = await this.orderRepo.findById(orderId);

      if (order?.pixCode && order?.paymentId) {
        return {
          ready: true,
          pixCode: order.pixCode,
          paymentId: order.paymentId,
          amount: order.totalAmount,
        };
      }

      await Bun.sleep(this.POLL_INTERVAL_MS);
    }

    return { ready: false };
  }
}
