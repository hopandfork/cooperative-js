class Worker {
    constructor(id, state, jobs) {   
	if (!Array.isArray(jobs)) {
	    throw 'jobs has to be an array';
	}

	this.id = id;
	this.state = state;
	this.jobs = jobs;
    }
}

export default Worker;
