const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const email = require('./email');

const DbConnection = require('./db-connection').DbConnection;
const dbConnection = new DbConnection();
const connection = await dbConnection.connect();
const emailCount = numCPUs;
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    const jokes = connection.collection('jokes');
    const subscription = connection.collection('subscription');
    const jokesEmails = jokes.find({user_email: ''}, {user_email:1}).toArray();
    const subscriptionEmails = subscription.find({},{user_email:1}).toArray();
    const userEmails = jokesEmails.concat(subscriptionEmails);
    if(userEmails.length > 0){
        emailCount = userEmails.length/numCPUs;
        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server

     //email.sendEmail();
}