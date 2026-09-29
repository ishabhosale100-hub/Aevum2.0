import React, { useState } from 'react';

// --- FASTKIT JSON-CONFIGURED STATE MACHINE DEFINITION ---
const fastkitConfig = {
  entry: {
    question: "What's happening right now?",
    options: [
      { label: 'A) "A photo of me is being shared without consent"', next: 'branch_a' },
      { label: 'B) "I think a photo of mine has been morphed"', next: 'branch_b' },
      { label: 'C) "I want to protect a photo before anything happens"', next: 'branch_c' },
      { label: 'D) "Someone is threatening/blackmailing me using a photo"', next: 'branch_d' }
    ]
  },
  branch_a: {
    question: "Is it still actively being shared right now?",
    options: [
      { label: "Yes", next: 'output_a_yes' },
      { label: "No, one-time", next: 'output_a_no' }
    ]
  },
  branch_b: {
    question: "Do you have the original, unedited photo saved?",
    options: [
      { label: "Yes", next: 'output_b_yes' },
      { label: "No", next: 'output_b_no' }
    ]
  },
  branch_c: {
    output: {
      title: "Preemptive Protection",
      steps: ["Good move. Head to AEGIS to apply protection to your photo before sharing it."],
      urgent: false,
      isRedirect: true
    }
  },
  branch_d: {
    question: "Have you told a trusted adult yet?",
    options: [
      { label: "Not yet", next: 'output_d_not_yet' },
      { label: "Yes, already told someone", next: 'output_d_yes' }
    ]
  },
  output_a_yes: {
    output: {
      title: "Don't delete anything — it's evidence",
      steps: [
        "Screenshot the post, note the platform, URL, and time",
        "Do not engage with or reply to the sharer",
        "Open LEGAL to log this as evidence",
        "Tell a trusted adult — we'll help you word it."
      ],
      urgent: false,
      requiresAdultSelection: true
    }
  },
  output_a_no: {
    output: {
      title: "Good — now let's check and document it",
      steps: [
        "Use ORIGIN if you have the original photo to compare",
        "Open LEGAL to log what happened, even after the fact",
        "Consider telling a trusted adult."
      ],
      urgent: false
    }
  },
  output_b_yes: {
    output: {
      title: "Let's confirm it with ORIGIN",
      steps: [
        "Open ORIGIN and upload both the original and suspected photo",
        "Review the flagged regions",
        "Attach the result to a LEGAL report."
      ],
      urgent: false
    }
  },
  output_b_no: {
    output: {
      title: "That's okay — here's what to do",
      steps: [
        "Check gallery backups or ask whoever may have the original",
        "You can still open LEGAL and describe what happened",
        "A confirmed original isn't required to report."
      ],
      urgent: false
    }
  },
  output_d_not_yet: {
    output: {
      title: "This is extortion — a serious crime, and it's not your fault",
      steps: [
        "Do not pay or comply with any demand",
        "Save every message as evidence — don't delete",
        "Call the Cyber Helpline: 1930",
        "Open LEGAL — this will be pre-filled as a blackmail case."
      ],
      urgent: true,
      requiresAdultSelection: true
    }
  },
  output_d_yes: {
    output: {
      title: "Good — you're not doing this alone",
      steps: [
        "Open LEGAL to formally log the incident",
        "Keep saving any further messages as evidence",
        "The Cyber Helpline (1930) can guide next legal steps."
      ],
      urgent: true
    }
  }
};

// Generational Lens Scripts & Tips Database
const adultOptionsData = [
  {
    label: "A grandparent/older relative",
    tip: "They may not know a photo can even be faked, start there gently.",
    script: "Something happened with a photo of me online — someone changed it to look real, using a computer program. I need your help, not because I did something wrong, but because someone else did."
  },
  {
    label: "A parent",
    tip: "They likely know fake photos exist but may not know how accessible the tools are, be direct.",
    script: "Someone morphed/edited a photo of me and shared it without my permission. This is a crime, and I want to report it, I need you with me."
  },
  {
    label: "A sibling or friend closer to your age",
    tip: "They'll understand the tech fastest but may underestimate the seriousness, push past 'it's not a big deal.'",
    script: "This isn't a prank-app thing, someone actually used it to hurt me. I need to tell my family, can you help me figure out how?"
  }
];

// Generational Context Cards Data (Evolution of Mobile Usage & AI Risks)
const generationalCardsData = [
  {
    id: "01",
    title: "Pre-AI / Manual Era",
    tag: "Low Velocity",
    description: "Traditional image misuse relied on basic manual cropping or physical sharing, keeping distribution constrained and slow."
  },
  {
    id: "02",
    title: "Early Social Spread",
    tag: "Moderate Reach",
    description: "The rise of smartphones and messaging networks allowed photos to travel quickly across localized groups and forums."
  },
  {
    id: "03",
    title: "Modern GenAI Era",
    tag: "High Automation",
    description: "Automated AI tools enable rapid face-swapping and synthetic manipulation using minimal reference data."
  },
  {
    id: "04",
    title: "Mobile & Real-Time Scale",
    tag: "Instant Threat",
    description: "Ubiquitous mobile access combined with decentralized sharing networks necessitates real-time cryptographic defense and rapid reporting."
  }
];

// --- REACT COMPONENT ---
export default function FastKit() {
  const [currentState, setCurrentState] = useState('entry');
  const [selectedAdultChoice, setSelectedAdultChoice] = useState(null);

  const stateData = fastkitConfig[currentState];

  const handleOptionClick = (nextState) => {
    setCurrentState(nextState);
    setSelectedAdultChoice(null); // Reset lens selection on step change
  };

  const handleReset = () => {
    setCurrentState('entry');
    setSelectedAdultChoice(null);
  };

  return (
    <div style={styles.container}>
      {/* Header / Title */}
      <div style={styles.header}>
        <h2 style={styles.title}>FASTKIT Decision Hub</h2>
        <p style={styles.subtitle}>Confidential, structured next steps for your safety.</p>
      </div>

      {/* 4 Generational / Impact Context Cards */}
      <div style={styles.genGrid}>
        {generationalCardsData.map((card) => (
          <div key={card.id} style={styles.genCard}>
            <div style={styles.genCardHeader}>
              <span style={styles.genCardId}>{card.id}</span>
              <span style={styles.genCardTag}>{card.tag}</span>
            </div>
            <h4 style={styles.genCardTitle}>{card.title}</h4>
            <p style={styles.genCardDesc}>{card.description}</p>
          </div>
        ))}
      </div>

      {/* Main Card View (Interactive Decision Engine) */}
      <div style={{
        ...styles.card,
        borderColor: stateData?.output?.urgent ? '#ff4d4d' : 'rgba(0, 243, 255, 0.3)'
      }}>
        {stateData?.output?.urgent && (
          <div style={styles.urgentBadge}>⚠️ URGENT PRIORITY PROTOCOL</div>
        )}

        {/* Render Question Branch */}
        {stateData.question && (
          <div>
            <h3 style={styles.questionText}>{stateData.question}</h3>
            <div style={styles.optionsContainer}>
              {stateData.options.map((opt, idx) => (
                <button
                  key={idx}
                  style={styles.optionButton}
                  onClick={() => handleOptionClick(opt.next)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Output Branch */}
        {stateData.output && (
          <div>
            <h3 style={{
              ...styles.outputTitle,
              color: stateData.output.urgent ? '#ff6b6b' : '#00f3ff'
            }}>
              {stateData.output.title}
            </h3>

            <ol style={styles.stepsList}>
              {stateData.output.steps.map((step, idx) => {
                const isTrustedAdultStep = step.toLowerCase().includes("tell a trusted adult");
                return (
                  <li key={idx} style={styles.stepItem}>
                    <span>{step}</span>

                    {/* Generational-lens Nested Layer */}
                    {isTrustedAdultStep && stateData.output.requiresAdultSelection && (
                      <div style={styles.lensBox}>
                        <p style={styles.lensPrompt}>Who do you want to tell first?</p>
                        <div style={styles.lensButtons}>
                          {adultOptionsData.map((adult, aIdx) => (
                            <button
                              key={aIdx}
                              style={{
                                ...styles.lensButton,
                                background: selectedAdultChoice?.label === adult.label ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255,255,255,0.05)'
                              }}
                              onClick={() => setSelectedAdultChoice(adult)}
                            >
                              {adult.label}
                            </button>
                          ))}
                        </div>

                        {selectedAdultChoice && (
                          <div style={styles.scriptCard}>
                            <p style={styles.tipText}>💡 <strong>Tip:</strong> {selectedAdultChoice.tip}</p>
                            <p style={styles.scriptLabel}>Ready-to-use script:</p>
                            <blockquote style={styles.scriptBox}>
                              "{selectedAdultChoice.script}"
                            </blockquote>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            {/* Start Over Button */}
            <button style={styles.resetButton} onClick={handleReset}>
              🔄 Start Over
            </button>
          </div>
        )}
      </div>

      {/* Universal Safety Banner / Crisis Support (Always Visible) */}
      <div style={styles.crisisBanner}>
        <p style={styles.crisisText}>
          🛡️ <strong>Need immediate help?</strong> Call the National Cyber Crime Helpline at <strong>1930</strong> or child/youth support lines anytime. You are not alone.
        </p>
      </div>
    </div>
  );
}

// --- STYLES (Futuristic Dark Theme, Glassmorphism, Neon Cyan/Purple Accents) ---
const styles = {
  container: {
    maxWidth: '750px',
    margin: '40px auto',
    padding: '24px',
    background: '#0a0b10',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00f3ff, #b537f2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  genGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  },
  genCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  genCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  genCardId: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#00f3ff',
    fontWeight: '700'
  },
  genCardTag: {
    fontSize: '9px',
    textTransform: 'uppercase',
    background: 'rgba(181, 55, 242, 0.1)',
    color: '#d8b4fe',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.5px'
  },
  genCardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '4px'
  },
  genCardDesc: {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.4'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'all 0.3s ease'
  },
  urgentBadge: {
    display: 'inline-block',
    background: 'rgba(255, 77, 77, 0.15)',
    color: '#ff4d4d',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '16px',
    letterSpacing: '0.5px'
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '20px'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionButton: {
    background: 'rgba(0, 243, 255, 0.05)',
    border: '1px solid rgba(0, 243, 255, 0.2)',
    color: '#00f3ff',
    padding: '14px 18px',
    textAlign: 'left',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  outputTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  stepsList: {
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontSize: '15px',
    lineHeight: '1.5'
  },
  stepItem: {
    color: '#cbd5e1'
  },
  lensBox: {
    marginTop: '12px',
    padding: '14px',
    background: 'rgba(181, 55, 242, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(181, 55, 242, 0.2)'
  },
  lensPrompt: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#d8b4fe',
    marginBottom: '8px'
  },
  lensButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '10px'
  },
  lensButton: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  scriptCard: {
    marginTop: '10px',
    padding: '10px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '6px',
    borderLeft: '3px solid #b537f2'
  },
  tipText: {
    fontSize: '13px',
    color: '#e2e8f0',
    marginBottom: '6px'
  },
  scriptLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '4px'
  },
  scriptBox: {
    margin: '0',
    fontStyle: 'italic',
    fontSize: '13px',
    color: '#f1f5f9'
  },
  resetButton: {
    marginTop: '24px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  crisisBanner: {
    marginTop: '20px',
    padding: '12px 16px',
    background: 'rgba(0, 243, 255, 0.03)',
    border: '1px dashed rgba(0, 243, 255, 0.3)',
    borderRadius: '8px',
    textAlign: 'center'
  },
  crisisText: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0
  }
};