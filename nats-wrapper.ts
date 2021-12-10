import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
    private _client?: Stan;

    get getClient() {
        if (!this._client) throw new Error('Connecting Error to NATS');

        return this._client;
    }

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });

        return new Promise<void>((resolve, reject) => {
            this.getClient.on('connect', () => {
                console.log('Connected to NATS');
                resolve();
            });
            this.getClient.on('error', (err) => {
                reject(err);
            })
        });


    }
}

//exporto la instancia y asi evito instanciar con NEW en las implementaciones(me permite usar el objeto directo y no parar por la instancio para crear el objeto)
export const natsWrapper = new NatsWrapper();