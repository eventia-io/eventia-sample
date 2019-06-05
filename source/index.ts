import {
    LoopbackCommandBus, Logger, LoopbackQueryBus,
    PullingEventStore, EventSourcedRepository, EventHandler, SubscribingEventProcessor, TrackingEventProcessor, InMemoryTokenStore, TailTrackingEventProcessor, HeadTrackingEventProcessor
} from "@eventia/core";
import {
    PostgreSQLEventStorageEngine
} from "@eventia/postgresql-eventstorage";
import * as pino from "pino";
import * as fastify from "fastify";

import { Person } from "./WriteSide/Persons/Person";
import { PersonCommandHandlers } from "./WriteSide/Persons/PersonCommandHandlers";
import { CreatePerson } from "./WriteSide/Persons/CreatePerson";
import { RenamePerson } from "./WriteSide/Persons/RenamePerson";
import { PersonCreated } from "./WriteSide/Persons/PersonCreated";
import { PersonRenamed } from "./WriteSide/Persons/PersonRenamed";


const logger = pino() as Logger;

const commandBus = new LoopbackCommandBus(logger);
const queryBus = new LoopbackQueryBus(logger);

const eventStorageEngine = new PostgreSQLEventStorageEngine(
    logger,
    "postgresql://eventstore:eventstore@localhost:5433/eventstore"
);
const eventStore = new PullingEventStore(logger, eventStorageEngine);

const personRepository = new EventSourcedRepository(logger, eventStore, Person);
const personCommandHandlers = new PersonCommandHandlers(personRepository);

commandBus.register(personCommandHandlers);

const server = fastify({ logger: logger });

async function subs(): Promise<void> {
    const token = await eventStore.createHeadToken();
    const subscription = eventStore.openStream(token);

    subscription.on("ready", (): void => {
        logger.info("READY");
    });

    for await (const message of subscription) {
        logger.info({ message }, "received message");
    }
}


class Projection1 {

    //    @EventHandler
    public async onPersonCreate(event: PersonCreated): Promise<void> {
        logger.info({ event, type: event.constructor.name });
    }

    @EventHandler
    public async onPersonRenamed(event: PersonRenamed): Promise<void> {
        logger.info({ event, type: event.constructor.name });
    }

}

class Projection2 {

    @EventHandler
    public async onPersonCreate(event: PersonCreated): Promise<void> {
        logger.info({ event, type: event.constructor.name });
    }

    @EventHandler
    public async onPersonRenamed(event: PersonRenamed): Promise<void> {
        logger.info({ event, type: event.constructor.name });
    }

}

server.get("/persons/:id/create/:name", async (request, reply): Promise<void> => {
    const command = new CreatePerson({
        id: request.params.id,
        name: request.params.name
    });

    const res = await commandBus.dispatch(command);

    reply.send(res);
});

server.get("/persons/:id/rename/:name", async (request, reply): Promise<void> => {
    const command = new RenamePerson({
        id: request.params.id,
        newName: request.params.name
    });

    const res = await commandBus.dispatch(command);

    reply.send(res);
});

server.listen(3000, (error, address): void => {
    if (error) {
        logger.error(error);
    }
});

const store = new InMemoryTokenStore(logger);
const processor = new HeadTrackingEventProcessor(logger, eventStore, store);
processor.register(new Projection1());
processor.register(new Projection2());
processor.start();

//subs();
