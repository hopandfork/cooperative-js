import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import {Table} from 'react-bootstrap';

class WorkersDetails extends Component {
    static defaultProps = {
	workers: []
    }

    constructor(props) {
	super(props);

	this.state = {
	    workers: props.workers
	}
    }

    componentWillReceiveProps(nextProps){
	this.setState({ workers: nextProps.workers });
    }

    render() {
	var rows = [];
	for (var i in this.state.workers) {
	    rows.push(<tr key={this.state.workers[i].id}><td>{this.state.workers[i].id}</td><td>{this.state.workers[i].state}</td></tr>);
	}

	return (
	    <Table striped bordered condensed hover>
		<thead>
		    <tr>
			<th>Worker ID</th>
			<th>State</th>
		    </tr>
		</thead>
		<tbody>
		{rows}
		</tbody>
	    </Table>
	);
    }
}

export default WorkersDetails;
