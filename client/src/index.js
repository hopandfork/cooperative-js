var serialize = require('serialize-javascript');

class Client {
    
    constructor(ip, port) {
	this.ws = new WebSocket("ws://" + ip + ":" + port);
	
	this.workersCallback = null;
	this.mergeFunction = null;
	this.task = [];
	
	this.isBusy = this.isBusy.bind(this);
	this.isConnected = this.isConnected.bind(this);
	this.send = this.send.bind(this);
	this.handleMessage = this.handleMessage.bind(this);
	this.getCurrentWorkers = this.getCurrentWorkers.bind(this);
	
	this.ws.addEventListener("message", this.handleMessage);	
    }

    handleMessage(message) {
	var message = MessageDeserializer.deserialize(message.data);
	console.log(message);	
	if (message.type === MessageType.JOB) {
	    const job = message.content;
	    const content = new JobResult(job.id, job.code(job.data));
	    this.ws.send(MessageSerializer.serialize(new Message(MessageType.END, content)));
	}
	
	if (message.type === MessageType.END) {
	    const partialResult = message.content;
	    if (this.mergeFunction !== null) {
		this.mergeFunction(partialResult.result);
	    }
	    const jobs = this.task.filter(function (job) {return partialResult.jobId === job.id;});
	    const jobIndex = this.task.indexOf(jobs[0]); 
	    this.task.splice(jobIndex, 1);
	}

	if (message.type === MessageType.WORKERS) {
	    var workers = message.content;
	    this.workersCallback(workers);
	    this.workersCallback = null;
	}
    }

    send(task, mergeFunction) {
	if (!this.isConnected()) {
	    throw 'the client isn\'t connected';
	}

	if (this.isBusy()) {
	    throw 'the client is already used';
	}

	if (typeof mergeFunction !== 'function' && mergeFunction !== null) {
	    throw 'mergeFunction has to be a function or null';
	}

	if (!Array.isArray(task)) {
	    throw 'task has to be an array of Job';
	}
	
	this.task = task;
	this.mergeFunction = mergeFunction;
        const message = new Message(MessageType.TASK, task);
	this.ws.send(MessageSerializer.serialize(message));
    }
    
    isConnected() {
	if (this.ws.readyState === this.ws.OPEN) {
	    return true;
	}
	return false;
    }
    
    isBusy() {
	if (this.task.length === 0) {
	    return false;
	}
	return true;
    }

    getCurrentWorkers(workersCallback) {
	if (!this.isConnected()) {
	    throw 'the client isn\'t connected';
	}

	if (typeof workersCallback !== 'function') {
	    throw 'workersCallback has to be a function';
	}
	this.workersCallback = workersCallback;

        const message = new Message(MessageType.WORKERS, null);
	this.ws.send(MessageSerializer.serialize(message));
    }
}    

class Job {
    constructor(id, data, code) {
	this.id = id;
	this.data = data;
	this.code = code;
    }
}    

class JobResult {
    constructor(jobId, result) {
	this.jobId = jobId;
	this.result = result;
    }
}

class Message {
    constructor(type, content) {
	this.type = type;
	this.content = content;
    }
}

const MessageType = {
    TASK: "TASK",
    JOB: "JOB",
    WORKERS: "WORKERS",
    ERROR: "ERROR",
    END: "END"
};

class MessageSerializer {
    static serialize(message) {
	return serialize(message);
    }
}

class MessageDeserializer {
    static deserialize(message) {
	return eval('(' + message + ')');
    }
}

module.exports =  {Client, Job, Message, MessageType, MessageSerializer, MessageDeserializer};