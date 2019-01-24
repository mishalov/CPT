import React from "react";
import queryString from "query-string";
import { Dropbox } from "dropbox";
import { withRouter, RouteComponentProps } from "react-router";
import { Card, Button, Icon } from "antd";
import * as Msal from "msal";
import "./Authentication.scss";

interface IAuthentication extends RouteComponentProps {
  onSuccess: (dropBox: Dropbox) => void;
}

class Authentication extends React.Component<IAuthentication> {
  state = { OAuthUrl: "" };

  componentDidMount() {
    const dropBox = new Dropbox({ clientId: "7174q8sh3aiss51" });
    const url = dropBox.getAuthenticationUrl("http://localhost:3001/auth");
    if (url) {
      this.setState({ OAuthUrl: url });
    }
    if (this.props.location.hash) {
      const urlParams = queryString.parse(this.props.location.hash) as any;
      this.props.onSuccess(
        new Dropbox({
          clientId: "7174q8sh3aiss51",
          accessToken: urlParams.access_token
        })
      );
    }
  }

  public render() {
    return (
      <div className="auth-container">
        <Card className="auth-container__authbox" title="Вход">
          <p>
            Здравствуйте! Для получения доступа к Вашему Dropbox нам необходима
            авторизация. Нажмите пожалуйста на кнопку ниже.
          </p>
          <Button
            className="auth-container__button"
            type="primary"
            href={this.state.OAuthUrl}
          >
            <Icon type="dropbox" />
            Войти через Dropbox
          </Button>
          <Button
            className="auth-container__button"
            type="primary"
            onClick={() => {
              var userAgentApplication = new Msal.UserAgentApplication(
                "b07f11e5-8934-40a1-a327-1859322ed1c6",
                null,
                // "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                result => {
                  console.log(result);
                }
              );
              userAgentApplication.loginRedirect();
            }}
          >
            <Icon type="windows" />
            Войти через OneDrive
          </Button>
        </Card>
      </div>
    );
  }
}

export default withRouter(Authentication);
