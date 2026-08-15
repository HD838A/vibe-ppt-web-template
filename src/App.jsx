import { useEffect, useState } from 'react'
import { deck } from './content.js'
import { resolveThemeId, themes } from './themes.js'
import './deck.css'

function Footer({ index, total, theme }) {
  return (
    <div className={`slide-foot ${theme === 'dark' ? 'slide-foot--dark' : ''}`}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <span className="slide-foot__sep" />
      <span>{String(total).padStart(2, '0')}</span>
    </div>
  )
}

function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>
}

const ratioMap = { '1:1': '1 / 1', '4:3': '4 / 3', '3:4': '3 / 4', '16:9': '16 / 9', '9:16': '9 / 16' }

function getMediaStyle(slide, media = slide, defaultFit = 'cover') {
  return {
    '--slide-image-ratio': ratioMap[media.imageRatio || slide.imageRatio] || 'auto',
    '--slide-image-fit': media.imageFit || slide.imageFit || defaultFit,
    '--slide-image-position': media.imagePosition || slide.imagePosition || 'center',
  }
}

function SlideSurface({ slide, className, children }) {
  const layout = slide.layout || 'auto'
  return (
    <section className={`slide ${className} layout--${layout} ${slide.backgroundImage ? 'slide--has-background' : ''}`} data-layout={layout}>
      {slide.backgroundImage ? (
        <img
          className="slide-background"
          src={slide.backgroundImage}
          alt=""
          aria-hidden="true"
          style={{ objectPosition: slide.backgroundPosition || slide.imagePosition || 'center' }}
        />
      ) : null}
      {children}
    </section>
  )
}

function CoverSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--cover">
      <div className="cover-grid" />
      <div className="cover-orb cover-orb--a" />
      <div className="cover-orb cover-orb--b" />
      <div className="cover-inner">
        <Eyebrow>{slide.eyebrow}</Eyebrow>
        <h1>{slide.titleLines.map((line) => <span key={line}>{line}</span>)}</h1>
        <p className="cover-subtitle">{slide.subtitle}</p>
      </div>
    </SlideSurface>
  )
}

function ProfileSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--profile">
      <div className="profile-copy">
        <Eyebrow>{slide.eyebrow}</Eyebrow>
        <h2>{slide.title}</h2>
        <p className="prose prose--muted">{slide.lead}</p>
        <div className="fact-list">
          {slide.facts.map((fact) => (
            <div className="fact" key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="profile-visual">
        <img src={slide.image} alt="占位图片" style={getMediaStyle(slide)} />
      </div>
    </SlideSurface>
  )
}

function GallerySlide({ slide, selected, onSelect }) {
  const selectedItem = slide.items[selected] ?? slide.items[0]
  return (
    <SlideSurface slide={slide} className="slide--gallery">
      <div className="gallery-copy">
        <Eyebrow>{slide.eyebrow}</Eyebrow>
        <h2>{slide.title}</h2>
        <p className="prose prose--muted">{slide.lead}</p>
        <div className="gallery-list">
          {slide.items.map((item, itemIndex) => (
            <button
              className={`gallery-item ${selected === itemIndex ? 'gallery-item--active' : ''}`}
              key={item.title}
              onClick={() => onSelect(itemIndex)}
            >
              <span>{String(itemIndex + 1).padStart(2, '0')}</span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="gallery-visual">
        <img src={selectedItem.image} alt="项目占位图片" style={getMediaStyle(slide, selectedItem, 'contain')} />
      </div>
    </SlideSurface>
  )
}

function ChapterSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--chapter">
      <div className="chapter-glow" />
      <span className="chapter-index">{slide.index}</span>
      <Eyebrow>{slide.overline}</Eyebrow>
      <h2>{slide.title}</h2>
      <p>{slide.subtitle}</p>
    </SlideSurface>
  )
}

function PipelineSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--pipeline">
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <h2>{slide.title}</h2>
      <p className="prose prose--muted">{slide.lead}</p>
      <div className="pipeline">
        {slide.steps.map((step, index) => (
          <div className={`pipeline-step ${index === slide.steps.length - 1 ? 'pipeline-step--final' : ''}`} key={step.label}>
            <span>{step.label}</span>
            <strong>{step.title}</strong>
            <small>{step.description}</small>
          </div>
        ))}
      </div>
      <p className="callout">{slide.note}</p>
    </SlideSurface>
  )
}

function StatSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--stat">
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <h2>{slide.title}</h2>
      <div className="stat-number">{slide.value}<span>{slide.suffix}</span></div>
      <p>{slide.caption}</p>
    </SlideSurface>
  )
}

function FlowSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--flow">
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <h2>{slide.title}</h2>
      <div className="flow-layout">
        <div>
          <p className="flow-pain">{slide.pain}</p>
          <p className="flow-punch">{slide.punch}</p>
        </div>
        <div className="flow-loop">
          {slide.loop.map((step, index) => (
            <div className="flow-step" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </div>
    </SlideSurface>
  )
}

function RoadmapSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--roadmap">
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <h2>{slide.title}</h2>
      <div className="roadmap">
        {slide.steps.map((step) => (
          <article key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
      <div className="roadmap-callout">{slide.callout}</div>
    </SlideSurface>
  )
}

function ReviewsSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--reviews">
      <div className="reviews-side">
        <Eyebrow>{slide.eyebrow}</Eyebrow>
        <h2>{slide.title}</h2>
        <p>{slide.description}</p>
        <div className="reviews-stats">
          {slide.stats.map((stat) => <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}
        </div>
        <img className="qr" src={slide.qr} alt="二维码占位" />
      </div>
      <div className="review-wall">
        {slide.reviews.map((review) => (
          <article key={review.name}>
            <img src={review.avatar} alt="头像占位" />
            <div><span>{review.name}</span><p>{review.text}</p></div>
          </article>
        ))}
      </div>
    </SlideSurface>
  )
}

function SkillsSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--skills">
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <h2>{slide.title}</h2>
      <div className="skills-grid">
        {slide.items.map((item) => (
          <article key={item.level}>
            <span>{item.level}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </SlideSurface>
  )
}

function ClosingSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--closing">
      <Eyebrow>{slide.eyebrow}</Eyebrow>
      <div className="closing-grid">
        {slide.statements.map((statement) => (
          <article key={statement.number}>
            <span>{statement.number}</span>
            <h2>{statement.title}</h2>
            <p>{statement.body}</p>
          </article>
        ))}
      </div>
    </SlideSurface>
  )
}

function OutroSlide({ slide }) {
  return (
    <SlideSurface slide={slide} className="slide--outro">
      <div className="outro-copy">
        <Eyebrow>{slide.eyebrow}</Eyebrow>
        <p>{slide.body}</p>
        <h2>{slide.title}</h2>
        <strong>{slide.account}</strong>
      </div>
      <div className="outro-visual"><img src={slide.image} alt="封面占位图片" style={getMediaStyle(slide)} /></div>
    </SlideSurface>
  )
}

function renderSlide(slide, context) {
  switch (slide.type) {
    case 'cover': return <CoverSlide slide={slide} />
    case 'profile': return <ProfileSlide slide={slide} />
    case 'gallery': return <GallerySlide slide={slide} {...context} />
    case 'chapter': return <ChapterSlide slide={slide} />
    case 'pipeline': return <PipelineSlide slide={slide} />
    case 'stat': return <StatSlide slide={slide} />
    case 'flow': return <FlowSlide slide={slide} />
    case 'roadmap': return <RoadmapSlide slide={slide} />
    case 'reviews': return <ReviewsSlide slide={slide} />
    case 'skills': return <SkillsSlide slide={slide} />
    case 'closing': return <ClosingSlide slide={slide} />
    case 'outro': return <OutroSlide slide={slide} />
    default: return <section className="slide slide--unknown"><h2>未识别的版式：{slide.type}</h2></section>
  }
}

export default function App() {
  const [presentation, setPresentation] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedProject, setSelectedProject] = useState(0)
  const themeId = resolveThemeId(deck.theme)
  const theme = themes[themeId]

  const goTo = (index) => setActiveIndex(Math.max(0, Math.min(deck.slides.length - 1, index)))
  const enterPresentation = () => {
    setPresentation(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
  const exitPresentation = () => {
    setPresentation(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    document.body.classList.toggle('present', presentation)
    return () => document.body.classList.remove('present')
  }, [presentation])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!presentation) return
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); goTo(activeIndex + 1) }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); goTo(activeIndex - 1) }
      if (event.key === 'Home') { event.preventDefault(); goTo(0) }
      if (event.key === 'End') { event.preventDefault(); goTo(deck.slides.length - 1) }
      if (event.key === 'Escape') exitPresentation()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, presentation])

  return (
    <main className={`app-shell ${presentation ? 'app-shell--present' : ''}`} data-theme={themeId} style={theme.vars}>
      <div className="toolbar">
        {presentation && <span className="toolbar-count">{activeIndex + 1} / {deck.slides.length}</span>}
        <button onClick={presentation ? exitPresentation : enterPresentation}>{presentation ? '退出演讲模式' : '⛶ 演讲模式'}</button>
      </div>
      <div className="deck">
        {deck.slides.map((slide, index) => (
          <div className={`slide-frame slide-frame--${slide.theme} ${presentation && index !== activeIndex ? 'slide-frame--hidden' : ''}`} key={slide.id}>
            {renderSlide(slide, { selected: selectedProject, onSelect: setSelectedProject })}
            <Footer index={index} total={deck.slides.length} theme={slide.theme} />
          </div>
        ))}
      </div>
      {!presentation && <p className="scroll-hint">滚动浏览 · 点击“演讲模式”后使用 ← → 翻页</p>}
    </main>
  )
}
