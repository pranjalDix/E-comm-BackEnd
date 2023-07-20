class CustomError extends Error{
    constructor(message,code){               // This is a error class used in node.js to define error message
        super(message)                       // by default class it takes only the message but we can define custom error whic also takes the code 
        this.code=code
    }
}

module.exports=CustomError