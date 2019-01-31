import React from "react";
import { inject, observer } from "mobx-react";
import { Store } from "../../store/Store";
import { Audio } from "../../types/playlist/Audio";
import { render } from "react-dom";

interface IPlaylistAudioItem {
  key: number;
  audio: Audio;
  store?: Store;
  playFile: (path: string) => void;
}

interface IPlaylistAudioPure {
  key: number;
  audio: Audio;
  isNow: boolean;
  playFile: (path: string) => void;
}

@inject("store")
@observer
class PlaylistAudioItem extends React.Component<IPlaylistAudioItem> {
  public render() {
    const { key, store, audio, playFile } = this.props;
    return (
      <PlaylistAudioItemPure
        key={key}
        audio={audio}
        playFile={playFile}
        isNow={
          store!.FilesStore.playNow &&
          store!.FilesStore.playNow.fullPath === audio.fullPath
        }
      />
    );
  }
}

class PlaylistAudioItemPure extends React.PureComponent<IPlaylistAudioPure> {
  public render() {
    const { key, isNow, audio, playFile } = this.props;
    console.log(audio.fullPath);
    return (
      <div
        className={`audio-item ${isNow && "now"}`}
        key={key}
        onClick={() => playFile(audio.fullPath)}
      >
        <div className="audio-item__art" style={{ marginRight: "12px" }} />
        <div className="audio-item__info">
          <p className="audio-item__title">{audio.title}</p>
          <p className="audio-item__bandName">{audio.author}</p>
        </div>
      </div>
    );
  }
}

export default PlaylistAudioItem;
