import { DTO } from "@eventia/core";


export class RenamePerson extends DTO<RenamePerson> {

    public readonly id: string;
    public readonly newName: string;

}
