import { SelectRadioShowSession } from 'src/database/radio-show-session.entity';

export interface RadioShowSessionResponse {
  session: SelectRadioShowSession;
  draws: any[];
  show: any;
  stats: {
    pending_draws: number;
    active_draws: number;
    total_winners: number;
    totalEntries: number;
  };
  userId: number;
  status: 'active' | 'ended' | 'paused';
}
