import config from '../config/config.js'
import mongoose from 'mongoose'

export let User
export let Product
export let Cart
export let Ticket

console.log(`Persistencia con ${config.PERSISTENCE}`);

switch (config.PERSISTENCE) {
    case 'MONGO':
        mongoose.connect(config.DBURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            DBNAME: config.DBNAME
        })

        .then(() => console.log('MongoDB connected'))
        .catch((err) => CustomError.createError(`Error in MongoDB connection`, err))

        const { default: UserMongo } = await import('./mongo/users.mongo.js')
        const { default: ProductMongo } = await import('./mongo/products.mongo.js')
        const { default: CartMongo } = await import('./mongo/carts.mongo.js')
        const { default: TicketMongo } = await import('./mongo/tickets.mongo.js')

        User = UserMongo
        Product = ProductMongo
        Cart = CartMongo
        Ticket = TicketMongo

        break;

    case 'FILE':
        const { default: UserFile } = await import('./file/users.file.js')
        const { default: ProductFile } = await import('./file/products.file.js')
        const { default: CartFile } = await import('./file/carts.file.js')
        const { default: TicketFile } = await import('./file/tickets.file.js')

        User = UserFile
        Ticket = TicketFile
        Product = ProductFile
        Cart = CartFile

        break;

    default:
        break;
}

