switch (process.env.NODE_ENV){
    case 'prod':
    case 'production':
        module.exports=require('.server/config/webpack.prod');
        break;
    
    case 'dev':
    case 'development':
    default:
        module.exports=require('./server/config/webpack.dev');
}