import { Subjects, Publisher, PaymentCreatedEvent } from '@ticketshub/commun';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
