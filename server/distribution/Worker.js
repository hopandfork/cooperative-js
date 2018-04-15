'use strict';

Object.defineProperty(exports, "__esModule", {
				value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function Worker(id, state, jobs, submitterIds) {
				_classCallCheck(this, Worker);

				if (!Array.isArray(jobs) || !Array.isArray(submitterIds)) {
								throw 'jobs and submittersIds have to be arrays';
				}

				this.id = id;
				this.state = state;
				this.jobs = jobs;
				this.submitterIds = submitterIds;
};

exports.default = Worker;