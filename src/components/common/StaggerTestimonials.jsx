import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/landing.css';

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "Buildora is our single source of truth across 18 active jobsites. We work 5x faster with complete budget visibility.",
    by: "Rajesh Deshmukh, Project Director at Apex Towers",
    imgSrc: "https://cdn.21st.dev/assets/mirror/f0/f02fed36023656a5b5df6f247c83c96c53bfa9db5b98085cdee93ffc938a5f37.jpg"
  },
  {
    tempId: 1,
    testimonial: "I'm confident our site logs and engineering drawings are safe and audited. I can't say that about other providers.",
    by: "Dan, CTO at SecureNet Construction",
    imgSrc: "https://cdn.21st.dev/assets/mirror/5b/5b5b2f3487692d40f629010ea6448d150907f780d8c262c4ca194b7386115c2d.jpg"
  },
  {
    tempId: 2,
    testimonial: "The 3-way procurement matching and real-time inventory ledger gave our CFO complete peace of mind.",
    by: "Sunita Kulkarni, Chief Engineer at Infrastructure Co.",
    imgSrc: "https://cdn.21st.dev/assets/mirror/10/10e2bfa5446e5c116e269b649b5f5e0106d96643f0a903048f3a056e40c35cd8.jpg"
  },
  {
    tempId: 3,
    testimonial: "Buildora's CPM Gantt and milestone tracking make planning for complex projects seamless. Can't recommend them enough!",
    by: "Marie, CFO at FuturePlanning",
    imgSrc: "https://cdn.21st.dev/assets/mirror/fa/fae47bb0faba45d1e0696b6557ca36c551a738c7d6e3950e82bb69dd2f963a72.jpg"
  },
  {
    tempId: 4,
    testimonial: "If I could give 11 stars for jobsite snag resolution, I'd give 12.",
    by: "Vikram Malhotra, VP Operations at Horizon Infra",
    imgSrc: "https://cdn.21st.dev/assets/mirror/4f/4fb45af36b546e069b72527fdf4d904855a2b11b301fa738c8bc4d235595c4df.jpg"
  },
  {
    tempId: 5,
    testimonial: "SO SO SO HAPPY WE FOUND BUILDORA! I'd bet you've saved our site supervisors 100 hours of paperwork so far.",
    by: "Jeremy, Project Manager at TimeWise Builders",
    imgSrc: "https://cdn.21st.dev/assets/mirror/a4/a4dd47498f54944edb9cd8095fb751847193faac01d922bae494e68d0cf90f4f.jpg"
  },
  {
    tempId: 6,
    testimonial: "Took some convincing for the field engineers, but now that we're on Buildora, we're never going back.",
    by: "Pam, Project Director at BrandBuilders Infra",
    imgSrc: "https://cdn.21st.dev/assets/mirror/b2/b2cd3e4ad761fd9954c265df5f86090c4f17c388c07f78332e75edfd7420f66a.jpg"
  },
  {
    tempId: 7,
    testimonial: "I would be lost without Buildora's in-depth site analytics and cost-to-complete. The ROI is EASILY 100X for us.",
    by: "Daniel, Lead Quantity Surveyor at AnalyticsPro",
    imgSrc: "https://cdn.21st.dev/assets/mirror/9a/9a3f3f88dac2ceb807e98d4cbe99acc9813da6d0ce2859b1cf026747727e1667.jpg"
  },
  {
    tempId: 8,
    testimonial: "It's just the best construction management software. Period.",
    by: "Fernando, Site Architect at UserFirst Studio",
    imgSrc: "https://cdn.21st.dev/assets/mirror/b7/b78f8c42f62ae61f6ebe5c4e79f3af27f49dc05c4f366d2be599d1e14318be86.jpg"
  },
  {
    tempId: 9,
    testimonial: "We switched from legacy paper logs 5 years ago and never looked back.",
    by: "Andy, Civil Engineer at CloudMasters Developers",
    imgSrc: "https://cdn.21st.dev/assets/mirror/45/45482403ecbfd4f326c4388ca63773a1fbe79376213456ae0f422eea1a94d589.jpg"
  },
  {
    tempId: 10,
    testimonial: "I've been searching for a construction solution like Buildora for YEARS. So glad I finally found one!",
    by: "Pete, Contracts Director at RevenueRockets",
    imgSrc: "https://cdn.21st.dev/assets/mirror/42/420c64d5e90b2ff05fc182e3d8c3df40076440cb684d927efed247855775ea9b.jpg"
  },
  {
    tempId: 11,
    testimonial: "It's so simple and intuitive, we got the subcontractors and engineers up to speed in 10 minutes.",
    by: "Marina, Operations Lead at TalentForge",
    imgSrc: "https://cdn.21st.dev/assets/mirror/be/be1b67757a13dfec4386e8627236a7194c6bcfb07502dbd82f727f6ccac46bcd.jpg"
  },
  {
    tempId: 12,
    testimonial: "Buildora's customer support and onboarding team are unparalleled. They're always there when we need them.",
    by: "Olivia, Project Success Manager at ClientCare",
    imgSrc: "https://cdn.21st.dev/assets/mirror/b4/b48ca5758f41e9f512fa264f7fde87a13a6149e94230111e949268b4780279cc.jpg"
  },
  {
    tempId: 13,
    testimonial: "The efficiency gains and waste reduction we've seen since implementing Buildora are off the charts!",
    by: "Raj, Operations Manager at StreamlineSolutions",
    imgSrc: "https://cdn.21st.dev/assets/mirror/84/84811a44ccc64660055b77ed641ae6617edb60314efcdbc945cb91fc27aed815.jpg"
  },
  {
    tempId: 14,
    testimonial: "Buildora has revolutionized how we handle our jobsite materials and PO approvals. It's a game-changer!",
    by: "Lila, Procurement Specialist at ProcessPro",
    imgSrc: "https://cdn.21st.dev/assets/mirror/f9/f99a76bee7ebb41a84ba63d00499ed81588a17e0f1bba07aa22d2c4e4d187a82.jpg"
  },
  {
    tempId: 15,
    testimonial: "The scalability of Buildora is impressive. It grows with our multi-city projects seamlessly.",
    by: "Trevor, Managing Director at GrowthGurus Infra",
    imgSrc: "https://cdn.21st.dev/assets/mirror/67/6734807085015478f70dc12be3669b8127939ec42f17aa6d995fe317d19971cc.jpg"
  },
  {
    tempId: 16,
    testimonial: "I appreciate how Buildora continually innovates with offline mobile reporting and instant sync.",
    by: "Naomi, Technology Lead at FutureTech Construction",
    imgSrc: "https://cdn.21st.dev/assets/mirror/fc/fc2eed941aa10f3a40167ab44dd42877152ec653470854dda5ffb04c048e05e6.jpg"
  },
  {
    tempId: 17,
    testimonial: "The concrete and rebar savings we've seen with Buildora are incredible. It's paid for itself many times over.",
    by: "Victor, Senior Financial Analyst at ProfitPeak",
    imgSrc: "https://cdn.21st.dev/assets/mirror/5e/5ee78465c1b6b6f94dcbf8dccba352fd9f4a3238557b93875887c55c72901927.jpg"
  },
  {
    tempId: 18,
    testimonial: "Buildora's platform is so robust, yet easy to use on both mobile and desktop. It's the perfect balance.",
    by: "Yuki, Field Tech Lead at BalancedTech",
    imgSrc: "https://cdn.21st.dev/assets/mirror/7e/7ee949310d79d96acce5be2c19f2e5b5b6f75e1c26e45a4cc3c38da71f83899c.jpg"
  },
  {
    tempId: 19,
    testimonial: "We've tried many construction ERPs, but Buildora stands out in terms of reliability, speed, and clean UX.",
    by: "Zoe, Operations Director at ReliableSystems",
    imgSrc: "https://cdn.21st.dev/assets/mirror/90/90489abb7c7d9823bf203548ba1ed0ea5060abedcac65390a393c171f241eac7.jpg"
  }
];

const TestimonialCard = ({ position, testimonial, handleMove, cardSize }) => {
  const isCenter = position === 0;
  const absPos = Math.abs(position);

  // Smoothly fade and hide cards that are too far from center
  if (absPos > 3) {
    return null;
  }

  const opacity = isCenter ? 1 : absPos === 1 ? 0.82 : absPos === 2 ? 0.45 : 0.15;
  const scale = isCenter ? 1 : absPos === 1 ? 0.92 : absPos === 2 ? 0.82 : 0.72;
  const zIndex = isCenter ? 20 : 15 - absPos * 3;

  return (
    <div
      onClick={() => handleMove(position)}
      className={`stagger-testimonial-card ${isCenter ? 'is-center' : 'is-side'}`}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(45px 0%, calc(100% - 45px) 0%, 100% 45px, 100% 100%, calc(100% - 45px) 100%, 45px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize * 0.68) * position}px)
          translateY(${isCenter ? -30 : position % 2 ? 16 : -16}px)
          scale(${scale})
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        opacity,
        zIndex,
        boxShadow: isCenter
          ? '0px 12px 28px rgba(15, 29, 46, 0.6)'
          : '0px 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      <span
        className="stagger-card-corner-line"
        style={{
          right: -2,
          top: 44,
          width: SQRT_5000,
          height: 2
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={testimonial.by.split(',')[0]}
        className="stagger-card-avatar"
      />
      <h3 className="stagger-card-quote">
        "{testimonial.testimonial}"
      </h3>
      <p className="stagger-card-author">
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials = () => {
  const [cardSize, setCardSize] = useState(360);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)');
      setCardSize(matches ? 360 : 280);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="stagger-testimonials-container">
      <div className="stagger-testimonials-stage">
        {testimonialsList.map((testimonial, index) => {
          const position = testimonialsList.length % 2
            ? index - (testimonialsList.length + 1) / 2
            : index - testimonialsList.length / 2;
          return (
            <TestimonialCard
              key={testimonial.tempId}
              testimonial={testimonial}
              handleMove={handleMove}
              position={position}
              cardSize={cardSize}
            />
          );
        })}
      </div>

      <div className="stagger-testimonials-nav">
        <button
          onClick={() => handleMove(-1)}
          className="stagger-nav-btn"
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="stagger-nav-btn"
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default StaggerTestimonials;
