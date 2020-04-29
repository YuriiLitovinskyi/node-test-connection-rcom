const prompts = require('prompts');
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const udp = require('dgram');
//const server = udp.createSocket('udp4');

// Send PING to RCOM
const sendPingToRcom = async (ip, port, callback) => {
    const ping = JSON.stringify({"connection test":"ignore this message!"}); 
    let sent = 0;
    let received = 0;
    const brk = 19;

   

    for (let i = 0; i <= brk; i++){  
        const server = udp.createSocket('udp4');         

        (async () => {
            await setTimeout( async () => {
              
                server.send(ping, port, ip, (err, bytes) => {
                    if(err){
                        console.log(err);                            
                        client.close();
                    };
                    console.log(`\nSent ${bytes} bytes to RCOM`);  
                    sent++;    
                });                
            
                server.on('message', (msg, info) => {
                    console.log(`RCOM response: ${msg.toString()}`);                        
                    received++;                   
                    //server.close();                      
                });

                if(i === brk){
                    setTimeout(() => {                      
                        callback(sent, received);                      
                    }, 3000); 
                }                
            }, 100 * i);         
        })();        
    }  
};

const sleep = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);        
    });
};


(async () => {
    console.log('Application to test udp connection to RCOM\n');

    const rcomIp = await prompts({
        type: 'text',
        name: 'value',
        message: 'Enter RCOM IP: ',
        //validate: value => value <= 0 || value > 1000 ? `Please enter a valid number from 1 to 1000` : true
    });

    const rcomPort = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter RCOM PORT: ',
        validate: value => value <= 0 || value > 65535 ? `Please enter a valid port from 1 to 65535` : true
    });    
 
    await sendPingToRcom(rcomIp.value, rcomPort.value, async (sent, received) => {       
        console.log(`\n\nPackets: Sent = ${sent}, Received = ${received}, Lost = ${sent - received} (${(100 - (received * 100) / sent).toFixed(0) }% lost)\n` ); 
        await sleep(1000);    
    });

})();



