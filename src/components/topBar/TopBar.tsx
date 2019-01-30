import React from "react";
import "./TopBar.scss";
import { inject, observer } from "mobx-react";
import { Icon, Tooltip } from "antd";
import { Store } from "../../store/Store";

interface ITopBar {
  store?: Store;
}
@inject("store")
@observer
class TopBar extends React.Component<ITopBar> {
  async componentDidMount() {
    const { FilesStore, AuthStore } = this.props.store!;
    AuthStore.setUser(await FilesStore.client.getMe());
  }

  handleLogOut = () => {
    localStorage.removeItem("cloudSource");
    localStorage.removeItem("id_token");
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  public render() {
    const AuthStore = this.props.store!.AuthStore;
    return (
      <div className="top-bar">
        <div className="top-bar__user-icon">
          <p>{AuthStore.user!.userName}</p>
          <Tooltip title="Выход">
            <Icon type="logout" onClick={this.handleLogOut} />
          </Tooltip>
        </div>
      </div>
    );
  }
}
export default TopBar;