import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { initBgm, playBgm, stopBgm, unloadBgm } from "../../utils/backgroundMusic";

const ResultLayout: React.FC = () => {
  useEffect(() => {
    // #6 결과 화면 진입 시 초기화 & 재생
    console.log("ResultLayout mount")
    initBgm("result_bgm")
      .then(() => playBgm("result_bgm"))
      .catch((e) => console.error("Result BGM init error:", e));

    // 언마운트 시 BGM 정지
    return () => {
      stopBgm("result_bgm");
      unloadBgm("result_bgm");
      console.log("ResultLayout unmount")
    };
  }, []);

  return (
    <div className="w-full h-full">
      {/* /result 페이지가 렌더됩니다. */}
      <Outlet />
    </div>
  );
};

export default ResultLayout;
