export interface DrawResponse {
    draw: boolean;
    message?: string;
    winner?: {
        ticket_id: string;
        ticket_uuid: string;
        phone: string;
        user_name: string;
        won_at: string | null;
        prize_claimed: boolean;
    } | null;
    conducted_at?: string | null;
}
