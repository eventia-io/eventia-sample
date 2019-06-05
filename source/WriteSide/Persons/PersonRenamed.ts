import { DTO, DomainEvent } from "@eventia/core";


@DomainEvent
export class PersonRenamed extends DTO<PersonRenamed> {

    public readonly id: string;
    public readonly name: string;

}
