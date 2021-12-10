import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@ticketshub/commun';

//lista de propiedades que tenemos que proporcionar al construir en orden
interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

//lista de propiedades que tiene una orden
interface orderDocument extends mongoose.Document {
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

//la lista de propiedades que contiene el propio modelo
interface OrderModel extends mongoose.Model<orderDocument> {
    buildOrder(attrs: OrderAttrs): orderDocument;
}

//defino el esquema que tendra la entidad de usuario
const orderShema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    }
}, {
    toJSON: {
        //elimino propiedades que trae por defecto el modelo que maneja mongoose
        transform(doc, ret,) {
            ret.id = ret._id;//elimino _ del id
            delete ret._id;
        }
    }
});

//al momento de guardar el registro usare esta funcion asi aseguro utilizar las mismas version en el registro
orderShema.statics.buildOrder = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status
    })
}

/*
    Nota: (updateIfCurrentPlugin)Este complemento brinda un control de concurrencia optimista a los documentos de Mongoose al aumentar 
          los números de versión del documento en cada guardado y evitar que las versiones anteriores de un documento se guarden sobre 
          la versión actual. 
*/

//para controlar la version del registro y utilizar la que llega por el evento y no el que define moongo x defecto
orderShema.set('versionKey', 'version');//queremos establecer la clave de versión a la versión
orderShema.plugin(updateIfCurrentPlugin);//conectaremos el socket en sí, así que ordene el esquema, socket y pase una actualización si está vigente

//creo el modelo que es lo que me permitira acceder al conjunto de los datos, representa la coleccion de usuarios y me eprmite realizar (CRUD).
const Order = mongoose.model<orderDocument, OrderModel>('Order', orderShema);

export { Order };