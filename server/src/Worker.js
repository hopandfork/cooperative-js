class Worker {
    constructor(id, state, jobs, submitterIds) {   
	if (!Array.isArray(jobs) || !Array.isArray(submitterIds)) {
	    throw 'jobs and submittersIds have to be arrays';
	}

	this.id = id;
	this.state = state;
	this.jobs = jobs;
	this.submitterIds = submitterIds;
    }
}

export default Worker;
