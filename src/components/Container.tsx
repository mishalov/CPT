import React from "react";
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
import { IDropboxFile } from "../types/playlist/IDropboxFile";
import { FileSet } from "../types/playlist/FileSet";
import { File } from "../types/playlist/File";
import { Audio } from "../types/playlist/Audio";
import { inject, observer } from "mobx-react";
import { Store } from "../store/Store";
import { Spin } from "antd";

interface IContainer extends RouteComponentProps {
  store?: Store;
}

@inject("store")
@observer
class Container extends React.Component<IContainer> {
  async componentDidMount() {
    const { props } = this;
    const { AuthStore, FilesStore } = this.props.store!;
    if (!AuthStore.OAuthPassed && !props.location.hash) {
      props.history.push("/auth");
    } else {
      props.history.push("/");
    }
  }

  public render() {
    const { FilesStore, AuthStore } = this.props.store!;
    return (
      <div className="App">
        <Switch>
          <Route path="/auth" exec={true}>
            <Authentication />
          </Route>

          <Route path="/">
            {AuthStore.OAuthPassed ? (
              <PlaylistContainer
                files={FilesStore.files}
                fetchFiles={() => {
                  FilesStore.fetchFiles();
                }}
              />
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
