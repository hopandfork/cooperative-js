import Worker from './Worker.js';
import WorkerState from './WorkerState.js';
import {Message, MessageType, MessageSerializer, MessageDeserializer} from 'client';
import SimpleScheduler from './SimpleScheduler.js';

var WebSocket = require("ws");
var server = new WebSocket.Server({
    port: 9000,
    perMessageDeflate: {
        zlibDeflateOptions: { // See zlib defaults.
    	chunkSize: 1024,
            memLevel: 7,
	    level: 3
        },
        zlibInflateOptions: {
	    chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        clientMaxWindowBits: 10,       // Defaults to negotiated value.
        serverMaxWindowBits: 10,       // Defaults to negotiated value.
        concurrencyLimit: 10,       // Limits zlib concurrency for perf.
        threshold: 1024            // Size (in bytes) below which messages
    }
});

var workers = [];
var wsToId = [];
var idCounter = 0;

server.on('connection', (ws, req) => {
    ws.id = idCounter;
    wsToId.push(ws);
    workers.push(new Worker(idCounter, "FREE", [], []));
    
    idCounter++;

    ws.on('message', (data) => {
	const id = ws.id;
	
        console.log("id=" + id);
        const message = MessageDeserializer.deserialize(data);
        
        console.log(message);
        switch (message.type) {
            case MessageType.TASK:
                var task = message.content;
		var submitter = workers.filter(function (worker) {return id === worker.id;});
                var job;
		try {
		    for (var i in task) {
			job = task[i];
    		
			var choosedWorker = SimpleScheduler.schedule(job, workers, submitter[0]);
    		
			choosedWorker.state = WorkerState.BUSY;
			choosedWorker.jobs.push(job);
			choosedWorker.submitterIds.push(id);
    
			var wsChoosed = wsToId.filter((temp) => {return temp.id === choosedWorker.id;});
			wsChoosed[0].send(MessageSerializer.serialize(new Message(MessageType.JOB, job)));	
		    }
		} catch (err) {
		    console.log(err);
		}
            break;
            case MessageType.END:
    	    const jobResult = message.content;
                console.log("Worker " + id + " has finished " + jobResult.jobId)
    
                for (var j in workers) {
    		var jobSolved = workers[j].jobs.filter(function (job) {return job.id === jobResult.jobId});
            	if (workers[j].id === id) {
    		    var jobIndex = workers[j].jobs.indexOf(jobSolved[0]);
		    
		    var wsSubmitter = wsToId.filter((temp) => {return temp.id === workers[j].submitterIds[jobIndex];});
        	    wsSubmitter[0].send(MessageSerializer.serialize(message));

        	    workers[j].jobs.splice(jobIndex, 1);
        	    workers[j].submitterIds.splice(jobIndex, 1);
    		    if (workers[j].jobs.length === 0) {
    			workers[j].state = WorkerState.FREE;
    		    }
            	}
                }
            break;
            case MessageType.WORKERS: 
		ws.send(MessageSerializer.serialize(new Message(MessageType.WORKERS, workers)));
    	break;
            default:break;
        }
    });

    ws.on('close', () => {
        console.log(workers);
        console.log(wsToId);
	const id = ws.id;

        console.log("Connection " + id + " closed");
        for (var j in workers) {
    	if (workers[j].id == id) {
    	    for (var k in workers[j].jobs) {
		var wsSubmitter = wsToId.filter((temp) => {return temp.id === workers[j].submitterIds[k];});
    		wsSubmitter[0].send(MessageSerializer.serialize(new Message(MessageType.ERROR, workers[j].jobs[k]))); 
    	    }
    	    workers.splice(j, 1);
	    wsToId.splice(wsToId.indexOf(ws), 1);
    	}
        }
        console.log(workers);
        console.log(wsToId);
    });
});
