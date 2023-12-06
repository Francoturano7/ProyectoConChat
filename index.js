//Create Server
const express = require(`express`)
const DataBaseProducts = require("./dao/db.products")
const {engine}= require("express-handlebars")
const DataBaseCarts=require(`./dao/db.carts`)
const path = require("path")
const indexRouterDb = require(`./routes/mongo/index.router.db.js`)
const viewRouterDb = require("./routes/mongo/views.router")

const viewsRouter = require("./routes/mongo/views.routes.js")

const ProductManager = require("./dao/dbManager/productManagerDb")
const productManager = new ProductManager()


const app = express()
const http = require(`http`)
const server = http.createServer(app)

const { Server } = require(`socket.io`)
const io = new Server(server)

const PORT = 8080 || process.env.PORT


server.listen(PORT, () => {
    console.log(`Escuchando puerto 8080`)
    //dataBaseConnectUser.connectionMongoDbUser()
    // dataBaseConnectProduct.connectionMongoDbProduct()
    // dataBaseConnectMessage.connectionMongoDbMessage()
    // dataBaseConnectCart.connectionMongoDbCart()
    DataBaseProducts.connectionMongoDbProduct()
    DataBaseCarts.connectionMongoDbCart()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")));

app.engine(".hbs",engine({extname:".hbs"}))
app.set(`view engine`,`.hbs`)
app.set(`views`,path.join(__dirname,"/views"))


app.use(`/api`, indexRouterDb)
app.use(`/`, viewRouterDb)





//const indexRouter = require(`./routes/fs/index.router.js`)
 //const ManagerMongoUser = require("./dao/mongoDao/user.db.js")
//const ManagerMongoProduct = require("./dao/dbManager/product.db.js")
//const ManagerMongoMessage = require("./dao/dbManager/message.db.js")
//const ManagerMongoCart=require("./dao/dbManager/cart.db.js")

//const routerUser = require("./routes/user.router.js")
const routerProduct= require("./routes/mongo/product.router.db.js")
const routerMessage=require('./routes/mongo/message.router.js')
const routerCart=require('./routes/mongo/cart.router.db.js')


//const viewRouter = require("./routes/fs/views.router.js")


//const productManager = new ProductManager(`./db/productos.json`)
 //const dataBaseConnectUser= new ManagerMongoUser('mongodb+srv://francoturano777:ecommerce123@ecommerce.2tukzgj.mongodb.net/ecommerce')
//const dataBaseConnectProduct= new ManagerMongoProduct('mongodb+srv://coder:123456co@clustercodermongo.arye4ja.mongodb.net/ecommerce')
//const dataBaseConnectMessage= new ManagerMongoMessage('mongodb+srv://coder:123456co@clustercodermongo.arye4ja.mongodb.net/ecommerce')
//const dataBaseConnectCart= new ManagerMongoCart('mongodb+srv://coder:123456co@clustercodermongo.arye4ja.mongodb.net/ecommerce')




//app.use(`/api`, indexRouter)



//app.use(`/`, viewRouter)

app.use(`/chat`,viewsRouter)

//app.use(`/users`, routerUser)
app.use(`/messages`,routerMessage)


let chat=[]

let messages = []



//socket  
io.on("connection", (socket)=>{
    console.log("Nuevo cliente conectado");
    
    socket.emit("messages", messages)
    socket.on("new-message", (data)=>{
        messages.push(data)
        io.emit("messageLogs", messages)
        io.sockets.emit("messages", messages)
    })
    socket.on("message", data =>{
        messages.push(data)
        io.emit("messageLogs", messages)
    })
    socket.on('addProduct', async (data) => {
        const added = await productManager.addProduct(data)
        io.sockets.emit('allProducts', await productManager.getProducts())
    })
})


io.on("connection",(socket)=>{
    //cuando se conecta el usuario enviamos historial de chat
    socket.emit("chatHistory",chat)

    //recibimos el msg de cada usuario
    socket.on("msgChat",(data)=>{
        chat.push(data)

        //enviamos el historial del chat a todos los user conect
        io.emit("chatHistory",chat)
    })

    //recibimos msg de coneccion de new client
    socket.on("authenticated",(data)=>{
        socket.broadcast.emit("newUser", `${data} se acaba de unir al chat`)
    })
})



app.get(`*`, (req, res) => {
    res.status(404).json({ status: `error`, msg: `Path not found` })
})
