import { Howl } from 'howler';
import { getSoundUrl } from '../services/soundService';

type BgmType = 'sparrow_land' | 'del_rio_bravo' | 'result_bgm';
const bgmPlayers: Partial<Record<BgmType, Howl>> = {};

export async function initBgm(bgmType: BgmType) {
  if (bgmPlayers[bgmType]) {
    // 이미 생성된 Howl이 있으면 재사용 → 새로운 오디오 요소를 만들지 않음
    return;
  }
  const fileName = bgmType === 'sparrow_land'
    ? 'sparrow_land.mp3'
    : bgmType === 'del_rio_bravo'
    ? 'del_rio_bravo.mp3'
    : 'result.mp3';
  
  const url = await getSoundUrl(fileName);
  const howl = new Howl({
    src: [url],
    html5: true,
    loop: true,
    volume: 0.5,
    preload: true,
  });
  bgmPlayers[bgmType] = howl;
}

export async function playBgm(bgmType: BgmType) {
  const player = bgmPlayers[bgmType];
  if (!player) 
    {
      // console.log("no!");
      return;
    }
    // 브라우저 정책으로 AudioContext가 suspended 일 경우 resume
  if (Howler.ctx.state === 'suspended') {
    await Howler.ctx.resume();
  }
  //if (!player.playing()) {
    player.play();
    // console.log("playBgm called");
  //}
}

export function stopBgm(bgmType: BgmType) {
  const player = bgmPlayers[bgmType];
  if (player && player.playing()) {
    player.stop();
  }
}

export function unloadBgm(bgmType: BgmType) {
  const player = bgmPlayers[bgmType];
  if (player) {
    player.stop();
    player.unload();       // Howler 내부의 <audio>와 버퍼를 해제
    delete bgmPlayers[bgmType];
  }
}