import { useRef } from 'react'
import { useReveal } from './reveal'
import './Story.css'

const STORY = [
  "Mijoté de légumes composés de Chayotte ou Mirliton ou Christophine, Aubergine, Papaye, Molokhia (Lalo), choux, carotte, épinard, tomate cuits traditionnellement à l'haïtienne. Ils sont déjà découpés, écrasés, précuits et congelés.",
  'Généralement cela prend plus de 3 heures de préparation et de cuisson, mais Les Aliments Safrozen offre aux consommateurs une solution +/- de 20 minutes, Legim Express. Une formule magique !',
  "Fait à partir d'ingrédients naturels, il n'est ni assaisonné, ni épicé, c'est vraiment une base neutre, à partir de laquelle que l'on soit un amateur ou un chef expérimenté, il peut l'apprêter à son goût, c'est-à-dire avec ou sans viandes ou fruits de mer ou protéine végétale.",
]

/*
 * An ordinary section after Benefits: the copy and the family picture rise in,
 * one after another, once the section comes into view (useReveal), and play
 * again on the next visit. Wide screens: copy left, picture right.
 */
export default function Story() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  // Entrance order: the picture first, then each line (--i in Story.css).
  const lines = ['kicker', 'title', ...STORY.map((_, i) => `para-${i}`), 'tagline']
  const order = (key: string) => ({ '--i': lines.indexOf(key) + 1 }) as React.CSSProperties

  return (
    <section id="histoire" className="story" ref={sectionRef} aria-labelledby="story-title">
      <div className="story__media">
        {/* A quiet terracotta panel behind the photo, running off the right edge. */}
        <div className="story__panel" aria-hidden="true" />
        <img
          className="story__photo"
          style={{ '--i': 0 } as React.CSSProperties}
          src="/images/family-1537.webp"
          srcSet="/images/family-960.webp 960w, /images/family-1537.webp 1537w"
          sizes="(min-width: 1200px) 55vw, 100vw"
          width={1537}
          height={1023}
          alt="Une famille partage un repas en cuisine, devant les trois boîtes Legim Express."
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="story__copy">
        <p className="story__line story__kicker" style={order('kicker')}>
          Legim Express
        </p>
        <h2 className="story__line story__title" id="story-title" style={order('title')}>
          Prêt en 20 minutes
        </h2>
        {STORY.map((text, i) => (
          <p key={text.slice(0, 24)} className="story__line story__para" style={order(`para-${i}`)}>
            {text}
          </p>
        ))}
        <p className="story__line story__tagline" style={order('tagline')}>
          Gagner du temps avec Legim Express !
        </p>
      </div>
    </section>
  )
}
