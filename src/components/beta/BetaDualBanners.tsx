import { Link } from 'react-router'
import { Gamepad2, Wrench, ArrowRight, Cpu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBuilderSettings } from '@/hooks/useBuilderSettings'

export default function BetaDualBanners() {
  const { t } = useTranslation()
  const { enabled: isBuilderEnabled } = useBuilderSettings()

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* BANNER 1: GAMING CHAIRS & COMFORT BOOST */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/60 p-8 flex flex-col justify-between group shadow-md">
          <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-400">
              <Gamepad2 className="h-3.5 w-3.5" /> {t('banners.chairsTag', 'Gaming Ergonomique Pro')}
            </span>

            <h3 className="mt-4 font-display text-2xl md:text-3xl font-black tracking-tight">
              {t('banners.chairsTitle', 'Chaises Gamer Corsair & Noblechairs')}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
              {t('banners.chairsSub', 'Confort haute performance, accoudoirs 4D, tissu respirant et maintien lombaire pour vos longues sessions de jeu.')}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs font-bold text-volt">
              {t('banners.chairsPrice', 'À partir de 2 490 MAD')}
            </span>
            <Link
              to="/shop?q=Chair"
              className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-volt-fg transition-all hover:bg-volt-dim hover:scale-105"
            >
              {t('banners.chairsBtn', 'Découvrir les Chaises Gamer')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* BANNER 2: CUSTOM PC ASSEMBLY OR PRE-BUILT GAMING PCS */}
        <div className={`relative overflow-hidden rounded-2xl border p-8 flex flex-col justify-between group shadow-md transition-colors ${
          isBuilderEnabled
            ? 'border-volt/40 bg-gradient-to-br from-background via-card to-volt/5'
            : 'border-border bg-gradient-to-br from-card via-card to-secondary/60'
        }`}>
          <div className="absolute top-0 right-0 h-40 w-40 bg-volt/15 rounded-full blur-3xl pointer-events-none" />

          {isBuilderEnabled ? (
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-volt/15 border border-volt/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-volt">
                <Wrench className="h-3.5 w-3.5" /> {t('banners.builderTag', 'Service Montage PC Sur Mesure')}
              </span>

              <h3 className="mt-4 font-display text-2xl md:text-3xl font-black tracking-tight">
                {t('banners.builderTitle', 'Montez & Testez Votre PC de Rêve en 24h')}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                {t('banners.builderSub', 'Choisissez vos composants. Nos techniciens à Oujda assemblent, testent et optimisent votre setup avec garantie incluse !')}
              </p>
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Cpu className="h-3.5 w-3.5" /> {t('banners.pcGamerTag', 'PC Gamer Clé en Main')}
              </span>

              <h3 className="mt-4 font-display text-2xl md:text-3xl font-black tracking-tight">
                {t('banners.pcGamerTitle', 'Tours Gamer Haute Performance Prêtes à Jouer')}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
                {t('banners.pcGamerSub', 'Découvrez nos configurations montées, testées sous stress et prêtes pour vos jeux préférés avec garantie constructeur.')}
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs font-bold text-muted-foreground">
              {isBuilderEnabled
                ? t('banners.builderBonus', 'Câble management propre & pâte thermique offerte')
                : t('banners.pcGamerBonus', 'Livraison sécurisée partout au Maroc')}
            </span>
            <Link
              to={isBuilderEnabled ? '/builder' : '/shop?category=pc-gamer'}
              className="inline-flex items-center gap-2 rounded-xl bg-volt px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-volt-fg transition-all hover:bg-volt-dim hover:scale-105"
            >
              {isBuilderEnabled
                ? t('banners.builderBtn', 'Lancer le Configurateur')
                : t('banners.pcGamerBtn', 'Découvrir les PC Gamer')}{' '}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
