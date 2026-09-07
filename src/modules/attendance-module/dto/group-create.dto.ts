import { IsNotEmpty, IsString } from "class-validator";

export default class GroupCreateDTO {
  @IsString()
  @IsNotEmpty()
  public name!: string;
}
import { IsNotEmpty, IsString } from "class-validator";

export default class GroupCreateDTO {
  @IsString()
  @IsNotEmpty()
  public name!: string;
}
iimport 
