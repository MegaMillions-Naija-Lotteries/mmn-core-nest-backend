import { randomBytes } from "crypto";
import dayjs from 'dayjs';
/**
 *
 * @param length - Generate Unique Code ( default length 32 )
 */
export function getUniqueCodev2(length = 32) {
    return randomBytes(length).toString("hex").slice(0, length)
}

export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}
