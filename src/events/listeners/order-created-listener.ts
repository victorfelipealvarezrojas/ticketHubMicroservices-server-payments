import { Message } from 'node-nats-streaming';
import { Listener, Subjects, OrderCreatedEvent } from "@ticketshub/commun";
import { queueGropuName } from "./queue-group-name";
import { Order } from '../../models/order';

//esta escuchando las ordenes creadas en orderpyt que son transmitidas al nats como evento
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;//es el canal

    queueGropuName = queueGropuName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        const order = await Order.buildOrder({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version,
        });

        await order.save();

        msg.ack();
    }
}
