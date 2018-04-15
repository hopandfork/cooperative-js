import WorkerState from './WorkerState.js';

class SimpleScheduler {
    static schedule(job, workers, submitter) {
	var choosedWorker = null;

    	for (var j in workers) {
    	    if ((workers[j].state === WorkerState.FREE) && (submitter.id !== workers[j].id)) {
    		console.log("Submit job " + job.id + " from " + submitter.id + " to ", 
    			workers[j]);

		choosedWorker = workers[j];
		break;
    	    }
    	}

	if (choosedWorker === null) {
    	    console.log("Submit job " + job.id + " from " + submitter.id + " to itself");
	    choosedWorker = submitter;
	}
	return choosedWorker;
    }
}
export default SimpleScheduler;
