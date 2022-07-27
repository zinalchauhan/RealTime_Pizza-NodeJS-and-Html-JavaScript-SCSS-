const Menu = require('../../models/menu')

function homeController(){
    return {

        // First method

        // index(req , res){
            
        //     Menu.find().then(function(pizzas){
        //         console.log(pizzas)
        //         return  res.render("home",{layout:'layout' , pizzas: pizzas})
        //     })  
        // }

        //Second-method

        async index(req , res){

            const pizzas = await Menu.find()
            //console.log(pizzas)
            return  res.render("home",{layout:'layout' , pizzas: pizzas})
        }
    }
}

module.exports = homeController