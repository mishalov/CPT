import React, { Fragment } from "react";
import PlaylistContainer from "./playlist/PlaylistContainer";
import Authentication from "./auth/Authentication";
import { inject, observer } from "mobx-react";
import { Store } from "../store/Store";
import { Spin } from "antd";
import PlayerContainer from "./player/PlayerContainer";
import TopBar from "./topBar/TopBar";

interface IContainer {
  store?: Store;
}

@inject("store")
@observer
class Container extends React.Component<IContainer> {
  fetchFiles = () => {
    const { PlayerStore } = this.props.store!;
    PlayerStore.fetchFiles();
  };

  playFile = (path: string) => {
    const { PlayerStore } = this.props.store!;
    PlayerStore.playFile(path);
  };

  makeRoute = () => {
    const { PlayerStore, AuthStore } = this.props.store!;
    const { OAuthPassed, loading } = AuthStore;
    if (loading) {
      return <Spin />;
    }
    if (OAuthPassed) {
      return (
        <Fragment>
          <TopBar />
          <PlayerContainer />

          <div style={{ marginTop: "12px" }}>
            <PlaylistContainer
              files={PlayerStore.files}
              fetchFiles={this.fetchFiles}
              playFile={this.playFile}
            />
          </div>
        </Fragment>
      );
    }
    return <Authentication />;
  };

  public render() {
    return (
      <div className={"main-container"}>
        {this.makeRoute()}
        {/* <Authentication /> */}
      </div>
    );
  }
}

export default Container;
