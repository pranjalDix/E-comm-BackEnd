//const product = require("../models/product");
//base -Product.find()
//simple class which accept on which model we want to run this the second is req,query

class whereClause{

    constructor(base,bigQ){
        this.base=base,
        this.bigQ=bigQ
    }

    search(){
        const searchword=this.bigQ.search?{
            name:{
                $regex:this.bigQ.search,
                $options:'i'                 // i is for the case sensitivuty
            }
        }:{}

        console.log("SearchWord "+ searchword)
        this.base= this.base.find({...searchword})
        return this;
    }

     filter(){
        const copyQ={...this.bigQ}
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        //convert bigQ in String=>copyQ

        let stringOfCopyQ=JSON.stringify(copyQ)

        stringOfCopyQ=stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g,m =>`$${m}`)

        let jsonOfCopyQ=JSON.parse(stringOfCopyQ)

        this.base= this.base.find(jsonOfCopyQ)           // we can pass the Query as Product.find({},{}) like this

        return this
    }

     pager(resultperPage){
        let currentPage=1;
        if(this.bigQ.page){
            currentPage=this.bigQ.page
        }

        const skipval=resultperPage*(currentPage-1)
       this.base=  this.base.limit(resultperPage).skip(skipval)

       return this
    }

    

    
}
module.exports=whereClause