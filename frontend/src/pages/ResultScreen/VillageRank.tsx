import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import Background from '../../components/ui/Background';
import HomeButton from '../../components/ui/HomeButton';
import { getVillageRanking, RankingEntry } from '../../services/endpoints/village';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const VillageRank = () => {
  const navigate = useNavigate();
  const scale = useScale();
  const [phase, setPhase] = useState<'highlight' | 'transition' | 'list'>('highlight');

  // API에서 받아온 모든 마을 랭킹
  const [allVillages, setAllVillages] = useState<RankingEntry[]>([]);
  // 로컬스토리지의 village_id와 매칭된 우리 마을 정보
  const [myVillage, setMyVillage] = useState<RankingEntry | null>(null);
  // 데이터 로딩 상태
  const [loadingData, setLoadingData] = useState(true);

  // 1) 컴포넌트 마운트 시 API 호출하여 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRanking = async () => {
      setLoadingData(true);
      try {
        const res = await getVillageRanking();
        const rankingList = res.data; // RankingEntry[]

        // 로컬스토리지에서 내 village_id 꺼내기
        const myVillageId = localStorage.getItem('village_id');
        if (myVillageId) {
          const found = rankingList.find((v) => v.village_id === myVillageId) || null;
          setMyVillage(found);
        } else {
          setMyVillage(null);
        }

        setAllVillages(rankingList);
      } catch (err) {
        console.error('랭킹 조회 중 에러:', err);
        setAllVillages([]);
        setMyVillage(null);
      } finally {
        setLoadingData(false);
      }
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    // 만약 village_id 가 없는 경우 (마을 설정 안한 경우)
    // phase = 'list'로 만들어버리기!
    if(!myVillage){
      setPhase('list');
      return;
    }
    const timer1 = setTimeout(() => {
      setPhase('transition');
    }, 3000);

    const timer2 = setTimeout(() => {
      setPhase('list');
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  useEffect(() => {
    const homeTimer = setTimeout(() => {
      navigate('/');
    }, 30000); // 10초
    return () => clearTimeout(homeTimer);
  }, [navigate]);

return (
    <div className="relative w-full h-full">
      {/* 반투명 오버레이 */}
      <div className="absolute inset-0 bg-[#FFF9C4]/70 z-10" />
      <Background />
      <HomeButton />

      {/* 제목 */}
      <div className="absolute inset-x-0 z-20 flex justify-center" style={{ top: `calc(123px * ${scale})` }}>
      <div
        className="text-white font-black text-center flex items-center justify-center"
        style={{
          width: `calc(718px * ${scale})`,
          height: `calc(110px * ${scale})`,
          borderWidth: `calc(10px * ${scale})`,
          borderStyle: 'solid',
          borderColor: '#0E8E12',
          borderRadius: `calc(30px * ${scale})`,
          backgroundColor: '#0DA429',
          fontSize: `calc(60px * ${scale})`,
          lineHeight: `calc(72px * ${scale})`
        }}
      >
        우리 마을 안전 등수
      </div>
    </div>

      {/* 리스트 프레임 (항상 보임) */}
      <div className="absolute inset-x-0 z-20 flex justify-center" style={{ top: `calc(276px * ${scale})` }}>
        <div
        className="bg-green-700 bg-opacity-50 border-[#0E8E12] shadow-lg flex flex-col items-center justify-start"
        style={{
          width: `calc(834px * ${scale})`,
          height: `calc(437px * ${scale})`,
          borderWidth: `calc(10px * ${scale})`,
          borderStyle: 'solid',
          borderColor: '#0E8E12',
          borderRadius: `calc(20px * ${scale})`,
          backgroundColor: 'rgba(14, 142, 18, 0.5)',
          paddingTop: `calc(16px * ${scale})`,
          paddingBottom: `calc(16px * ${scale})`,
          paddingLeft: `calc(24px * ${scale})`,
          paddingRight: `calc(24px * ${scale})`
        }}
      >
          {/* 테이블 헤더 (항상 보임) */}
          <div
            className="w-full text-center text-white font-black"
            style={{
              fontSize: `calc(35px * ${scale})`,
              lineHeight: `calc(70px * ${scale})`,
              paddingTop: `calc(8px * ${scale})`
            }}
          >
            <div className="flex justify-around">
              <div className="w-[10%]">등수</div>
              <div className="w-[35%]">마을 이름</div>
              <div className="w-[25%]">참여자 수</div>
              <div className="w-[25%]">안전 점수</div>
            </div>
          </div>

          {/* 실제 데이터 리스트 */}
          <div
            className="overflow-y-auto scroll-container"
            style={{
              width: `calc(770px * ${scale})`,
              height: `calc(299px * ${scale})`,
              backgroundColor: 'rgba(14, 142, 18, 0.2)',
              borderRadius: `calc(20px * ${scale})`,
              marginTop: `calc(8px * ${scale})`
            }}
          >
            <div className="w-full">
              {loadingData ? (
                <div
                  className="text-white font-black flex items-center justify-center"
                  style={{
                    height: `calc(299px * ${scale})`,
                    fontSize: `calc(30px * ${scale})`
                  }}
                >
                  로딩 중...
                </div>
              ) : allVillages.length === 0 ? (
                <div
                  className="text-white font-black flex items-center justify-center"
                  style={{
                    height: `calc(299px * ${scale})`,
                    fontSize: `calc(30px * ${scale})`
                  }}
                >
                  데이터가 없습니다.
                </div>
              ) : (
                allVillages.map((village, idx) => (
                  <div
                    key={village.village_id}
                    className={`text-white font-black border-b flex justify-around items-center transition-all duration-500 ${
                      myVillage && village.rank === myVillage.rank
                        ? 'bg-green-600 shadow-lg scale-105'
                        : 'hover:bg-green-600'
                    } ${
                      phase === 'highlight' && (!myVillage || village.rank !== myVillage.rank)
                        ? 'opacity-0'
                        : phase === 'list'
                        ? 'opacity-100'
                        : myVillage && village.rank === myVillage.rank
                        ? 'opacity-100 animate-pulse'
                        : 'opacity-0'
                    }`}
                    style={{
                      fontSize: `calc(30px * ${scale})`,
                      paddingTop: `calc(20px * ${scale})`,
                      paddingBottom: `calc(20px * ${scale})`,
                      borderBottomWidth: `calc(1px * ${scale})`,
                      borderBottomColor: 'rgba(255, 255, 255, 0.3)',
                      transform:
                        phase === 'list' ||
                        (myVillage && village.rank === myVillage.rank)
                          ? 'translateX(0)'
                          : 'translateX(-100%)',
                      transition:
                        myVillage && village.rank === myVillage.rank
                          ? 'all 0.5s ease-out'
                          : `all ${0.3 + idx * 0.1}s ease-out ${
                              phase === 'list' ? idx * 100 : 0
                            }ms`
                    }}
                  >
                    {/* 등수 아이콘 */}
                    <div className="w-[10%] text-center">
                      {village.rank <= 3 ? (
                        <EnhancedOptimizedImage
                          src={`/assets/images/medal_${
                            village.rank === 1
                              ? 'first'
                              : village.rank === 2
                              ? 'second'
                              : 'third'
                          }.png`}
                          alt={`${village.rank}등`}
                          style={{
                            height: `calc(48px * ${scale})`,
                            width: 'auto',
                            margin: '0 auto'
                          }}
                        />
                      ) : (
                        village.rank
                      )}
                    </div>

                    {/* 마을 이름 */}
                    <div className="w-[35%] text-center">{village.village_name}</div>

                    {/* 참여자 수 */}
                    <div className="w-[25%] text-center">
                      {village.participants}명
                    </div>

                    {/* 안전 점수 (평균) */}
                    <div className="w-[25%] text-center">{village.avg_score}점</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1: 사용자 마을 강조 오버레이 */}
      {myVillage && (
        <div
          className={`absolute bg-green-700 border-green-700 z-30 shadow-2xl flex items-center justify-around text-white font-black transition-all duration-1000 ease-in-out ${
            phase === 'highlight' ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
          }`}
          style={{
            width: `calc(908px * ${scale})`,
            height: `calc(135px * ${scale})`,
            left: `calc(58px * ${scale})`,
            top: `calc(420px * ${scale})`,
            borderWidth: `calc(7px * ${scale})`,
            borderStyle: 'solid',
            borderColor: '#0E8E12',
            borderRadius: `calc(20px * ${scale})`,
            backgroundColor: '#0E8E12',
            fontSize: `calc(50px * ${scale})`,
            lineHeight: `calc(70px * ${scale})`,
            paddingLeft: `calc(32px * ${scale})`,
            paddingRight: `calc(32px * ${scale})`
          }}
        >
          {/* 강조 카드 내부 */}
          <div className="w-[10%] text-center">
            {myVillage.rank === 1 ? (
              <EnhancedOptimizedImage
                src="/assets/images/medal_first.png"
                alt="1등"
                style={{
                  height: `calc(64px * ${scale})`,
                  width: 'auto',
                  margin: '0 auto'
                }}
              />
            ) : myVillage.rank === 2 ? (
              <EnhancedOptimizedImage
                src="/assets/images/medal_second.png"
                alt="2등"
                style={{
                  height: `calc(64px * ${scale})`,
                  width: 'auto',
                  margin: '0 auto'
                }}
              />
            ) : myVillage.rank === 3 ? (
              <EnhancedOptimizedImage
                src="/assets/images/medal_third.png"
                alt="3등"
                style={{
                  height: `calc(64px * ${scale})`,
                  width: 'auto',
                  margin: '0 auto'
                }}
              />
            ) : (
              myVillage.rank
            )}
          </div>
          <div className="w-[15%] text-center">{myVillage.rank}등</div>
          <div className="w-[25%] text-center">{myVillage.village_name}</div>
          <div className="w-[25%] text-center">{myVillage.participants}명</div>
          <div className="w-[25%] text-center">{myVillage.avg_score}점</div>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .8;
          }
        }
      `}</style>
    </div>
  );
};

export default VillageRank;