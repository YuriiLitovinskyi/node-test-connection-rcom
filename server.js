const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const prompts = require('prompts');
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

// Send PING to RCOM
const sendPingToRcom = (ip, port, callback) => {
    const ping = JSON.stringify({"connection test":"do not react!"}); 
    let sent = 0;
    let received = 0;

    for (let i = 0; i < 10; i++){        

        (() => {
            setTimeout(() => {
                client.send(ping, port, ip, (err, bytes) => {
                    if(err){
                        console.log(err);
                        client.close();
                    };
                    console.log('Sent bytes: ', bytes);  
                    sent++;    
                });
            
                client.on('message', (msg, info) => {
                    console.log('Data received from server : ' + msg.toString());
                    console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port); 
                    received++;                   
                });
            }, 1000 * i);
        })(i);        
        
    }  

    //client.close();
    callback(sent, received);
};

const sleep = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);        
    });
};

(async () => {
    console.log('Application to test udp connection with RCOM');

    // const rcomIp = await prompts({
    //     type: 'text',
    //     name: 'value',
    //     message: 'Enter RCOM IP: ',
    //     //validate: value => value <= 0 || value > 1000 ? `Please enter a valid number from 1 to 1000` : true
    // });

    // const rcomPort = await prompts({
    //     type: 'number',
    //     name: 'value',
    //     message: 'Enter RCOM PORT: ',
    //     //validate: value => value <= 0 || value > 1000 ? `Please enter a valid number from 1 to 1000` : true
    // });

    //await sendPingToRcom(rcomIp, rcomPort);

    await sendPingToRcom('194.187.110.62', 15004, async (sent, received) => {
        console.log(`Packets: Sent = ${sent}, Received = ${received}, Lost = ${sent - received} (${(received * 100) / sent }% lost)` );

        console.log('\nApplication will be closed automatilally in 1 minute');
        await sleep(10000);
        client.close();
    });

})();



