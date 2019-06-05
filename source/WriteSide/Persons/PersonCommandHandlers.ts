import { Repository, CommandHandler } from "@eventia/core";

import { CreatePerson } from "./CreatePerson";
import { Person } from "./Person";
import { RenamePerson } from "./RenamePerson";


export class PersonCommandHandlers {

    public constructor(protected readonly repository: Repository<Person>) {
    }

    @CommandHandler
    public async create(command: CreatePerson): Promise<void> {
        const person = new Person();
        person.create(command.id, command.name);

        await this.repository.save(person);
    }

    @CommandHandler
    public async rename(command: RenamePerson): Promise<void> {
        const person = await this.repository.load(command.id);
        person.rename(command.newName);
        await this.repository.save(person);
    }

}
