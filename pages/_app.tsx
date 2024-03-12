import type { AppProps } from "next/app";
import React from "react";
import "../styles/globals.css";

class App extends React.Component<AppProps> {
  componentDidMount() {
    console.log("App");
    console.log(this.props);
  }

  static async getInitialProps(ctx) {
    console.log("App.getInitialProps");
    console.log(!!ctx.req ? "server" : "client");
    const res = await fetch("https://l.getsitecontrol.com/575mqxyw.json");
    const json = await res.json();
    return { asd: { stars: json.runtime.sessionLength } };
  }

  render() {
    const { Component, ...asd } = this.props;
    return <Component {...asd} />;
  }
}

export default App;
