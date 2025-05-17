
const errHandler404 = (req, res, next) => {
 const error = new Error(`Not Found  - ${req.originalUrl}`)
//  console.log(error)
 res.status(404)
 next(error)// في حال ما كان 404 بنقلها للmiddleware الي بعده بالترتيب
}   // في هذه المرحلة لا يرسل الخطأ فقط يقوم بتجهيزه للي بعده

const errHandler500 = (err,req,res,next) =>{
    // console.log("dina",err , res.statusCode)

const statusCode = res.statusCode === 200 ? 500 : res.statusCode// عشان اعرف شو status الي اجاني
res.status(statusCode).send({message : err.message}) /// اخر middleware handler هو الي بطبع الخطأوبرسله

}

module.exports = {errHandler404,errHandler500}