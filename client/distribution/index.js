"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _serialize = require('serialize-javascript');

var Client = function () {
			function Client(ip, port) {
						_classCallCheck(this, Client);

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

			_createClass(Client, [{
						key: "handleMessage",
						value: function handleMessage(message) {
									var message = MessageDeserializer.deserialize(message.data);
									console.log(message);
									if (message.type === MessageType.JOB) {
												var job = message.content;
												var content = new JobResult(job.id, job.code(job.data));
												this.ws.send(MessageSerializer.serialize(new Message(MessageType.END, content)));
									}

									if (message.type === MessageType.END) {
												var partialResult = message.content;
												if (this.mergeFunction !== null) {
															this.mergeFunction(partialResult.result);
												}
												var jobs = this.task.filter(function (job) {
															return partialResult.jobId === job.id;
												});
												var jobIndex = this.task.indexOf(jobs[0]);
												this.task.splice(jobIndex, 1);
									}

									if (message.type === MessageType.WORKERS) {
												var workers = message.content;
												this.workersCallback(workers);
												this.workersCallback = null;
									}
						}
			}, {
						key: "send",
						value: function send(task, mergeFunction) {
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
									var message = new Message(MessageType.TASK, task);
									this.ws.send(MessageSerializer.serialize(message));
						}
			}, {
						key: "isConnected",
						value: function isConnected() {
									if (this.ws.readyState === this.ws.OPEN) {
												return true;
									}
									return false;
						}
			}, {
						key: "isBusy",
						value: function isBusy() {
									if (this.task.length === 0) {
												return false;
									}
									return true;
						}
			}, {
						key: "getCurrentWorkers",
						value: function getCurrentWorkers(workersCallback) {
									if (!this.isConnected()) {
												throw 'the client isn\'t connected';
									}

									if (typeof workersCallback !== 'function') {
												throw 'workersCallback has to be a function';
									}
									this.workersCallback = workersCallback;

									var message = new Message(MessageType.WORKERS, null);
									this.ws.send(MessageSerializer.serialize(message));
						}
			}]);

			return Client;
}();

var Job = function Job(id, data, code) {
			_classCallCheck(this, Job);

			this.id = id;
			this.data = data;
			this.code = code;
};

var JobResult = function JobResult(jobId, result) {
			_classCallCheck(this, JobResult);

			this.jobId = jobId;
			this.result = result;
};

var Message = function Message(type, content) {
			_classCallCheck(this, Message);

			this.type = type;
			this.content = content;
};

var MessageType = {
			TASK: "TASK",
			JOB: "JOB",
			WORKERS: "WORKERS",
			ERROR: "ERROR",
			END: "END"
};

var MessageSerializer = function () {
			function MessageSerializer() {
						_classCallCheck(this, MessageSerializer);
			}

			_createClass(MessageSerializer, null, [{
						key: "serialize",
						value: function serialize(message) {
									return _serialize(message);
						}
			}]);

			return MessageSerializer;
}();

var MessageDeserializer = function () {
			function MessageDeserializer() {
						_classCallCheck(this, MessageDeserializer);
			}

			_createClass(MessageDeserializer, null, [{
						key: "deserialize",
						value: function deserialize(message) {
									return eval('(' + message + ')');
						}
			}]);

			return MessageDeserializer;
}();

module.exports = { Client: Client, Job: Job, Message: Message, MessageType: MessageType, MessageSerializer: MessageSerializer, MessageDeserializer: MessageDeserializer };