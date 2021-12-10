import mongoose from 'mongoose';
import { natsWrapper } from '../nats-wrapper';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-canceled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {

  if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined");
  if (!process.env.NATS_CLIENT_ID) throw new Error("NATS_CLIENT_ID must be defined");
  if (!process.env.NATS_URL) throw new Error("NATS_URL must be defined");
  if (!process.env.NATS_CLUSTER_ID) throw new Error("NATS_CLUSTER_ID must be defined");

  try {

    //coneccion a nats, que es el bus de eventos, ticketing es el id del cluster que tengo definido e n lsoa rchivos de implementacion
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

    //escucha el cierre del client para matar la comunmicacion con el bus de eventos, incluso si elimino el pod de la nats se ejecutara este cierre
    natsWrapper.getClient.on('close', () => {
      console.log('NATS connection closed!!!!');
      process.exit();//reacciona a la accion de cerrar el cliente inculso desde la consola
    });

    process.on('SIGINT', () => natsWrapper.getClient.close());
    process.on('SIGTERM', () => natsWrapper.getClient.close());

    //Listener que estaran escuchando la emision de eventos de (orderspyt) para la creacion y cancelacion
    new OrderCreatedListener(natsWrapper.getClient).listen();
    new OrderCancelledListener(natsWrapper.getClient).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      //useNewUrlParser: true,//no va en las nuevas versiones de mongo
      //useUnifiedTopology: true,
      //usecreateIndex:true
    });

    console.log('connecting to mongodb');

  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("v01");
    console.log("listening payments on port 3000.");
  });

}

start();
