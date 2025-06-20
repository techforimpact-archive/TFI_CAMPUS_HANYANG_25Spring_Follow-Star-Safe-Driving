import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { initBgm, playBgm, stopBgm, unloadBgm } from "../../utils/backgroundMusic";

const QuestLayout: React.FC = () => {
  useEffect(() => {
    console.log("QuestLayout mount")
    // #3~#5 화면 진입 시 한 번만 초기화 & 재생
    initBgm("del_rio_bravo")
      .then(() => playBgm("del_rio_bravo"))
      .catch((e) => console.error("Quest BGM init error:", e));

    // 언마운트 시 BGM 정지
    return () => {
      stopBgm("del_rio_bravo");
      unloadBgm("del_rio_bravo");
      console.log("QuestLayout unmount")
    };
  }, []);

  return (
    <div className="w-full h-full">
      {/* 
        이곳에 /quest/3, /quest/4, /quest/5 페이지가 Outlet을 통해 렌더링
        레이아웃이 유지되는 한 BGM이 계속 재생됩니다.
      */}
      <Outlet />
    </div>
  );
};

export default QuestLayout;
