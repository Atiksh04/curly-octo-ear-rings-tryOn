import React from 'react';
import logo from './logo.svg';
import './App.css';
import MainComponent from './components/media'
class App extends React.Component{
	render(){
		return(
			<div>
			<div className="App">
				<MainComponent/>
			</div>
			</div>
			)
	}
}
export default App;
