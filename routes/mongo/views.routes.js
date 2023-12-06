const express=require(`express`)
const { Router } = express

const viewsRouter =new Router()

viewsRouter.get(`/`,(req,res)=>{
    res.render(`home`)
})

module.exports =viewsRouter