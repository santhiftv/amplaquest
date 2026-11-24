'use client';

type Props = { size?: number; state?: 'idle' | 'celebrate' | 'sad'; className?: string };

export default function Eagle({ size = 160, state = 'idle', className = '' }: Props) {
  return (
    <div className={`mtv mtv--${state} ${className}`} style={{ width: size, height: size * 0.9 }}>
      <svg viewBox="0 0 240 216" width="100%" height="100%" aria-label="Mantovani, a águia do Amplação">
        {/* asa esquerda */}
        <g className="mtv-wingL">
          <path d="M114 108 C74 72 34 66 8 86 C32 92 40 104 46 114 C30 110 20 118 16 130 C44 128 56 132 70 136 C118 152 120 128 114 108Z" fill="#6B4A2B" />
          <path d="M114 108 C80 84 50 82 26 94 C50 100 60 114 72 122 C98 134 120 130 114 108Z" fill="#815A34" />
          <path d="M50 114 l-9 4 M70 123 l-9 5 M90 130 l-8 6" stroke="#55381F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        {/* asa direita (espelhada) */}
        <g className="mtv-wingR" transform="translate(240,0) scale(-1,1)">
          <path d="M114 108 C74 72 34 66 8 86 C32 92 40 104 46 114 C30 110 20 118 16 130 C44 128 56 132 70 136 C118 152 120 128 114 108Z" fill="#6B4A2B" />
          <path d="M114 108 C80 84 50 82 26 94 C50 100 60 114 72 122 C98 134 120 130 114 108Z" fill="#815A34" />
          <path d="M50 114 l-9 4 M70 123 l-9 5 M90 130 l-8 6" stroke="#55381F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>

        {/* cauda branca */}
        <path d="M104 168 L120 204 L136 168 Z" fill="#F3F1E6" />
        <path d="M113 170 L120 200 M127 170 L120 200" stroke="#d8d2c0" strokeWidth="2" />

        {/* garras */}
        <g stroke="#F4A81F" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M110 170 l-2 16" /><path d="M108 186 l-6 3 M108 186 l0 7 M108 186 l6 3" />
          <path d="M130 170 l2 16" /><path d="M132 186 l-6 3 M132 186 l0 7 M132 186 l6 3" />
        </g>

        {/* corpo */}
        <ellipse cx="120" cy="128" rx="40" ry="46" fill="#6B4A2B" />
        <path d="M120 92 C98 92 90 112 90 134 C90 156 104 172 120 172 C136 172 150 156 150 134 C150 112 142 92 120 92Z" fill="#7C5733" />
        <path d="M120 104 q-17 12 -13 38 q13 14 26 0 q4 -26 -13 -38Z" fill="#9A744B" opacity=".55" />

        {/* cabeça branca */}
        <circle cx="120" cy="72" r="37" fill="#FBFBF4" />
        <path d="M120 34 c-17 0 -30 11 -32 26 c11 -7 21 -9 32 -9 c11 0 21 2 32 9 c-2 -15 -15 -26 -32 -26Z" fill="#ffffff" />

        {/* sobrancelhas determinadas */}
        <path d="M97 55 L121 61" stroke="#C99A3E" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M143 55 L119 61" stroke="#C99A3E" strokeWidth="4.5" strokeLinecap="round" />
        {/* olhos */}
        <ellipse cx="108" cy="68" rx="8.5" ry="9.5" fill="#fff" stroke="#e7e2d4" strokeWidth="1" />
        <ellipse cx="132" cy="68" rx="8.5" ry="9.5" fill="#fff" stroke="#e7e2d4" strokeWidth="1" />
        <circle cx="110" cy="69" r="4.2" fill="#241708" />
        <circle cx="130" cy="69" r="4.2" fill="#241708" />
        <circle cx="111.6" cy="67.4" r="1.4" fill="#fff" />
        <circle cx="131.6" cy="67.4" r="1.4" fill="#fff" />
        {/* bico */}
        <path d="M111 76 L129 76 L125 90 Q120 97 115 90 Z" fill="#F6A81F" />
        <path d="M115 90 Q120 97 125 90 L123 95 Q120 100 117 95 Z" fill="#DE8700" />

        {/* brilhos de comemoração */}
        <g className="mtv-sparks" fill="#FBBF24">
          <path className="mtv-spark" d="M30 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" />
          <path className="mtv-spark" style={{ animationDelay: '.25s' }} d="M206 54 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5Z" />
          <path className="mtv-spark" style={{ animationDelay: '.5s' }} d="M196 150 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5Z" fill="#22C55E" />
          <path className="mtv-spark" style={{ animationDelay: '.15s' }} d="M34 150 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5Z" fill="#7C3AED" />
        </g>
      </svg>

      <style>{`
        .mtv{position:relative;display:inline-block;transform-origin:center bottom}
        .mtv .mtv-wingL,.mtv .mtv-wingR{transform-box:fill-box;transform-origin:center}
        .mtv .mtv-wingL{animation:mtvFlapL 2.8s ease-in-out infinite}
        .mtv .mtv-wingR{animation:mtvFlapR 2.8s ease-in-out infinite}
        .mtv--idle{animation:floaty 3.6s ease-in-out infinite}
        .mtv--celebrate{animation:mtvCele .62s ease-in-out infinite}
        .mtv--celebrate .mtv-wingL{animation:mtvFlapL .38s ease-in-out infinite}
        .mtv--celebrate .mtv-wingR{animation:mtvFlapR .38s ease-in-out infinite}
        .mtv--sad{animation:none;transform:rotate(3deg)}
        .mtv--sad .mtv-wingL,.mtv--sad .mtv-wingR{animation:none}
        .mtv-spark{opacity:0}
        .mtv--celebrate .mtv-spark{animation:mtvSpark 1.1s ease-in-out infinite}
        @keyframes mtvFlapL{0%,100%{transform:rotate(0)}50%{transform:rotate(-11deg)}}
        @keyframes mtvFlapR{0%,100%{transform:rotate(0)}50%{transform:rotate(11deg)}}
        @keyframes mtvCele{0%,100%{transform:translateY(0) rotate(-2.5deg) scale(1)}50%{transform:translateY(-14px) rotate(2.5deg) scale(1.04)}}
        @keyframes mtvSpark{0%{opacity:0;transform:scale(.4)}45%{opacity:1;transform:scale(1.15)}100%{opacity:0;transform:scale(.6)}}
      `}</style>
    </div>
  );
}
