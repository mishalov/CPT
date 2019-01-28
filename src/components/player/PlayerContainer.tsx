import React from "react";
import { Icon, Slider, Button } from "antd";
import "./Player.scss";
import { observer, inject } from "mobx-react";
import ReactPlayer from "react-player";
import { Store } from "../../store/Store";
import { secsToMins } from "../../helpers/secsToMins";

interface IPlayerContainer {
  store?: Store;
}

interface IDurationProgress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

@inject("store")
@observer
class PlayerContainer extends React.Component<IPlayerContainer> {
  state = {
    progress: {
      played: 0,
      playedSeconds: 0,
      loaded: 0,
      loadedSeconds: 0
    }
  };
  public render() {
    const { FilesStore } = this.props.store!;
    return (
      <div className="player" style={{ marginBottom: "12px" }}>
        <ReactPlayer
          style={{
            position: "absolute",
            zIndex: -5
          }}
          onDuration={(dur: any) => {
            FilesStore.playNow.audio.duration = dur;
          }}
          onProgress={(progress: IDurationProgress) => {
            this.setState({ progress });
          }}
          width="1px"
          height="1px"
          fileConfig={{ forceAudio: true }}
          url={FilesStore.playNow.URL}
          playing={FilesStore.isPlay}
        />

        <Icon
          type={!FilesStore.isPlay ? "play-circle" : "pause-circle"}
          theme="filled"
          className="player-btn__play"
          onClick={() => {
            console.log(FilesStore.isPlay);
            FilesStore.switchPlay();
          }}
        />

        <Icon
          type="step-backward"
          theme="filled"
          className="player-btn__step"
        />
        <Icon type="step-forward" theme="filled" className="player-btn__step" />
        <div className="slider-block">
          <div className="slider-block__meta">
            <div className="slider-block__naming">
              <p className="slider-block__title">
                {FilesStore.playNow.audio.title}
              </p>
              <p className="slider-block__author">
                {FilesStore.playNow.audio.author}
              </p>
            </div>
            <p className="slider-block__time">
              <span>
                {secsToMins(this.state.progress.playedSeconds)} /
                {secsToMins(FilesStore.playNow.audio.duration)}
              </span>
            </p>
          </div>
          <Slider
            className="slider-block__slider"
            max={100}
            value={this.state.progress.played * 100}
          />
        </div>
        <div className="player__additional">
          <Icon className="player-btn__repeat" type="swap" />
          <div className="player-btn__shufle" />
        </div>
      </div>
    );
  }
}

export default PlayerContainer;
