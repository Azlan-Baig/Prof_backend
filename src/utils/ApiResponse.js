class ApiResponse{
    constructor(statusCode, data , message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = this.success < 400 // ye isiliye k Api response k zariye jo bh error status huta hai wo below 400 huta hai
    }
}


export {ApiResponse}