const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const email = require('./email');
function chunkArray(myArray, chunk_size){
    let results = [];

    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }

    return results;
}
if (cluster.isMaster) {
    const DbConnection = require('./db-connection').DbConnection;
    const dbConnection = new DbConnection();
    const connection = dbConnection.connect();
    connection.then(function(connect){
       const jokes = connect.db('heroku_app28755319').collection('jokes');
        const subscription = connect.db('heroku_app28755319').collection('subscription');
        jokes.find({user_email: {$ne: ''} }, {user_email: 1}).toArray(function(err, docs) {
            if(err) { console.error(err) }
            let jokesEmails = docs.filter((doc) => {
                let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(doc["user_email"]);
            }).map(doc => doc["user_email"]);

            subscription.find({}, {user_email:1}).toArray(function(err, docs){
                if(err) { console.error(err) }
                let subscriptionEmails = docs.filter((doc) => {
                    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(doc["user_email"]);
                }).map(doc => doc["user_email"]);
                userEmails = jokesEmails.concat(subscriptionEmails);
                if(userEmails.length > 0){

                    emailDivision = Math.ceil(userEmails.length/numCPUs);
                    const result = chunkArray(userEmails, emailDivision);
                    // Fork workers.
                    for (let i = 0; i < result.length; i++) {
                        let worker = cluster.fork();
                        // Send a message from the master process to the worker.
                        worker.send(result[i]);
                    }
                }

            });

        });

    }).catch(function(err){
        console.log(err);
    })

    console.log(`Master ${process.pid} is running`);


    cluster.on('exit', (worker, code, signal) => {

        console.log(`worker ${worker.process.pid} died`);
    });
} else{

    process.on('message', function(userEmails) {
        for(let i =0; i< userEmails.length; i++){
            console.log(userEmails[i]);
        }
    });
}
