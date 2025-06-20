/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 메인 컬러 설정
        primary: {
          light: '#AED581', // 밝은 녹색
          DEFAULT: '#8BC34A', // 기본 녹색
          dark: '#689F38', // 어두운 녹색
        },
        secondary: {
          light: '#FFF59D', // 밝은 노란색
          DEFAULT: '#FFEB3B', // 기본 노란색
          dark: '#FBC02D', // 어두운 노란색
        },
        // 배경색 및 텍스트 색상
        background: {
          light: '#F1F8E9', // 매우 밝은 녹색 배경
          DEFAULT: '#E8F5E9', // 기본 배경
          content: '#FFFFFF', // 콘텐츠 배경
        },
        text: {
          primary: '#2E7D32', // 기본 텍스트 (녹색)
          secondary: '#33691E', // 보조 텍스트
          dark: '#1B5E20', // 어두운 텍스트
          light: '#FFFFFF', // 밝은 배경 위 텍스트
        },
        // 상태 색상
        status: {
          success: '#4CAF50', // 성공
          warning: '#FFC107', // 경고
          danger: '#F44336', // 위험
        },
      },
      fontSize: {
        // 고령층 사용자를 위한 큰 폰트 사이즈 (기존)
        '2xl': '1.75rem',   // 28px
        '3xl': '2rem',      // 32px
        '4xl': '2.5rem',    // 40px
        '5xl': '3rem',      // 48px
        // 반응형 폰트 사이즈 추가
        'responsive-sm': ['calc(0.875rem * var(--scale, 1))', { lineHeight: 'calc(1.25rem * var(--scale, 1))' }],
        'responsive-base': ['calc(1rem * var(--scale, 1))', { lineHeight: 'calc(1.5rem * var(--scale, 1))' }],
        'responsive-lg': ['calc(1.125rem * var(--scale, 1))', { lineHeight: 'calc(1.75rem * var(--scale, 1))' }],
        'responsive-xl': ['calc(1.25rem * var(--scale, 1))', { lineHeight: 'calc(1.75rem * var(--scale, 1))' }],
        'responsive-2xl': ['calc(1.5rem * var(--scale, 1))', { lineHeight: 'calc(2rem * var(--scale, 1))' }],
        'responsive-3xl': ['calc(1.875rem * var(--scale, 1))', { lineHeight: 'calc(2.25rem * var(--scale, 1))' }],
        'responsive-4xl': ['calc(2.25rem * var(--scale, 1))', { lineHeight: 'calc(2.5rem * var(--scale, 1))' }],
        'responsive-5xl': ['calc(3rem * var(--scale, 1))', { lineHeight: '1' }],
        'responsive-6xl': ['calc(3.75rem * var(--scale, 1))', { lineHeight: '1' }],
        'responsive-7xl': ['calc(4.5rem * var(--scale, 1))', { lineHeight: '1' }],
        'responsive-8xl': ['calc(6rem * var(--scale, 1))', { lineHeight: '1' }],
        'responsive-9xl': ['calc(8rem * var(--scale, 1))', { lineHeight: '1' }],
      },
      spacing: {
        // 반응형 spacing
        'responsive-xs': 'calc(0.5rem * var(--scale, 1))',
        'responsive-sm': 'calc(1rem * var(--scale, 1))',
        'responsive-md': 'calc(1.5rem * var(--scale, 1))',
        'responsive-lg': 'calc(2rem * var(--scale, 1))',
        'responsive-xl': 'calc(3rem * var(--scale, 1))',
        'responsive-2xl': 'calc(4rem * var(--scale, 1))',
      },
      borderRadius: {
        // 부드러운 모서리
        'lg': '1rem',       // 16px
        'xl': '1.5rem',     // 24px
      },
      boxShadow: {
        'button': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
        'bounce': 'bounce 1s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
      },
      // 고령층 사용자를 위한 기본 설정
      fontFamily: {
        sans: ['Pretendard',
               '-apple-system',
               'BlinkMacSystemFont',
               'system-ui',
               'Roboto',
               'Helvetica Neue',
               'Arial',
               'sans-serif'
              ],
        },
    },
  },
  plugins: [],
}