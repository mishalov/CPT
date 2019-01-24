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
import { IFile } from "../types/playlist/IFile";

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
    OAuthPassed: false,
    authData: {
      access_token: "",
      account_id: "",
      token_type: "",
      uid: ""
    },
    files: [],
    dropBox: new Dropbox({
      clientId: "7174q8sh3aiss51",
      accessToken: ""
    })
  };

  componentDidMount() {
    const { state, props } = this;
    if (!state.OAuthPassed && !props.location.hash) {
      props.history.push("/auth");
    } else {
      props.history.push("/");
    }

    /*
    для тестов и отладки
    */
    //this.getPlayList();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const { state, props } = this;
    if (state.OAuthPassed && (!prevState.OAuthPassed || !prevState)) {
      this.getPlayList();
    }
  }

  getPlayList = async () => {
    const { state, props } = this;
    const files = ((await state.dropBox.filesListFolder({
      path: "",
      recursive: true,
      include_media_info: true
    })).entries as any) as IFile[];
    this.setState({
      files: files.filter(el => el.path_lower.indexOf(".mp3") !== -1)
    });
  };

  handleSuccess = (dropBox: Dropbox) => {
    this.setState({ dropBox, OAuthPassed: true });
    this.props.history.push("/");
  };

  public render() {
    const { state } = this;
    return (
      <div className="App">
        <Switch>
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
