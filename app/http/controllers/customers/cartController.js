const Cart = require('../../../models/order');

function cartController(){
    return {
        index(req , res){
            res.render("customers/cart",{layout:'layout'})
        },
        update(req,res) {
            
            //-------------------structure----------------------------
            // let cart = {
            //     items: {
            //         pizzaId: { item: pizzaObject, qty:0 },
            //     },
            //     totalQty: 0,
            //     totalPrice: 0
            // }

            //---------for the first time creating cart and adding basic stucture----------------
            if(!req.session.cart){
                req.session.cart = {
                    items:{},
                    totalQty: 0,
                    totalPrice: 0
                }
            }

            let cart = req.session.cart

            //console.log(req.body)
            
            //---------------check if item does not exist in cart-----------------------------
            if(!cart.items[req.body._id]){
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }else{
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }

            return res.json({ totalQty: req.session.cart.totalQty })
        },
        deleteInCart(req,res) {
            let cart = req.session.cart.items
            cart.filter(item => item._id !== cart[req.body._id])

            req.session.cart.items = cart
            res.json({message: "Item deleted!"})
        }
    }
}

module.exports = cartController