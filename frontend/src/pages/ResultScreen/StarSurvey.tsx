import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import Background from '../../components/ui/Background';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';
import Star from './Star'; 
import GameTitle from '../../components/ui/GameTitle';
import BackButton from '../../components/ui/BackButton';
import { updateSessionRating } from "../../services/endpoints/session";

const starCharacter = '/assets/images/star_character.png';
const submitButton = '/assets/images/submit_button.png';

const StarSurvey = () => {
  const navigate = useNavigate();
  const scale = useScale();

  // 5개의 ⭐ 중 몇 개가 선택되었는지를 관리하는 상태 (초기값: 5)
  const [selectedStar, setSelectedStar] = useState(0);

  // 로딩 상태 관리
  const [loading, setLoading] = useState(false);

  // 로컬스토리지에서 session_id 읽기 (createSession 완료 시 저장했다고 가정)
  const sessionId = localStorage.getItem("session_id") || "";


   // “제출” 버튼 클릭 시 호출
  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log("[StarSurvey] PATCH satisfaction_rating →", {
        session_id: sessionId,
        satisfaction_rating: selectedStar,
      });

      // 3. 서버에 satisfaction_rating(별점)만 업데이트
      const res = await updateSessionRating(sessionId, selectedStar);
      console.log("[StarSurvey] updateSessionRating 성공:", res.data);

      // 4. 성공 후 랭킹 페이지로 이동
      navigate("/rank");
    } catch (err) {
      console.error("[StarSurvey] 별점 저장 실패:", err);
      navigate("/rank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-[#FFF9C4]/70 z-20" />
      <Background />

      {/* 뒤로가기 버튼 */}
      <BackButton onClick={() => navigate('/memory')} />

      {/* 질문 텍스트 */}
      <div 
        className="absolute z-50"
        style={{
          top: `calc(181px * ${scale})`,
          left: `calc(173px * ${scale})`,
          width: `calc(678px * ${scale})`,
          height: `calc(60px * ${scale})`
        }}
      >
        <GameTitle
          text="안전교육 게임이 도움이 되셨나요?"
          fontSize={`calc(50px * ${scale})`}
          color="text-[#0DA429]"
          strokeWidth={`calc(5px * ${scale})`}
        />
      </div>

      {/* 별점 박스 */}
      <div 
        className="absolute bg-white bg-opacity-70 border-green-700 z-40"
        style={{
          width: `calc(750px * ${scale})`,
          height: `calc(202px * ${scale})`,
          left: `calc(137px * ${scale})`,
          top: `calc(287px * ${scale})`,
          borderWidth: `calc(4px * ${scale})`,
          borderStyle: 'solid',
          borderRadius: `calc(30px * ${scale})`,
          borderColor: '#15803d',
          backgroundColor: 'rgba(255, 250, 250, 0.7)',
          boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          className="flex items-center justify-center"
          style={{ 
            gap: `calc(20px * ${scale})`,
            width: '100%',
            height: '100%'
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: `calc(120px * ${scale})`,
                height: `calc(120px * ${scale})`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setSelectedStar(i)}
            >
              <Star
                filled={i <= selectedStar}
                onClick={() => setSelectedStar(i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 캐릭터 이미지 */}
      <img 
        src={starCharacter} 
        alt="별별이" 
        className="absolute z-50"
        style={{
          bottom: `calc(80px * ${scale})`,
          left: `calc(30px * ${scale})`,
          width: `calc(250px * ${scale})`,
          height: 'auto'
        }}
      />

      {/* 제출 버튼 */}
      <img
        src={submitButton}
        alt="제출 버튼"
        onClick={() => {
          if (!loading) {
            handleSubmit();
          }
        }}
        className="absolute cursor-pointer hover:scale-105 transition-transform duration-300 z-50"
        style={{
          bottom: `calc(54px * ${scale})`,
          left: `calc(382px * ${scale})`, // 중앙 정렬: (1024 - 336) / 2
          width: `calc(260px * ${scale})`,
        }}
      />
    </div>
  );
};

export default StarSurvey;