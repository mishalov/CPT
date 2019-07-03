import React, { Fragment } from "react";
// import fetch from "isomorphic-fetch";
import { Dropbox } from "dropbox";
import PlaylistContainer from "./playlist/PlaylistContainer";
import Authentication from "./auth/ Authentication";
import { inject, observer } from "mobx-react";
import { Store } from "../store/Store";
import { Spin } from "antd";
import PlayerContainer from "./player/PlayerContainer";
import { isMobile } from "react-device-detect";
import TopBar from "./topBar/TopBar";
import { findGetParameter } from "../helpers/findGetParameter";

interface IContainer {
  store?: Store;
}

@inject("store")
@observer
class Container extends React.Component<IContainer> {
  async componentDidMount() {
    const { props } = this;
    const { AuthStore, FilesStore } = this.props.store!;
    // if (!findGetParameter("hash")) {
    //   if (!AuthStore.OAuthPassed) {
    //     props.history.push("/auth");
    //   } else {
    //     props.history.push("/");
    //   }
  }

  fetchFiles = () => {
    const { FilesStore } = this.props.store!;
    FilesStore.fetchFiles();
  };

  playFile = (path: string) => {
    const { FilesStore } = this.props.store!;
    FilesStore.playFile(path);
  };

  makeRoute = () => {
    const { FilesStore, AuthStore } = this.props.store!;
    const { OAuthPassed, loading } = AuthStore;
    console.log("OAuthPassed: ", OAuthPassed, loading);
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
              files={FilesStore.files}
              fetchFiles={this.fetchFiles}
              playFile={this.playFile}
              // playNow={FilesStore.playNow}
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
