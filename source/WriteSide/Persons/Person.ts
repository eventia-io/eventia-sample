import { AggregateIdentifier, apply, EventSourcingHandler } from "@eventia/core";

import { PersonCreated } from "./PersonCreated";
import { PersonRenamed } from "./PersonRenamed";


export class Person {

    @AggregateIdentifier
    protected id: string;

    protected name: string;

    public create(id: string, name: string): void {
        apply(this, new PersonCreated({
            id, name
        }));
    }

    public rename(newName: string): void {
        if (this.name !== newName) {
            apply(this, new PersonRenamed({
                id: this.id,
                name: newName
            }));
        }
    }

    @EventSourcingHandler
    protected onPersonCreated(event: PersonCreated): void {
        this.id = event.id;
        this.name = event.name;
    }

    @EventSourcingHandler
    protected onPersonRenamed(event: PersonRenamed): void {
        this.name = event.name;
    }

}
