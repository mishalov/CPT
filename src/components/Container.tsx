import React, { Fragment } from "react";
// import fetch from "isomorphic-fetch";
import { Dropbox } from "dropbox";
import {
  BrowserRouter as Router,
  withRouter,
  RouteComponentProps,
  Switch,
  Route
} from "react-router-dom";
import PlaylistContainer from "./playlist/PlaylistContainer";
import Authentication from "./auth/ Authentication";
import { inject, observer } from "mobx-react";
import { Store } from "../store/Store";
import { Spin } from "antd";
import PlayerContainer from "./player/PlayerContainer";
import { isMobile } from "react-device-detect";

interface IContainer extends RouteComponentProps {
  store?: Store;
}

@inject("store")
@observer
class Container extends React.Component<IContainer> {
  async componentDidMount() {
    console.log("маунтнулось");
    const { props } = this;
    const { AuthStore, FilesStore } = this.props.store!;
    console.log("AuthStore: ", AuthStore);
    if (!props.location.hash && props.location.pathname !== "/auth") {
      if (!AuthStore.OAuthPassed) {
        props.history.push("/auth");
      } else {
        props.history.push("/");
      }
    }
  }

  fetchFiles = () => {
    const { FilesStore } = this.props.store!;
    FilesStore.fetchFiles();
  };

  playFile = (path: string) => {
    const { FilesStore } = this.props.store!;
    FilesStore.playFile(path);
  };

  public render() {
    const { FilesStore, AuthStore } = this.props.store!;
    console.log("FilesStore: ", FilesStore);
    return (
      <div className={"main-container"}>
        <Switch>
          <Route path="/auth">
            <Authentication />
          </Route>

          <Route path="/">
            {AuthStore.OAuthPassed ? (
              <Fragment>
                <PlayerContainer />

                <div style={{ marginTop: "12px" }}>
                  <PlaylistContainer
                    files={FilesStore.files}
                    fetchFiles={this.fetchFiles}
                    playFile={this.playFile}
                  />
                </div>
              </Fragment>
            ) : (
              <Spin />
            )}
          </Route>
        </Switch>
      </div>
    );
  }
}

export default withRouter(Container);
