import { users } from "./user.entity";
import { radioStations } from "./radio-station.entity";
import { radioDraws } from "./radio-draw.entity";
import { radioJackpotDraws } from "./radio-jackpot-draw.entity";
import { radioTickets } from "./radio-ticket.entity";
import { stationUsers } from "./station-user.entity";
import { managers } from "./manager.entity";
import { transactions } from "./transaction.entity";
import { radioShows } from "./radio-show.entity";
import { radioShowSessions } from "./radio-show-session.entity";
import { paymentMethods } from "./payment-method.entity";
import { paymentMethodConfigs } from "./payment-method-config";

export const schema = {
  users,
  radioStations,
  radioDraws,
  radioJackpotDraws,
  radioShows,
  radioShowSessions,
  radioTickets,
  paymentMethods,
  paymentMethodConfigs,
  stationUsers,
  managers,
  transactions,
};

export type Schema = typeof schema;

export {
  users,
  radioStations,
  radioDraws,
  radioShowSessions,
  radioJackpotDraws,
  radioTickets,
  stationUsers,
  radioShows,
  managers,
  transactions,
  paymentMethodConfigs,
  paymentMethods
};