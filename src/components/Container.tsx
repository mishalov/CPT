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

interface IAuthData {
  access_token: string;
  account_id: string;
  token_type: string;
  uid: string;
}

class Container extends React.Component<RouteComponentProps> {
  state = {
    OAuthVisible: true,
    OAuthUrl: "",
    OAuthPassed: true,
    authData: {
      access_token: "",
      account_id: "",
      token_type: "",
      uid: ""
    },
    files: [],
    dropBox: new Dropbox({
      clientId: "7174q8sh3aiss51",
      accessToken:
        "bpx4elW19lAAAAAAAAAAozHOrwXSgK3Gh50L0vj-rNEjHDilvWkLJeQuXd70d-Vx"
    })
  };

  async componentDidMount() {
    const { state, props } = this;
    if (!state.OAuthPassed && !props.location.hash) {
      props.history.push("/auth");
    } else {
      props.history.push("/");
    }

    /*
    для тестов и отладки
    */
    if (state.OAuthPassed) {
      const files = ((await this.state.dropBox.filesListFolder({
        path: "",
        recursive: true,
        include_media_info: true
      })).entries as any) as IDropboxFile[];
      this.setState({
        files: files.filter(el => el.path_lower.indexOf(".mp3") !== -1)
      });
    }
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    const { state, props } = this;
    console.log("state: ", state);

    // if (state.OAuthPassed && (!prevState.OAuthPassed || !prevState)) {
    //   const files = ((await this.state.dropBox.filesListFolder({
    //     path: "",
    //     recursive: true,
    //     include_media_info: true
    //   })).entries as any) as IDropboxFile[];
    //   this.setState({
    //     files: files.filter(el => el.path_lower.indexOf(".mp3") !== -1)
    //   });

    //   let fileSet: FileSet = new FileSet();

    //   const folders = files.filter(el => el[".tag"] === "folder");

    //   // Создаем папки
    //   const folderNames: string[][] = folders
    //     .map(el => el.path_lower.split("/"))
    //     .filter(e => e)
    //     .sort((a, b) =>
    //       a.length > b.length ? 1 : a.length === b.length ? 0 : -1
    //     );
    //   folderNames.forEach((pathArr: string[]) => {
    //     console.log("pathArr: ", pathArr);
    //     let nodeNow = fileSet;
    //     pathArr.forEach((pathName: string) => {
    //       const newFolder = new FileSet();
    //       if (nodeNow.files)
    //         nodeNow.files.push(new File(pathName, "Folder", newFolder));
    //       else nodeNow.files = [new File(pathName, "Folder", newFolder)];
    //       nodeNow = newFolder;
    //     });
    //   });
    //   console.log("fileSet: ", fileSet);
    // }
  }

  handleSuccess = (dropBox: Dropbox) => {
    this.setState({ dropBox, OAuthPassed: true });
    this.props.history.push("/");
  };

  public render() {
    const { state } = this;
    return (
      <div className="App">
        <Switch>
          <Route path="/auth/:cloudSource" exec={true}>
            <Authentication onSuccess={this.handleSuccess} />
          </Route>
          <Route path="/auth" exec={true}>
            <Authentication onSuccess={this.handleSuccess} />
          </Route>
          <Route path="/">
            <PlaylistContainer files={this.state.files} />
          </Route>
        </Switch>
      </div>
    );
  }
}

export default withRouter(Container);
