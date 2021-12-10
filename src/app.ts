import express from "express";
import 'express-async-errors';
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFounError } from "@ticketshub/commun";
import { createChargeRouter } from './routes/new';

const app = express();
app.set('trust proxy', true);//no acepta otros proxys, ngnex los mete a todos en el msimo proxy y si es distinto no lo acepta
app.use(express.json());
//me eprmite configurar las cookies y hace posible que en las peticiones se incruste el jwt dentyro de las cookies de forma automatica
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'//que solo funcione para protocolo https, me obliga a configurar settings(trust proxy,true)
    })
);

/*
  Rutas de usuario
*/
app.use(currentUser);
app.use(createChargeRouter);


//controlo rutas que no existan
app.all('*', async (req, res) => {
    throw new NotFounError();
});

/*
  controlador de errores, middleware
  es llamado desde cualquiera de las rutas al ocurir algun error e instanciar la clase manejadora de errores
*/
app.use(errorHandler);

export { app };