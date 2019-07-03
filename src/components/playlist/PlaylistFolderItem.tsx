import React, { ReactNode } from "react";
import { Row, Col, Collapse, Icon } from "antd";
import { File } from "../../types/playlist/File";

const { Panel } = Collapse;

interface IPlaylistFolderItem {
  folder: File;
  key: number;
  content: ReactNode;
}
class PlaylistFolderItem extends React.PureComponent<IPlaylistFolderItem> {
  public render() {
    const { folder, key, content } = this.props;
    return (
      <Row
        type="flex"
        justify="center"
        align="middle"
        key={key}
        className="folder-item"
      >
        <Col span={24}>
          <Collapse>
            <Panel
              header={
                <div className="folder-item__header">
                  <Icon className="folder-item__icon" type="folder" />
                  <div className="folder-item__title">{folder.title}</div>
                </div>
              }
              key="1"
            >
              {content}
            </Panel>
          </Collapse>
        </Col>
      </Row>
    );
  }
}

export default PlaylistFolderItem;
