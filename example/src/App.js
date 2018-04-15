import React, { Component } from 'react';
import './App.css';
import {Client, Job} from 'client';
import WorkersDetails from './WorkersDetails.js';
import '../node_modules/bootstrap/dist/css/bootstrap.css';

class App extends Component {
 
    constructor(props) {
	super(props);

	this.state = {
	    workers : []
	};
    
	this.client = null;
	this.mergeFunction = this.mergeFunction.bind(this);
	this.updateWorkers = this.updateWorkers.bind(this);
	this.updateWorkersState = this.updateWorkersState.bind(this);
	this.startsWorkdCount = this.startsWorkdCount.bind(this);
	this.result = 0;
    }

    mergeFunction(partialResult) {
	this.result = + this.result + partialResult;	
	console.log(this.result);
    }

    updateWorkersState (workers) {
	this.setState({ workers : workers });
    }

    updateWorkers() {
	if(this.client !== null) {
	    this.client.getCurrentWorkers(this.updateWorkersState);
	}
    }

    startsWorkdCount() {
	var task = [];
	task.push(new Job(1, 3, function(data){return(4+5+data);}));
	task.push(new Job(2, 4, function(data){return(4+5+data);}));
	task.push(new Job(3, 5, function(data){
		    var x = 0; 
		    while(x<1000000000) {
			x++;
			var y = 0;
			while (y<100) {
			    y++;
			}
		    }
		    return(4+5+data);
		}));
	try {   
	    this.client.send(task, this.mergeFunction);
	} catch (err) {
	    console.log("wait");
	}
    }

componentDidMount() {
    this.client = new Client("localhost", "9000");    
}

render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Distributed Word Count</h1>
        </header>
	<div className="form-group">
	    <label for="text">Text:</label>
	    <textarea className="form-control" rows="5" id="text"></textarea>
	</div>
	<button className="btn btn-success" onClick={this.startsWorkdCount}>Start Word Count</button>
	<button className="btn btn-default" onClick={this.updateWorkers}>Update Workers</button>
	<WorkersDetails workers={this.state.workers}/>
      </div>
    );
  }
}

export default App;
