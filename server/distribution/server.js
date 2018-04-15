'use strict';

var _Worker = require('./Worker.js');

var _Worker2 = _interopRequireDefault(_Worker);

var _WorkerState = require('./WorkerState.js');

var _WorkerState2 = _interopRequireDefault(_WorkerState);

var _client = require('client');

var _SimpleScheduler = require('./SimpleScheduler.js');

var _SimpleScheduler2 = _interopRequireDefault(_SimpleScheduler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebSocketServer = require("websocketserver");
var server = new WebSocketServer("none", 9000);

var workers = [];
server.on('connection', function (id) {
    workers.push(new _Worker2.default(id, "FREE", [], []));
});

server.on('message', function (data, id) {
    var mesObj = server.unmaskMessage(data);
    console.log("id=" + id);
    var message = _client.MessageDeserializer.deserialize(server.convertToString(mesObj.message));

    console.log(message);
    var task;
    var submitter;
    var job;
    var i;
    var choosedWorker;
    var j;
    var jobSolved;
    var jobIndex;

    (function () {
        switch (message.type) {
            case _client.MessageType.TASK:
                task = message.content;
                submitter = workers.filter(function (worker) {
                    return id === worker.id;
                });


                for (i in task) {
                    job = task[i];

                    choosedWorker = _SimpleScheduler2.default.schedule(job, workers, submitter[0]);


                    choosedWorker.state = _WorkerState2.default.BUSY;
                    choosedWorker.jobs.push(job);
                    choosedWorker.submitterIds.push(id);

                    server.sendMessage("one", _client.MessageSerializer.serialize(new _client.Message(_client.MessageType.JOB, job)), choosedWorker.id);
                }
                break;
            case _client.MessageType.END:
                var jobResult = message.content;
                console.log("Worker " + id + " has finished " + jobResult.jobId);

                for (j in workers) {
                    jobSolved = workers[j].jobs.filter(function (job) {
                        return job.id === jobResult.jobId;
                    });

                    if (workers[j].id === id) {
                        jobIndex = workers[j].jobs.indexOf(jobSolved[0]);

                        server.sendMessage("one", _client.MessageSerializer.serialize(message), workers[j].submitterIds[jobIndex]);

                        workers[j].jobs.splice(jobIndex, 1);
                        workers[j].submitterIds.splice(jobIndex, 1);
                        if (workers[j].jobs.length === 0) {
                            workers[j].state = _WorkerState2.default.FREE;
                        }
                    }
                }
                break;
            case _client.MessageType.WORKERS:
                server.sendMessage("one", _client.MessageSerializer.serialize(new _client.Message(_client.MessageType.WORKERS, workers)), id);
                break;
            default:
                break;
        }
    })();
});

server.on('closedconnection', function (id) {
    console.log(workers);
    console.log("Connection " + id + " closed");
    for (var j in workers) {
        if (workers[j].id == id) {
            workers.splice(j, 1);
        }
    }
    console.log(workers);
});