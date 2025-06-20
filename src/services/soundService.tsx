// src/services/soundService.ts

import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * @param fileName  Firebase Storage의 sounds/ 디렉터리에 저장된 파일 이름
 * @returns          해당 오디오 파일의 다운로드 URL
 */
export async function getSoundUrl(fileName: string): Promise<string> {
  // Firebase Storage 안의 'sound/<fileName>' 위치!
  const soundRef = ref(storage, `sound/${fileName}`);

  // getDownloadURL을 호출하여 유효한 URL(만료된 토큰 포함)을 받아옵니다.
  const url = await getDownloadURL(soundRef);
  return url;
}
