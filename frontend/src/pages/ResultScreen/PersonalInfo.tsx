import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScale } from '../../hooks/useScale';
import Background from '../../components/ui/Background';
import NextButton from './NextButton';
import HomeButton from '../../components/ui/HomeButton';
import BackButton from '../../components/ui/BackButton';
import { createUser } from '../../services/endpoints/user';
import { audioManager } from '../../utils/audioManager';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const scale = useScale();
  
  // 입력 상태 관리
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // “다음” 버튼 클릭 시 호출
  const handleSubmit = async () => {
    //선택 효과음
    audioManager.playButtonClick();
    
    // 필수값 검증
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (age === '' || age <= 0) {
      alert('나이를 올바르게 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      alert('연락처를 입력해주세요.');
      return;
    }

    // 로컬스토리지에서 village_id 읽기
    const villageId = localStorage.getItem('village_id');
    console.log("저장된 village_id : ", villageId);

    const sessionId = localStorage.getItem('session_id')!;
    const scoreStr = localStorage.getItem('total_score')!;
    const score = Number(scoreStr);

    setLoading(true);
    try {
      // 3) createUser(villageId, { name, phone, age, is_guest: true })
      const res = await createUser(villageId!, {
        name,
        phone,
        age: Number(age),
        is_guest: false, // 실제 유저로 생성
        session_id: sessionId,
        score: score
      });

      console.log("[PersonalInfo] ← createUser() response.data:", res.data);

      // 4) 서버 응답에서 user_id 뽑아서 로컬스토리지에 저장
      const newUserId = res.data.user_id;
      localStorage.setItem('user_id', newUserId);
      console.log("[PersonalInfo] → Saved new user_id into localStorage:", newUserId);

      // 5) 다음 화면으로 이동 (예: 메모리 페이지)
      navigate('/memory');
    } catch (err) {
      console.error('사용자 생성 실패:', err);
      alert('사용자 정보를 저장하는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCertificate = () => {
    navigate('/certificate');
  };

  const [isComposing, setIsComposing] = useState(false);
  const filterHangul = (v: string) => v.replace(/[^가-힣]/g, '');


  return (
    <div className="relative w-full h-full">
      <Background />
      <BackButton onClick={handleBackToCertificate} />
      <HomeButton />

      {/* 타이틀 */}
      <div 
        className="absolute bg-green-600 border-green-700 z-50"
        style={{
          width: `calc(718px * ${scale})`,
          height: `calc(100px * ${scale})`,
          left: `calc(153px * ${scale})`,
          top: `calc(159px * ${scale})`,
          borderWidth: `calc(10px * ${scale})`,
          borderStyle: 'solid',
          borderColor: '#0E8E12',
          borderRadius: `calc(30px * ${scale})`,
          backgroundColor: '#0DA429',
          boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="text-center font-black text-white"
          style={{
            fontSize: `calc(55px * ${scale})`,
            lineHeight: `calc(66px * ${scale})`
          }}
        >
          아래의 내용을 입력해주세요
        </div>
      </div>

      {/* 입력 폼 컨테이너 */}
      <div 
        className="absolute z-40"
        style={{
          width: `calc(732px * ${scale})`,
          height: `calc(321px * ${scale})`,
          left: `calc(146px * ${scale})`,
          top: `calc(286px * ${scale})`,
          borderWidth: `calc(10px * ${scale})`,
          borderStyle: 'solid',
          borderColor: '#0E8E12',
          borderRadius: `calc(20px * ${scale})`,
          backgroundColor: 'rgba(14, 142, 18, 0.5)',
          boxSizing: 'border-box'
        }}
      >
        {/* 이름 필드 */}
        <div 
          className="absolute"
          style={{
            left: `calc(131px * ${scale})`,
            top: `calc(44px * ${scale})`
          }}
        >
          <label 
            className="absolute text-white font-black"
            style={{
              width: `calc(87px * ${scale})`,
              height: `calc(60px * ${scale})`,
              fontSize: `calc(50px * ${scale})`,
              lineHeight: `calc(60px * ${scale})`,
              left: 0,
              top: 0
            }}
          >
            이름
          </label>
          <input
            type="text"
            value={name}
            // 한글 조합 시작 시 플래그 세팅
            onCompositionStart={() => setIsComposing(true)}
            // 한글 조합이 끝난 시점에만 필터 적용
            onCompositionEnd={e => {
              setIsComposing(false);
              setName(filterHangul(e.currentTarget.value));
            }}
            // 조합 중이 아닐 때만 즉시 필터링
            onChange={e => {
              const val = e.target.value;
              if (isComposing) {
                // 조합 중간 단계: 그대로 반영해줘야 IME 박스가 보입니다
                setName(val);
              } else {
                // 조합이 끝난 상태: 한글 외 문자 제거
                setName(filterHangul(val));
              }
            }}
            className="absolute bg-white text-gray-800"
            style={{
              width: `calc(310px * ${scale})`,
              height: `calc(61px * ${scale})`,
              left: `calc(157px * ${scale})`,
              top: 0,
              borderRadius: `calc(10px * ${scale})`,
              paddingLeft: `calc(16px * ${scale})`,
              paddingRight: `calc(16px * ${scale})`,
              fontSize: `calc(24px * ${scale})`,
              border: 'none',
              outline: 'none'
            }}
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 나이 필드 */}
        <div 
          className="absolute"
          style={{
            left: `calc(131px * ${scale})`,
            top: `calc(130px * ${scale})`
          }}
        >
          <label 
            className="absolute text-white font-black"
            style={{
              width: `calc(87px * ${scale})`,
              height: `calc(60px * ${scale})`,
              fontSize: `calc(50px * ${scale})`,
              lineHeight: `calc(60px * ${scale})`,
              left: 0,
              top: 0
            }}
          >
            나이
          </label>
          <input
            type="number"
            value={age}  // value 속성 추가
            onChange={e => {
            // 입력값 중 숫자만 남기기
            const onlyNums = e.target.value.replace(/\D/g, '');
            setAge(onlyNums === '' ? '' : Number(onlyNums));
            }}
            onKeyDown={e => {
              // 백스페이스·Delete·화살표·Tab은 허용
              if (
                !/[0-9]/.test(e.key) &&
                !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            className="absolute bg-white text-gray-800"
            style={{
              width: `calc(310px * ${scale})`,
              height: `calc(61px * ${scale})`,
              left: `calc(157px * ${scale})`,
              top: 0,
              borderRadius: `calc(10px * ${scale})`,
              paddingLeft: `calc(16px * ${scale})`,
              paddingRight: `calc(16px * ${scale})`,
              fontSize: `calc(24px * ${scale})`,
              border: 'none',
              outline: 'none'
            }}
            placeholder="나이를 입력하세요"
          />
        </div>

        {/* 전화번호 필드 */}
        <div 
          className="absolute"
          style={{
            left: `calc(91px * ${scale})`,
            top: `calc(216px * ${scale})`
          }}
        >
          <label 
            className="absolute text-white font-black"
            style={{
              width: `calc(160px * ${scale})`,
              height: `calc(60px * ${scale})`,
              fontSize: `calc(50px * ${scale})`,
              lineHeight: `calc(60px * ${scale})`,
              left: 0,
              top: 0,
              whiteSpace: 'nowrap'
            }}
          >
            연락처
          </label>
          <input
            type="tel"
            value={phone}                       // value 속성 추가
            onChange={(e) => {
              /* 
              전화번호 포맷팅 함수
              '-'자동 생성
              한국 전화번호 형식에 맞춤춤
              */
              const formatPhoneNumber = (value: string) => {
                const numbersOnly = value.replace(/[^\d]/g, '');
                
                if (numbersOnly.length <= 3) {
                  return numbersOnly;
                } else if (numbersOnly.length <= 7) {
                  if (numbersOnly.startsWith('02')) {
                    return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2)}`;
                  } else {
                    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
                  }
                } else if (numbersOnly.length <= 11) {
                  if (numbersOnly.startsWith('02')) {
                    return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2, 6)}-${numbersOnly.slice(6)}`;
                  } else if (numbersOnly.startsWith('01')) {
                    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`;
                  } else {
                    if (numbersOnly.length === 10) {
                      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 6)}-${numbersOnly.slice(6)}`;
                    } else {
                      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`;
                    }
                  }
                } else {
                  const truncated = numbersOnly.slice(0, 11);
                  if (truncated.startsWith('02')) {
                    return `${truncated.slice(0, 2)}-${truncated.slice(2, 6)}-${truncated.slice(6)}`;
                  } else {
                    return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(7)}`;
                  }
                }
              };
              
              const formattedValue = formatPhoneNumber(e.target.value);
              setPhone(formattedValue);
            }}
            onKeyDown={(e) => {
              // 숫자만 입력 허용 (백스페이스, 방향키 등은 허용)
              if (e.key === 'Backspace' || e.key === 'Delete') return;
              
              if (!/\d/.test(e.key) && 
                  !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="absolute bg-white text-gray-800"
            style={{
              width: `calc(310px * ${scale})`,
              height: `calc(61px * ${scale})`,
              left: `calc(197px * ${scale})`,
              top: 0,
              borderRadius: `calc(10px * ${scale})`,
              paddingLeft: `calc(16px * ${scale})`,
              paddingRight: `calc(16px * ${scale})`,
              fontSize: `calc(24px * ${scale})`,
              border: 'none',
              outline: 'none'
            }}
            placeholder="연락처를 입력하세요"
          />
        </div>
      </div>
      
      <NextButton
        onClick={handleSubmit}
        disabled={loading}
      />
    </div>
  );
};

export default PersonalInfo;