import { PartialType } from "@nestjs/mapped-types";
import { CreateRadioStationDto } from "./create-radio-station.dto";

export class UpdateRadioStationDto extends PartialType(CreateRadioStationDto) {}
