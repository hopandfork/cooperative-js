import Worker from './Worker.js';
import WorkerState from './WorkerState.js';
import {Message, MessageType, MessageSerializer, MessageDeserializer} from 'client';
import SimpleScheduler from './SimpleScheduler.js';

var WebSocketServer = require("websocketserver");
var server = new WebSocketServer("none", 9000);

var workers = [];
server.on('connection', (id) => {
    workers.push(new Worker(id, "FREE", [], []));
});

server.on('message', (data, id) => {
    var mesObj = server.unmaskMessage(data);
    console.log("id=" + id);
    const message = MessageDeserializer.deserialize(server.convertToString(mesObj.message));
    
    console.log(message);
    switch (message.type) {
        case MessageType.TASK:
            var task = message.content;
	    var submitter = workers.filter(function (worker) {return id === worker.id;});
            var job;

    	    for (var i in task) {
    	        job = task[i];
		
		var choosedWorker = SimpleScheduler.schedule(job, workers, submitter[0]);
		
		choosedWorker.state = WorkerState.BUSY;
    	        choosedWorker.jobs.push(job);
    	        choosedWorker.submitterIds.push(id);

    	        server.sendMessage("one", MessageSerializer.serialize(new Message(MessageType.JOB, job)), choosedWorker.id);	
	    }
        break;
        case MessageType.END:
	    const jobResult = message.content;
            console.log("Worker " + id + " has finished " + jobResult.jobId)

            for (var j in workers) {
		var jobSolved = workers[j].jobs.filter(function (job) {return job.id === jobResult.jobId});
        	if (workers[j].id === id) {
		    var jobIndex = workers[j].jobs.indexOf(jobSolved[0]);
    	            server.sendMessage("one", MessageSerializer.serialize(message), workers[j].submitterIds[jobIndex]);
		    
    	            workers[j].jobs.splice(jobIndex, 1);
    	            workers[j].submitterIds.splice(jobIndex, 1);
		    if (workers[j].jobs.length === 0) {
			workers[j].state = WorkerState.FREE;
		    }
        	}
            }
        break;
        case MessageType.WORKERS: 
	    server.sendMessage("one", MessageSerializer.serialize(new Message(MessageType.WORKERS, workers)), id);
	break;
        default:break;
    }
});

server.on('closedconnection', (id) => {
    console.log(workers);
    console.log("Connection " + id + " closed");
    for (var j in workers) {
	if (workers[j].id == id) {
	    for (var k in workers[j].jobs) {	
		server.sendMessage("one", MessageSerializer.serialize(new Message(MessageType.ERROR, workers[j].jobs[k])), workers[j].submitterIds[k]); 
	    }
	    workers.splice(j, 1);
	}
    }
    console.log(workers);
});
