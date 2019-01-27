import React from "react";
import { List, Icon, Row, Col, Spin, Skeleton, Collapse } from "antd";
import "./Playlist.scss";
import { Dropbox } from "dropbox";
import { File } from "../../types/playlist/File";
import { IPlaylistItem } from "../../types/playlist/IPlaylistItem";
import { IDropboxFile } from "../../types/playlist/IDropboxFile";
import { observer, inject } from "mobx-react";
import { FileSet } from "../../types/playlist/FileSet";
import { Audio } from "../../types/playlist/Audio";

interface IPlayListContainer {
  files: FileSet;
  fetchFiles: () => void;
}

let pseudoUid = 0;

const key = () => {
  return pseudoUid++;
};
const Panel = Collapse.Panel;

@inject("store")
@observer
class PlaylistContainer extends React.Component<IPlayListContainer> {
  state = {
    playlist: []
  };

  mapPlaylist = (files: IDropboxFile[]) => {
    const playlist: IPlaylistItem[] = files.map(el => ({
      title: el.name,
      bandName: "Альбомы пока не поддерживаются",
      duration: 100,
      isFolder: false
    }));
    console.log("playlist: ", playlist);
    return playlist;
  };

  componentDidMount() {
    this.props.fetchFiles();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const { files } = this.props;
    console.log("files: ", files);

    // if (files.length !== prevProps.files.length) {
    //   this.setState({ playlist: this.mapPlaylist(files) });
    // }
  }

  makeList(fs: FileSet) {
    return fs.files.map(el => this.makeItem(el));
  }

  makeItem(f: File) {
    if (f.type === "File") {
      const audio = f.content as Audio;
      return (
        <Row
          className="audio-item"
          key={key()}
          type="flex"
          justify="center"
          align="middle"
        >
          <Col xs={{ span: 3 }} md={{ span: 1 }}>
            <Icon
              type="play-circle"
              className="audio-item__play"
              style={{ fontSize: "32px", color: "#08c" }}
            />
          </Col>
          <Col xs={{ span: 21 }} md={{ span: 23 }}>
            <div className="audio-item__info">
              <p className="audio-item__title">{audio.title}</p>
              <p className="audio-item__bandName">{audio.author}</p>
            </div>
          </Col>
        </Row>
      );
    } else {
      const folder = f.content as FileSet;
      return (
        <Row
          type="flex"
          justify="center"
          align="middle"
          key={key()}
          className="folder-item"
        >
          <Col span={24}>
            <Collapse>
              <Panel
                header={
                  <Row key={key()} type="flex" justify="center" align="middle">
                    <Col xs={{ span: 3 }} md={{ span: 3 }}>
                      <Icon
                        type="folder"
                        className="audio-item__play"
                        style={{ fontSize: "32px", color: "#08c" }}
                      />
                    </Col>
                    <Col xs={{ span: 21 }} md={{ span: 21 }}>
                      {f.title}
                    </Col>
                  </Row>
                }
                key="1"
              >
                {this.makeList(folder)}
              </Panel>
            </Collapse>
          </Col>
        </Row>
      );
    }
  }

  public render() {
    console.log(this.props);
    return this.props.files ? (
      this.makeList(this.props.files)
    ) : (
      <List
        itemLayout="horizontal"
        renderItem={(el: number) => (
          <List.Item className="audio-item">
            <Skeleton active paragraph={{ rows: 0, width: 100 }} />
          </List.Item>
        )}
        dataSource={[1, 2, 3, 4, 5]}
      />
    );
  }
}

export default observer(PlaylistContainer);
