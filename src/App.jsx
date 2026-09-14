import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import designerPortrait from './assets/image.png'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const image = (name) => `/portfolio/${name}.jpeg`
const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
}

// These projects are displayed in the featured and gallery sections.
const projects = [
  { title: 'Contemporary Kitchen', category: 'Modular kitchen / sage green', image: image('kitchenGreenWide') },
  { title: 'Sage Green Kitchen Detail', category: 'Modular kitchen / sage green', image: image('kitchenGreenTall') },
  { title: 'Warm Modern Kitchen', category: 'Modular kitchen / walnut', image: image('kitchenWood') },
  { title: 'Soft Beige Kitchen', category: 'Modular kitchen / beige', image: image('kitchenBeige') },
  { title: 'Graphite Kitchen', category: 'Modular kitchen / grey', image: image('kitchenGray') },
  { title: 'Modern White Kitchen', category: 'Modular kitchen / white', image: image('kitchenModern') },
  { title: 'Island Kitchen', category: 'Modular kitchen / island', image: image('kitchenWhiteIsland') },
  { title: 'White and Wood Kitchen', category: 'Modular kitchen / two-tone', image: image('kitchenWhiteWood') },
  { title: 'Quiet Bedroom', category: 'Bedroom / glass partition', image: image('bedroomGlass') },
  { title: 'Warm Beige Bedroom', category: 'Bedroom / modern classic', image: image('bedroomBeige1') },
  { title: 'Bedroom Lounge', category: 'Bedroom / soft neutrals', image: image('bedroomBeige2') },
  { title: 'Cream Bedroom', category: 'Bedroom / calm minimal', image: image('bedroomCream') },
  { title: 'Bedroom Wardrobe', category: 'Bedroom / storage detail', image: image('bedroomWardrobe') },
  { title: 'Gold Accent Living', category: 'Living room / TV unit', image: image('tvUnitGold') },
]

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [formStatus, setFormStatus] = useState('')
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const pageRef = useRef(null)
  const lenisRef = useRef(null)
  const whatsappNumber = '919131080455'
  const createWhatsappUrl = (details = {}) => {
    const { name = '', email = '', phone = '', message = '' } = details
    const whatsappMessage = [
      'Hi Amin! I would like to discuss my interior design project.',
      '',
      `Name: ${name || 'Not provided'}`,
      `Email: ${email || 'Not provided'}`,
      `Phone: ${phone || 'Not provided'}`,
      '',
      'Project details:',
      message || 'I would love to share more about my project.',
    ].join('\n')
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
  }
  const whatsappUrl = createWhatsappUrl()

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: true })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    const preloaderTimeline = gsap.timeline({ delay: 0.1, onComplete: () => setIsLoading(false) })
    preloaderTimeline.to('.preloader-bar-fill', { width: '100%', duration: 1.05, ease: 'power2.inOut' })
    preloaderTimeline.to('.preloader', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '>-0.05')

    const ctx = gsap.context(() => {
      gsap.from('.site-header', { y: -24, opacity: 0, duration: 0.8, ease: 'power3.out' })
      gsap.from('.hero-content > *', { y: 36, opacity: 0, duration: 1, stagger: 0.1, delay: 0.15, ease: 'power3.out' })
      gsap.from('.hero-image', { scale: 1.08, opacity: 0, duration: 1.4, delay: 0.1, ease: 'power3.out' })
      gsap.utils.toArray('.reveal').forEach((element) => gsap.from(element, { y: 48, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 84%', once: true } }))
      gsap.utils.toArray('.parallax-image').forEach((imageElement) => gsap.to(imageElement, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: imageElement, start: 'top bottom', end: 'bottom top', scrub: 1 } }))
      gsap.utils.toArray('.approach-visual img').forEach((imageElement) => gsap.fromTo(imageElement, { clipPath: 'inset(12% 0 12% 0)', scale: 1.12 }, { clipPath: 'inset(0% 0 0% 0)', scale: 1.03, ease: 'none', scrollTrigger: { trigger: imageElement, start: 'top 88%', end: 'top 30%', scrub: 1 } }))
      gsap.to('.scroll-cue svg', { y: 7, repeat: -1, yoyo: true, duration: 1.2, ease: 'sine.inOut' })
    }, pageRef)
    return () => {
      ctx.revert()
      preloaderTimeline.kill()
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    // Keep the page locked while the image preview is open and support Escape to close it.
    const closeOnEscape = (event) => event.key === 'Escape' && setActiveImage(null)
    window.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = activeImage ? 'hidden' : ''
    if (activeImage) lenisRef.current?.stop()
    else lenisRef.current?.start()
    return () => { window.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = '' }
  }, [activeImage])

  const scrollTo = (id) => { setMenuOpen(false); lenisRef.current?.scrollTo(id, { offset: -20, duration: 1.4 }) }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormStatus('Sending...')
    setSubmissionSucceeded(false)
    const formElement = event.currentTarget
    const enquiryDetails = Object.fromEntries(new FormData(formElement).entries())
    const fallbackWhatsappUrl = createWhatsappUrl(enquiryDetails)

    try {
      if (!Object.values(emailjsConfig).every(Boolean)) throw new Error('EmailJS is not configured.')
      await emailjs.sendForm(emailjsConfig.serviceId, emailjsConfig.templateId, formElement, emailjsConfig.publicKey)
      setFormStatus('Your enquiry has been sent.')
      setSubmissionSucceeded(true)
      formElement.reset()
      window.setTimeout(() => { window.location.href = whatsappUrl }, 700)
    } catch {
      setFormStatus('Email delivery failed. Opening WhatsApp with your enquiry...')
      window.setTimeout(() => { window.location.href = fallbackWhatsappUrl }, 300)
    }
  }

  return (
    <main ref={pageRef}>
      <div className={`preloader ${isLoading ? 'is-visible' : 'is-hidden'}`} aria-hidden={!isLoading}>
        <div className="preloader-mark">A · K</div>
        <div className="preloader-bar"><span className="preloader-bar-fill" /></div>
      </div>
      <header className="site-header"><button className="wordmark" onClick={() => scrollTo('#top')} aria-label="Back to top">AK</button><nav className={menuOpen ? 'nav-open' : ''}><button onClick={() => scrollTo('#about')}>About</button><button onClick={() => scrollTo('#approach')}>Approach</button><button onClick={() => scrollTo('#work')}>Work</button><button onClick={() => scrollTo('#contact')}>Contact</button></nav><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></header>
      <section id="top" className="hero source-hero"><div className="hero-media"><img className="hero-image" src={image('hero')} alt="Modern living and dining interior" /><div className="hero-scrim" /></div><div className="hero-content"><p className="eyebrow hero-eyebrow">Interior Design Studio - Bhopal</p><h1>Spaces that<br /><em>feel like you.</em></h1><div className="hero-bottom"><p className="hero-intro">A portfolio of residential interiors by <b>Amin Khan</b> - modular kitchens, bedrooms and full-home design, planned with precision and finished with warmth.</p><button className="scroll-cue" onClick={() => scrollTo('#about')}>Scroll <ArrowDown size={15} /></button></div></div></section>
      <section id="about" className="source-section about-source reveal"><div className="source-wrap"><div className="section-heading"><p className="eyebrow">Meet the designer</p><span className="section-index">01</span><h2>Hello, I&apos;m <em>Amin Khan</em></h2></div><div className="about-grid"><div className="about-portrait image-trigger" role="button" tabIndex="0" onClick={() => setActiveImage({ title: 'Amin Khan', image: designerPortrait })}><img src={designerPortrait} alt="Amin Khan in a warm interior setting" /></div><div className="about-text"><p>I am a passionate and creative interior designer dedicated to transforming spaces into functional, aesthetic, and personalized environments. With a strong eye for detail and a modern design approach, I specialize in creating interiors that reflect both style and comfort.</p><p>I enjoy working closely with clients to understand their vision and bring it to life through thoughtful planning, innovative concepts, and practical solutions.</p><div className="about-facts"><span><b>Location</b>Bhopal, Madhya Pradesh</span><span><b>Email</b>aaminkhan14052005@gmail.com</span><span><b>Phone</b>+91 91310 80455</span></div></div></div><div className="info-cols"><div><h3>Education</h3><b>Bachelor of Commerce</b><span>The Bhopal School of Social Science</span><span>2023 - 2026</span></div><div><h3>Experience</h3><b>Senior Designer, Aviral Housing Solutions</b><span>Nov 2025 - Present</span><b>Intern Designer, Aviral Housing Solutions</b><span>Jun 2025 - Nov 2025</span><b>Designer, CAD-X Bhopal</b><span>2024 - 2025</span></div><div><h3>Skills &amp; Language</h3><div className="pills">{['AutoCAD', 'SketchUp', '3ds Max', 'V-Ray', 'Enscape', 'MS Office', 'Canva'].map((skill) => <span key={skill}>{skill}</span>)}</div><span>English / Hindi</span></div></div></div></section>
      <section id="approach" className="approach-source reveal"><div className="source-wrap approach-layout"><div className="approach-copy-block"><p className="eyebrow">My design approach</p><p className="approach-copy">Every space should <b>tell a story</b> while serving the people who live in it - I combine modern design principles with practical solutions, so each project reflects both <b>beauty and usability.</b></p><div className="approach-foot"><p>Attention to detail and thoughtful planning are at the core of my process, from the first sketch to the final walkthrough.</p><button className="light-button" onClick={() => scrollTo('#work')}>View the work <ArrowUpRight size={16} /></button></div></div><div className="approach-visual"><img src={image('flatlay')} alt="Interior design materials and styling inspiration" /><div className="approach-visual-label"><span>Design philosophy</span><strong>Warm, functional, refined</strong></div></div></div></section>
      <section className="source-section capabilities reveal"><div className="source-wrap"><div className="section-heading"><p className="eyebrow">Capabilities</p><span className="section-index">02</span><h2>What I <em>do</em></h2></div><div className="cap-grid"><ul>{['Space planning and furniture layout', 'Concept and mood boards', 'Colour, material, lighting and furniture selection', 'Residential and commercial interiors', '2D drawings and 3D visualisations', 'Client discussions and requirement mapping', 'Site visits and contractor coordination', 'Styling with decor and accessories'].map((item, index) => <li key={item} tabIndex="0"><span className="cap-number">0{index + 1}</span>{item}<ArrowUpRight className="cap-arrow" size={16} /></li>)}</ul><div className="skillcards"><article tabIndex="0"><span>01</span><h3>2D Planning</h3><p>AutoCAD for space planning, layouts and furniture drawings - precise dimensions built for on-site execution.</p><ArrowUpRight className="skill-arrow" size={20} /></article><article tabIndex="0"><span>02</span><h3>3D Visualisation</h3><p>SketchUp, 3ds Max, V-Ray and Enscape bring every layout to life before a single wall is touched.</p><ArrowUpRight className="skill-arrow" size={20} /></article></div></div></div></section>
      <section id="featured" className="featured-source reveal"><div className="source-wrap"><div className="section-heading"><p className="eyebrow">Featured work</p><span className="section-index">03</span><h2>Designed for <em>living.</em></h2></div><article className="featured-project"><div className="featured-copy"><p className="project-label">Project 01</p><h3>Modular Residential Kitchen</h3><div className="featured-meta"><span><b>Type</b>Residential Kitchen</span><span><b>Style</b>Modular Kitchen</span></div><p>An L-shaped modular kitchen designed for storage efficiency and smooth workflow - hob, sink, refrigerator, shutters, drawers, blind corners and open shelves arranged systematically. Multiple elevations and plan views guided accurate execution, while glass shutters and open shelving add visual appeal without compromising ergonomics or circulation.</p><button className="text-link dark-link" onClick={() => setActiveImage({ title: 'Modular Residential Kitchen', image: image('kitchenWood') })}>Open project <ArrowUpRight size={16} /></button></div><div className="featured-images"><button onClick={() => setActiveImage({ title: 'Modular Residential Kitchen - warm wood', image: image('kitchenWood') })}><img className="parallax-image" src={image('kitchenWood')} alt="Warm wood modular residential kitchen" /></button><button onClick={() => setActiveImage({ title: 'Modular Residential Kitchen - modern', image: image('kitchenModern') })}><img className="parallax-image" src={image('kitchenModern')} alt="Modern modular kitchen" /></button></div></article><article className="featured-project featured-reverse"><div className="featured-copy"><p className="project-label">Project 02</p><h3>Modular Bedroom Suite</h3><div className="featured-meta"><span><b>Type</b>Modular Bedroom</span><span><b>Style</b>Modern &amp; Classic</span></div><p>A bedroom and terrace layout detailed down to electrical symbols, switchboards and lighting points - chandelier, pendant, mirror and wall lights placed for both function and atmosphere. Dimensions, window placements, curtain pelmets and circulation were mapped for a considered, practical interior.</p><button className="text-link dark-link" onClick={() => setActiveImage({ title: 'Modular Bedroom Suite', image: image('bedroomBeige1') })}>Open project <ArrowUpRight size={16} /></button></div><div className="featured-images"><button onClick={() => setActiveImage({ title: 'Modular Bedroom Suite - bedroom', image: image('bedroomBeige1') })}><img className="parallax-image" src={image('bedroomBeige1')} alt="Beige modular bedroom suite" /></button><button onClick={() => setActiveImage({ title: 'Modular Bedroom Suite - wardrobe', image: image('bedroomWardrobe') })}><img className="parallax-image" src={image('bedroomWardrobe')} alt="Bedroom wardrobe detail" /></button></div></article></div></section>
      <section id="work" className="source-section work-source reveal"><div className="source-wrap"><div className="section-heading"><p className="eyebrow">Selected work</p><span className="section-index">04</span><h2>Other <em>projects</em></h2><p>A wider look at recent kitchens, bedrooms and living spaces designed and detailed end to end.</p></div><div className="project-grid">{projects.slice(0, showAllProjects ? projects.length : 5).map((project) => <button key={project.title} className="project-card" onClick={() => setActiveImage(project)}><img src={project.image} alt={project.title} /><span><strong>{project.title}</strong><small>{project.category}</small></span><ArrowUpRight size={18} /></button>)}</div><button className="projects-toggle" onClick={() => setShowAllProjects(!showAllProjects)}>{showAllProjects ? 'Show fewer projects' : 'View more projects'} <ArrowUpRight size={16} /></button></div></section>
      <section id="contact" className="contact-source reveal"><div className="contact-visual"><img src={image('hero')} alt="Warm modern living and dining interior" /><div><p className="eyebrow">Get in touch</p><p className="quote">Let&apos;s turn your space into something that feels entirely yours.</p></div></div><div className="contact-form-side"><p className="eyebrow">Let&apos;s work together</p><h2>Start your <em>project</em></h2><form onSubmit={handleSubmit}><label>Name<input name="name" required placeholder="Your full name" /></label><label>Email<input type="email" name="email" required placeholder="you@email.com" /></label><label>Phone<input name="phone" placeholder="+91 ..." /></label><label>Tell me about it<textarea name="message" required rows="3" placeholder="A few words about your project..." /></label><button className="light-button" type="submit">Send enquiry <ArrowUpRight size={17} /></button>{formStatus && <p className="form-status">{formStatus}</p>}{submissionSucceeded && <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">Continue on WhatsApp <ArrowUpRight size={17} /></a>}</form><div className="contact-details"><span><b>Email</b>aaminkhan14052005@gmail.com</span><span><b>Phone</b>+91 91310 80455</span></div></div></section>
      <footer><span>© 2026 Amin Khan</span><span>Interior Design Studio - Bhopal</span><a className="social-link" href="https://www.instagram.com/aminnkhannnn?stkn=cWRwa2E0OWxtc2Rz" target="_blank" rel="noreferrer" aria-label="Open Amin Khan on Instagram">Instagram <ArrowUpRight size={15} /></a><button onClick={() => scrollTo('#top')}>Back to top <ArrowUpRight size={15} /></button></footer>
      {activeImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${activeImage.title} preview`} onClick={() => setActiveImage(null)}><button className="lightbox-close" onClick={() => setActiveImage(null)} aria-label="Close image"><X size={24} /></button><img src={activeImage.image} alt={activeImage.title} onClick={(event) => event.stopPropagation()} /><p>{activeImage.title} <span>Click anywhere to close</span></p></div>}
    </main>
  )
}

export default App
