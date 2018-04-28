import React, { Component } from 'react';
import './App.css';
import {Client, Job} from 'client';
import WorkersDetails from './WorkersDetails.js';
import '../node_modules/bootstrap/dist/css/bootstrap.css';

const JOB_NUMBER = 2;

class App extends Component {
 
    constructor(props) {
	super(props);

	this.state = {
	    workers : []
	};
    
	this.textarea = null;
	this.textareaResult = null;
	this.client = null;
	this.mergeFunction = this.mergeFunction.bind(this);
	this.updateWorkers = this.updateWorkers.bind(this);
	this.updateWorkersState = this.updateWorkersState.bind(this);
	this.startsWorkdCount = this.startsWorkdCount.bind(this);
	this.result = [];
    }

    mergeFunction(partialResult) {
	for (var i in partialResult) {
	    var wordCounterFound = this.result.filter(function(wordCounter) {return (typeof wordCounter !== 'undefined') && (wordCounter.word === partialResult[i].word);});
	    if (wordCounterFound.length === 1) {
		wordCounterFound[0].count += partialResult[i].count;
	    } else {
		this.result.push(partialResult[i]);    
	    }
	}
	this.textareaResult.value = JSON.stringify(this.result);
    }

    updateWorkersState (workers) {
	this.setState({ workers : workers });
    }

    updateWorkers() {
	if(this.client !== null) {
	    try {
		this.client.getCurrentWorkers(this.updateWorkersState);
	    } catch(err) {
		console.log(err);
	    }
	}
    }

    startsWorkdCount() {
	this.result = [];
	var task = [];
	var words = this.textarea.value.split(" ");	
	
	const wordsXjob = parseInt(words.length / JOB_NUMBER);
	const lastWordsNumber = parseInt(words.length % JOB_NUMBER);
	
	var i = 0;
	while (i < JOB_NUMBER) {
	    var wordNumber = (i === (JOB_NUMBER - 1)) ? (lastWordsNumber === 0 ?  wordsXjob : wordsXjob + lastWordsNumber) : wordsXjob;
	    
	    task.push(new Job(i, words.splice(0, wordNumber), function(data) {
		    var wordsCounter = [];
		    for (var j in data) {
		        var tempWordCounter = wordsCounter.filter(function(wordCounter) { return wordCounter.word === data[j];});	    
		        if (tempWordCounter.length === 1) {
			    tempWordCounter[0].count++;
		        } else {
			    wordsCounter.push({word:data[j], count:1});
		        }
		    }	
	        return wordsCounter;
	    }));
	    i++;
	}

	try {   
	    this.client.send(task, this.mergeFunction);
	} catch (err) {
	    console.log(err);
	}
    }

componentDidMount() {
    this.client = new Client("localhost", "9000");    
    this.client.setOnCloseListener(() => {
        console.log("closed");
        console.log(this.client.getRemainingJobs());
    });
}

render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Distributed Word Count</h1>
        </header>
	<div className="form-group">
	    <label for="text">Text:</label>
	    <textarea ref={(textarea)=>{this.textarea=textarea;}} className="form-control" rows="5"></textarea>
	    <label for="text">Result:</label>
	    <textarea ref={(textarea)=>{this.textareaResult=textarea;}} className="form-control" rows="5"></textarea>
	</div>
	<button className="btn btn-success" onClick={this.startsWorkdCount}>Start Word Count</button>
	<button className="btn btn-default" onClick={this.updateWorkers}>Update Workers</button>
	<WorkersDetails workers={this.state.workers}/>
      </div>
    );
  }
}

export default App;
