exports.err=(req,res,next)=>{
  res.status(404).render('error',{isLoggedIn:req.isLoggedIn,user:req.session.user});
}