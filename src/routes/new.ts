import express, { Request, Response } from 'express';
import { stripe } from '../stripe';
import { body } from 'express-validator';
import { RequireAuth, ValidateRequest, BadRequestError, NotFounError, NotAuthorizedError, OrderStatus } from '@ticketshub/commun';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';
import { natsWrapper } from '../../nats-wrapper';

const router = express.Router();

router.post('/api/payments',
  RequireAuth,
  [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty()
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFounError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, //la plataforma trabaja en centabios y 1 dolar son 100 centabos (1 * 100)
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.getClient).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.send({
      id: payment.id
    });

  }
);

export { router as createChargeRouter };
