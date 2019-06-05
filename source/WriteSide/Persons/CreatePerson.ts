import { DTO } from "@eventia/core";


export class CreatePerson extends DTO<CreatePerson> {

    public readonly id: string;
    public readonly name: string;

}
