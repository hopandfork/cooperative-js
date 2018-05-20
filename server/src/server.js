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

/* Allows to assign an id to the WebSocket connection */
server.on('connection', (ws, req) => {
    ws.id = idCounter;
    wsToId.push(ws);
    workers.push(new Worker(idCounter, "FREE", []));
    
    idCounter++;

    console.log("Connection " + ws.id + " opened");

    /* Allows to handle each incoming message */
    ws.on('message', (data) => {
	const id = ws.id;
	
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
			
			/* The scheduler allows to find a Worker for the job execution */
			var choosedWorker = SimpleScheduler.schedule(job, workers, submitter[0]);
    		
			choosedWorker.state = WorkerState.BUSY;
			job.submitterId = id;
			choosedWorker.jobs.push(job);
    
			var wsChoosed = wsToId.filter((temp) => {return temp.id === choosedWorker.id;});
			wsChoosed[0].send(MessageSerializer.serialize(new Message(MessageType.JOB, job)));	
		    }
		} catch (err) {
		    console.log(err);
		}
            break;
            case MessageType.END:
    	    const jobResult = message.content;
                for (var j in workers) {
		    if (workers[j].id === id) {
			var jobSolved = workers[j].jobs.filter((job) => {return (job.id === jobResult.jobId) && (job.submitterId === jobResult.submitterId);});
    		      
			var jobIndex = workers[j].jobs.indexOf(jobSolved[0]);
		      	      
			var wsSubmitter = wsToId.filter((temp) => {return temp.id === jobResult.submitterId;});
			wsSubmitter[0].send(MessageSerializer.serialize(message));

			workers[j].jobs.splice(jobIndex, 1);
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

    /* This event handler allows to notify an error to the submitters beacouse of a Worker problem.
     * Now the submitter resubmit the Job.
     */
    ws.on('close', () => {
	const id = ws.id;

        console.log("Connection " + id + " closed");
        for (var j in workers) {
    	if (workers[j].id == id) {
    	    for (var k in workers[j].jobs) {
		var wsSubmitter = wsToId.filter((temp) => {return temp.id === workers[j].jobs[k].submitterId;});
    		wsSubmitter[0].send(MessageSerializer.serialize(new Message(MessageType.ERROR, workers[j].jobs[k]))); 
    	    }
    	    workers.splice(j, 1);
	    wsToId.splice(wsToId.indexOf(ws), 1);
    	}
        }
    });
});
