"use strict";

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WorkerState = require("./WorkerState.js");

var _WorkerState2 = _interopRequireDefault(_WorkerState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleScheduler = function () {
   function SimpleScheduler() {
      _classCallCheck(this, SimpleScheduler);
   }

   _createClass(SimpleScheduler, null, [{
      key: "schedule",
      value: function schedule(job, workers, submitter) {
         var choosedWorker = null;

         for (var j in workers) {
            if (workers[j].state === _WorkerState2.default.FREE && submitter.id !== workers[j].id) {
               console.log("Submit job " + job.id + " from " + submitter.id + " to ", workers[j]);

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
   }]);

   return SimpleScheduler;
}();

exports.default = SimpleScheduler;