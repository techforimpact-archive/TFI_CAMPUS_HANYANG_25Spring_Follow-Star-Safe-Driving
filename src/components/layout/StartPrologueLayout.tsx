// src/layouts/StartPrologueLayout.tsx

import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { initBgm, playBgm, stopBgm, unloadBgm } from "../../utils/backgroundMusic";

const StartPrologueLayout: React.FC = () => {
  useEffect(() => {
    console.log("StartPrologueLayout mount")
    // #1~#2 화면 진입 시 한 번만 초기화 & 재생
    initBgm("sparrow_land")
      .then(() => playBgm("sparrow_land"))
      .catch((e) => console.error("Start/Prologue BGM init error:", e));

    // 언마운트 시 BGM 정지
    return () => {
      stopBgm("sparrow_land");
      unloadBgm("sparrow_land");
      console.log("StartPrologueLayout unmount")
    };
  }, []);

  return (
    <div className="w-full h-full">
      {/* 
        여기 Outlet 자리에 /start (1), /prologue (2) 페이지가 렌더링
        레이아웃 언마운트 전까지 BGM이 꺼지지 않도록..!
      */}
      <Outlet />
    </div>
  );
};

export default StartPrologueLayout;
