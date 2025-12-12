import { SelectRadioTicket } from '../../database/radio-ticket.entity';

export interface ExtendedRadioTicket extends SelectRadioTicket {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  ticketUuid: string;
  userId: number;
  stationId: number;
  drawId: number | null;
  quantity: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  invalidatedAt: Date | null;
  userName: string;
  userEmail: string;
}
