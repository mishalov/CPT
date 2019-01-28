import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.scss";
import "antd/dist/antd.css";
import "./style.scss";
import Container from "./components/Container";
import { BrowserRouter as Router } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Container />
        </div>
      </Router>
    );
  }
}

export default App;
