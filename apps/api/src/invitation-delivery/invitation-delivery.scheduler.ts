
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { InvitationDeliveryRepository } from './invitation-delivery.repository.js';
import { InvitationDeliveryWorker } from './invitation-delivery.worker.js';

@Injectable()
export class InvitationDeliveryScheduler
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    InvitationDeliveryScheduler.name,
  );

  private readonly intervalMs = 10_000;

  private timer: NodeJS.Timeout | null = null;
  private processing = false;
  private stopping = false;

  constructor(
    private readonly worker: InvitationDeliveryWorker,
    private readonly repository: InvitationDeliveryRepository,
  ) {}

  onModuleInit(): void {
    this.stopping = false;

    this.timer = setInterval(() => {
      void this.tick();
    }, this.intervalMs);

    this.logger.log('Invitation delivery scheduler started.');
  }

  onModuleDestroy(): void {
    this.stopping = true;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.logger.log('Invitation delivery scheduler stopped.');
  }

  private async tick(): Promise<void> {
    if (this.processing || this.stopping) {
      return;
    }

    this.processing = true;

    try {
      const recovered = await this.repository.recoverExhausted(
        new Date(),
      );

      if (recovered > 0) {
        this.logger.warn(
          `Recovered ${recovered} exhausted invitation deliveries.`,
        );
      }

      await this.worker.processOne();
    } catch {
      this.logger.error(
        'Invitation delivery processing failed.',
      );
    } finally {
      this.processing = false;
    }
  }
}
