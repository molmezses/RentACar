import { BadRequestException } from "@nestjs/common";
import { PartialType } from "@nestjs/swagger";
import { CreateVehicleDto } from "./create-vehicle.dto.js";

export class UpdateVehicleDto extends PartialType(CreateVehicleDto, {
  skipNullProperties: false,
}) {}

export function assertNonEmptyVehicleUpdate(dto: UpdateVehicleDto): void {
  if (Object.keys(dto).length === 0) {
    throw new BadRequestException(
      "At least one vehicle field must be provided.",
    );
  }
}
