// src/pages/scenarioSelect/ScenarioItem.tsx
import { useNavigate } from 'react-router-dom';
import EnhancedOptimizedImage from '../../components/ui/ReliableImage';

interface ScenarioProps {
    scenario: {
        id: number;
        title: string;
        subtitle: string;
        locked: boolean;
    };
    isCurrentSelection: boolean;
}

// 이미지 매핑
const imageMap: Record<number, string> = {
    1: '/assets/images/scenario1.png',
    2: '/assets/images/scenario2.png',
    3: '/assets/images/scenario3.png',
};

const ScenarioItem = ({ scenario, isCurrentSelection }: ScenarioProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (scenario.locked) {
            return;
        }
        
        setTimeout(() => {
            navigate(`/character-select?scenario=${scenario.id}`);
        }, 800);
    };

    return (
        <div className="flex flex-col items-center">
            <div 
                className={`relative w-64 h-48 overflow-hidden rounded-lg 
                    ${isCurrentSelection 
                        ? 'border-4 border-green-600' 
                        : 'border-2 border-gray-400'
                    }
                    ${scenario.locked ? 'grayscale' : ''}
                    transition-all duration-300
                `}
                onClick={handleClick}
            >
                <img
                    src={imageMap[scenario.id]}
                    alt={scenario.title}
                    className="w-full h-full object-cover cursor-pointer relative z-10"
                />
                
                {/* 잠금 표시 - z-index를 명시적으로 설정 */}
                {scenario.locked && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-20 w-20 text-white z-30" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                            />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScenarioItem;