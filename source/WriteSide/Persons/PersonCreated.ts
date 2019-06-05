import { DTO, DomainEvent } from "@eventia/core";


@DomainEvent
export class PersonCreated extends DTO<PersonCreated> {

    public readonly id: string;
    public readonly name: string;

}
