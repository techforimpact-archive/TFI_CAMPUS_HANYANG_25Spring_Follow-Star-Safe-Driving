import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../../components/ui/Background';
import { createVillage, getVillageRanking, RankingEntry } from '../../services/endpoints/village';
import { audioManager } from '../../utils/audioManager';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

const locationData = {
    서울특별시 : ["서울특별시 종로구", "서울특별시 중구", "서울특별시 용산구", "서울특별시 성동구", "서울특별시 광진구", "서울특별시 동대문구", "서울특별시 중랑구", "서울특별시 성북구", "서울특별시 강북구", "서울특별시 도봉구", "서울특별시 노원구", "서울특별시 은평구", "서울특별시 서대문구", "서울특별시 마포구", "서울특별시 양천구", "서울특별시 강서구", "서울특별시 구로구", "서울특별시 금천구", "서울특별시 영등포구", "서울특별시 동작구", "서울특별시 관악구", "서울특별시 서초구", "서울특별시 강남구", "서울특별시 송파구", "서울특별시 강동구"],
    부산광역시: ["부산광역시 중구", "부산광역시 서구", "부산광역시 동구", "부산광역시 영도구", "부산광역시 부산진구", "부산광역시 동래구", "부산광역시 남구", "부산광역시 북구", "부산광역시 해운대구", "부산광역시 사하구", "부산광역시 금정구", "부산광역시 강서구", "부산광역시 연제구", "부산광역시 수영구", "부산광역시 사상구", "부산광역시 기장군"],
    대구광역시 : ["대구광역시 중구", "대구광역시 동구", "대구광역시 서구", "대구광역시 남구", "대구광역시 북구", "대구광역시 수성구", "대구광역시 달서구", "대구광역시 달성군"],
    인천광역시 : ["인천광역시 중구", "인천광역시 동구", "인천광역시 남구", "인천광역시 미추홀구", "인천광역시 연수구", "인천광역시 남동구", "인천광역시 부평구", "인천광역시 계양구", "인천광역시 서구", "인천광역시 강화군", "인천광역시 옹진군"],
    광주광역시: ["광주광역시 동구", "광주광역시 서구", "광주광역시 남구", "광주광역시 북구", "광주광역시 광산구"],
    대전광역시: ["대전광역시 동구", "대전광역시 중구", "대전광역시 서구", "대전광역시 유성구", "대전광역시 대덕구"],
    울산광역시: ["울산광역시 중구", "울산광역시 남구", "울산광역시 동구", "울산광역시 북구", "울산광역시 울주군"],
    세종특별자치시 : ["세종특별자치시"],
    경기도 : ["경기도 수원시", "경기도 성남시", "경기도 고양시", "경기도 용인시", "경기도 부천시", "경기도 안산시", "경기도 안양시", "경기도 남양주시", "경기도 화성시", "경기도 평택시", "경기도 의정부시", "경기도 시흥시", "경기도 파주시", "경기도 광명시", "경기도 김포시", "경기도 군포시", "경기도 광주시", "경기도 이천시", "경기도 양주시", "경기도 오산시", "경기도 구리시", "경기도 안성시", "경기도 포천시", "경기도 의왕시", "경기도 하남시", "경기도 여주시", "경기도 여주군", "경기도 양평군", "경기도 동두천시", "경기도 과천시", "경기도 가평군", "경기도 연천군"],
    강원도 : ["강원도 춘천시", "강원도 원주시", "강원도 강릉시", "강원도 동해시", "강원도 태백시", "강원도 속초시", "강원도 삼척시", "강원도 홍천군", "강원도 횡성군", "강원도 영월군", "강원도 평창군", "강원도 정선군", "강원도 철원군", "강원도 화천군", "강원도 양구군", "강원도 인제군", "강원도 고성군", "강원도 양양군"],
    충청북도: ["충청북도 청주시", "충청북도 충주시", "충청북도 제천시", "충청북도 청원군", "충청북도 보은군", "충청북도 옥천군", "충청북도 영동군", "충청북도 진천군", "충청북도 괴산군", "충청북도 음성군", "충청북도 단양군", "충청북도 증평군"],
    충청남도 : ["충청남도 천안시", "충청남도 공주시", "충청남도 보령시", "충청남도 아산시", "충청남도 서산시", "충청남도 논산시", "충청남도 계룡시", "충청남도 당진시", "충청남도 당진군", "충청남도 금산군", "충청남도 연기군", "충청남도 부여군", "충청남도 서천군", "충청남도 청양군", "충청남도 홍성군", "충청남도 예산군", "충청남도 태안군"],
    전라북도 : ["전라북도 전주시", "전라북도 군산시", "전라북도 익산시", "전라북도 정읍시", "전라북도 남원시", "전라북도 김제시", "전라북도 완주군", "전라북도 진안군", "전라북도 무주군", "전라북도 장수군", "전라북도 임실군", "전라북도 순창군", "전라북도 고창군", "전라북도 부안군"],
    전라남도: ["전라남도 목포시", "전라남도 여수시", "전라남도 순천시", "전라남도 나주시", "전라남도 광양시", "전라남도 담양군", "전라남도 곡성군", "전라남도 구례군", "전라남도 고흥군", "전라남도 보성군", "전라남도 화순군", "전라남도 장흥군", "전라남도 강진군", "전라남도 해남군", "전라남도 영암군", "전라남도 무안군", "전라남도 함평군", "전라남도 영광군", "전라남도 장성군", "전라남도 완도군", "전라남도 진도군", "전라남도 신안군"],
    경상북도: ["경상북도 포항시", "경상북도 경주시", "경상북도 김천시", "경상북도 안동시", "경상북도 구미시", "경상북도 영주시", "경상북도 영천시", "경상북도 상주시", "경상북도 문경시", "경상북도 경산시", "경상북도 군위군", "경상북도 의성군", "경상북도 청송군", "경상북도 영양군", "경상북도 영덕군", "경상북도 청도군", "경상북도 고령군", "경상북도 성주군", "경상북도 칠곡군", "경상북도 예천군", "경상북도 봉화군", "경상북도 울진군", "경상북도 울릉군"],
    경상남도: ["경상남도 창원시", "경상남도 마산시", "경상남도 진주시", "경상남도 진해시", "경상남도 통영시", "경상남도 사천시", "경상남도 김해시", "경상남도 밀양시", "경상남도 거제시", "경상남도 양산시", "경상남도 의령군", "경상남도 함안군", "경상남도 창녕군", "경상남도 고성군", "경상남도 남해군", "경상남도 하동군", "경상남도 산청군", "경상남도 함양군", "경상남도 거창군", "경상남도 합천군"],
    제주특별자치도: ["제주특별자치도 제주시", "제주특별자치도 서귀포시", "제주특별자치도 북제주군", "제주특별자치도 남제주군"],
};

const SettingPage = () => {
    const [inputValue, setInputValue] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [registeredRegions, setRegisteredRegions] = useState<string[]>([]);
    const [loadingRegions, setLoadingRegions] = useState(true);

    // 터치 드래그를 위한 ref와 상태
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [hasMoved, setHasMoved] = useState(false);


    const navigate = useNavigate();

    const allRegions = Object.values(locationData).flat();
    const sortedRegions = allRegions
        .filter(region => region.includes(inputValue))
        .sort((a, b) => a.localeCompare(b, 'ko'));
    
    // 컴포넌트 마운트 시점에 /villages/ranking 호출
    useEffect(() => {
    const fetchRegisteredRegions = async () => {
      try {
        const res = await getVillageRanking();
        // getVillageRanking() 리턴 타입: RankingEntry[]
        const rankingList: RankingEntry[] = res.data;

        // 1) "participants" 기준 내림차순으로 재정렬
        const byParticipantsDesc = [...rankingList].sort((a, b) => b.participants - a.participants);

        // 2) village_name만 추출해서 registeredRegions에 세팅
        //    (이미 등록된 마을을 누르는 로직과 호환되도록, 단순 문자열 배열로 저장)
        const names = byParticipantsDesc.map(entry => entry.village_name);

        setRegisteredRegions(names);
      } catch (err) {
        console.error('마을 랭킹 조회 실패:', err);
        setRegisteredRegions([]); // 실패 시 빈 배열
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegisteredRegions();
    }, []);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!scrollContainerRef.current) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setStartX(clientX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        setStartTime(Date.now());
        setHasMoved(false);
        setIsDragging(true);
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const x = clientX - scrollContainerRef.current.offsetLeft;
        const moveDistance = Math.abs(x - startX);
        
        // 5px 이상 움직였으면 드래그로 간주
        if (moveDistance > 5) {
            setHasMoved(true);
            e.preventDefault();
            const walk = (x - startX) * 2;
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const handleDragEnd = () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // 300ms 이하이고 5px 이하로만 움직였으면 탭으로 간주
        const isTap = duration < 300 && !hasMoved;
        
        setIsDragging(false);
        setHasMoved(false);
        
        return isTap;
    };

    const handleRegionClick = (region: string, e: React.MouseEvent | React.TouchEvent) => {
        // 드래그 종료 시 탭인지 확인
        const isTap = handleDragEnd();
        
        // 탭이거나 마우스 클릭인 경우만 선택 처리
        if (isTap || e.type === 'click') {
            setSelectedRegion(region);
        }
    };
    
    const handleSubmit = async() => {
        //선택 버튼 효과음
        audioManager.playButtonClick();
        if (selectedRegion) {
          try {
            // 1) 서버에 village 생성 또는 조회 후 village_id 반환
            const villageId = (await createVillage(selectedRegion)).data.village_id;

            // 2) localStorage에 선택된 지역 이름 & 마을 id 저장
            localStorage.setItem('selectedRegion', selectedRegion);
            localStorage.setItem('village_id', villageId);

            // 3) 등록 목록에 추가 (중복 없이)
            setRegisteredRegions((prev) =>
              prev.includes(selectedRegion) ? prev : [...prev, selectedRegion]
            );

            // 4) village_id도 localStorage에 저장 (이미 getOrCreateVillage 내부에서 저장됨)
            console.log('저장된 village_id:', villageId);

            // 5) 설정 완료 후 메인 페이지로 이동
            navigate('/');
          } catch (err) {
            console.error('마을 생성/조회 실패', err);
          }
        }
    };

    const handleExit = () => {
        //선택 버튼 효과음
        audioManager.playButtonClick();
        navigate('/');
    };



    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#F9F9F9]">
        <Background />
        <div className="absolute inset-0 bg-[#FFF9C4]/60 z-0"></div>

        {/* 닫기 버튼 */}
        <EnhancedOptimizedImage
            src="/assets/images/exit_button.png"
            alt="나가기 버튼"
            onClick={handleExit}
            className="absolute top-[10px] left-[10px] w-[100px] h-auto z-50 cursor-pointer hover:scale-90 transition-transform duration-200"
        />

        {/* 입력창 */}
        <input
            type="text"
            placeholder="지역명을 입력하세요"
            value={inputValue}
            onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 800)}
            className="absolute left-[191px] top-[143px] z-50 w-[641px] h-[130px] bg-[#0DA429] border-[7px] border-[#0E8E12] shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)] rounded-[20px] text-[#FFFAFA] text-[50px] leading-[120%] placeholder-[#FFFAFA] placeholder:text-[50px] placeholder:leading-[120%] font-bold text-center px-4"
        />

        {/* 자동완성 목록 */}
        {showSuggestions && sortedRegions.length > 0 && (
            <div className="absolute top-[260px] left-[191px] w-[641px] max-h-[450px] overflow-y-auto scroll-container flex flex-col gap-4 z-40 bg-[#FFF9C4] rounded-[10px] p-8 shadow-lg">
            {sortedRegions.map((region) => (
                <button
                key={region}
                onClick={() => {
                    setSelectedRegion(region);
                    setInputValue(region);
                    setShowSuggestions(false);
                }}
                className={`w-full h-[100px] flex justify-center items-center ${selectedRegion === region ? 'bg-green-700' : 'bg-[#0DA429]'} text-white text-[40px] font-bold border-[5px] border-[#0E8E12] transition-colors duration-200 rounded-[20px]`}
                >
                {region}
                </button>
            ))}
            </div>
        )}

        {!inputValue && (
            <>
            <div
                className="absolute left-[187px] top-[331px] w-[521px] h-[34px] text-[30px] leading-[120%] font-black text-[#0E8E12]"
            >
            이미 등록된 지역 목록
            </div>

            <div 
                ref={scrollContainerRef}
                className={`absolute left-[194px] top-[380px] max-w-[90%] w-[640px] overflow-x-auto scroll-container ${isDragging && hasMoved ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{ 
                    scrollBehavior: isDragging && hasMoved ? 'auto' : 'smooth',
                    userSelect: 'none'
                }}
            >
                <div className="flex gap-4">
                {registeredRegions.map((region) => (
                    <button
                    key={region}
                    onClick={(e) => handleRegionClick(region, e)}
                    onTouchEnd={(e) => handleRegionClick(region, e)}
                    className={`
                        ${selectedRegion === region ? 'bg-green-700' : 'bg-[rgba(11,159,38,0.5)]'}
                        border-[7px] border-[#0E8E12]
                        rounded-[28px] 
                        flex items-center justify-center 
                        text-white text-[33px] font-extrabold
                        whitespace-nowrap px-3 py-1.5
                        select-none
                    `}
                    >
                    {region}
                    </button>
                ))}
                </div>
            </div>
            </>
        )}

        {/* 선택하기 버튼 */}
        <EnhancedOptimizedImage
            src="/assets/images/select_button_dark.png"
            alt="선택하기 버튼"
            className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2 
                        w-[234px] h-auto z-30 cursor-pointer hover:scale-90 transition-transform duration-200"
            onClick={handleSubmit}
        />
    </div>
    );
};

export default SettingPage;