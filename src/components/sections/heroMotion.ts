export const HERO_WAVE_EXIT_PROGRESS = 0.72
export const HERO_WAVE_SETTLE_DELAY = 180

export const HOME_NAVIGATION_EVENT = 'school:home-navigation'

let skipNextHomeWaveOpening = false
let skipCurrentHomeWaveOpening = false
let skipNextHomeWaveSettlePause = false
let skipCurrentHomeWaveSettlePause = false

export function skipHeroWaveOnNextHomeNavigation() {
  skipNextHomeWaveOpening = true
  skipNextHomeWaveSettlePause = true
}

export function consumeHomeWaveOpeningSkip() {
  if (skipNextHomeWaveOpening) {
    skipNextHomeWaveOpening = false
    skipCurrentHomeWaveOpening = true
  }
  if (skipNextHomeWaveSettlePause) {
    skipNextHomeWaveSettlePause = false
    skipCurrentHomeWaveSettlePause = true
  }

  return skipCurrentHomeWaveOpening
}

export function hasHomeWaveOpeningSkip() {
  return skipNextHomeWaveOpening || skipCurrentHomeWaveOpening
}

export function releaseHomeWaveOpeningSkip() {
  skipCurrentHomeWaveOpening = false
}

export function shouldSkipHomeWaveSettlePause() {
  return skipNextHomeWaveSettlePause || skipCurrentHomeWaveSettlePause
}

export function releaseHomeWaveSettlePauseSkip() {
  skipCurrentHomeWaveSettlePause = false
}

export function clearHomeWaveOpeningSkip() {
  skipNextHomeWaveOpening = false
  skipCurrentHomeWaveOpening = false
  skipNextHomeWaveSettlePause = false
  skipCurrentHomeWaveSettlePause = false
}
