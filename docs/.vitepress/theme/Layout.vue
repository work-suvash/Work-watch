<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { ref, onMounted, onUnmounted, provide, nextTick, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Announcement from './components/Announcement.vue'
import Sidebar from './components/SidebarCard.vue'
import Base64Dialog from './components/Base64Dialog.vue'
import WorkWatchHome from './components/WorkWatchHome.vue'
import { useTheme } from './themes/themeHandler'

const { isDark, frontmatter } = useData()
const route = useRoute()
const { setMode } = useTheme()

const CATEGORY_PATHS = new Set<string>([
  '/privacy', '/ai', '/video', '/audio', '/gaming', '/reading',
  '/downloading', '/torrenting', '/educational', '/mobile',
  '/linux-macos', '/non-english', '/misc',
  '/system-tools', '/file-tools', '/text-tools', '/video-tools',
  '/image-tools', '/internet-tools', '/social-media-tools',
  '/gaming-tools', '/developer-tools', '/storage'
])

function isCategoryPath(path: string) {
  const clean = (path || '/').replace(/\/$/, '') || '/'
  return CATEGORY_PATHS.has(clean)
}

function transformCategoryPage() {
  if (typeof document === 'undefined') return
  const root = document.querySelector('.VPDoc .vp-doc, .VPContent .vp-doc') as HTMLElement | null
  if (!root) return
  if (root.dataset.wwTransformed === '1') return

  // Find the first content container inside vp-doc (vp-doc usually has a single
  // <div> wrapper with the rendered markdown).
  const container = (root.querySelector(':scope > div') as HTMLElement) || root

  const children = Array.from(container.children) as HTMLElement[]

  // VitePress demotes the markdown's body H1 to <h2> (because the page already
  // has a frontmatter title), and `## ▷ Sub` becomes <h3>. So both H2 and H3
  // need to be treated as section dividers — each one renders as its own box.
  //
  // Skip until the first H2 or H3 we find. Anything before that is intro
  // (back-link, leading "Note", etc.) and is intentionally dropped because the
  // category landing already shows the title + description.
  let i = 0
  while (i < children.length && !/^H[23]$/i.test(children[i].tagName)) i++

  type Group = {
    header: HTMLElement
    level: 2 | 3
    nodes: HTMLElement[]
  }
  const groups: Group[] = []
  let current: Group | null = null

  for (; i < children.length; i++) {
    const el = children[i]
    if (el.tagName === 'H2' || el.tagName === 'H3') {
      if (current) groups.push(current)
      current = {
        header: el,
        level: el.tagName === 'H2' ? 2 : 3,
        nodes: []
      }
    } else if (el.tagName === 'HR') {
      // skip horizontal rules used as separators
      continue
    } else {
      if (current) current.nodes.push(el)
      // (anything before the first heading is dropped — see comment above)
    }
  }
  if (current) groups.push(current)

  if (!groups.length) return

  const frag = document.createDocumentFragment()

  for (const g of groups) {
    // Strip the auto-generated # anchor link from the header.
    const anchor = g.header.querySelector('a.header-anchor') as HTMLElement | null
    if (anchor) anchor.remove()

    const hasUlContent = g.nodes.some(
      (n) => n.tagName === 'UL' && ulHasLinks(n)
    )

    // An H2 (top-level major category) that has no link list of its own — it's
    // purely a parent for following H3 sub-sections. Render as a slim banner
    // instead of an empty box, so the page reads "Major Category" → boxes
    // for each sub-category beneath it.
    if (g.level === 2 && !hasUlContent) {
      const banner = document.createElement('div')
      banner.className = 'ww-cat-banner'
      banner.appendChild(g.header)
      frag.appendChild(banner)
      continue
    }

    const box = document.createElement('section')
    box.className = `ww-cat-box ww-cat-box--h${g.level}`
    box.appendChild(g.header)

    for (const n of g.nodes) {
      if (n.tagName === 'UL' && ulHasLinks(n)) {
        transformUlToTileGrid(n)
        box.appendChild(n)
      } else {
        // Notes / paragraphs / bullet lists with no links — keep as a styled note
        n.classList.add('ww-cat-note')
        box.appendChild(n)
      }
    }
    frag.appendChild(box)
  }

  // Rebuild the container: keep the leading frontmatter title block, then append
  // the new section boxes.
  const title = container.querySelector(':scope > .not-prose') as HTMLElement | null
  container.innerHTML = ''
  if (title) container.appendChild(title)
  container.appendChild(frag)

  root.dataset.wwTransformed = '1'
  root.classList.add('vp-doc--ww-cards')

  observeTiles(root)
}

// A UL counts as "tile-bearing" when at least one of its top-level <li>s starts
// with a link — that's how we tell a site list apart from a Note bullet.
function ulHasLinks(ul: HTMLElement): boolean {
  const lis = ul.querySelectorAll(':scope > li')
  for (const li of Array.from(lis)) {
    if (li.querySelector('a')) return true
  }
  return false
}

function transformUlToTileGrid(ul: HTMLElement) {
  ul.classList.add('ww-cat-grid')
  const lis = Array.from(ul.querySelectorAll(':scope > li')) as HTMLElement[]
  for (const li of lis) {
    const firstLink = li.querySelector('a') as HTMLAnchorElement | null
    if (!firstLink) {
      // Items without a link (rare — e.g. "**Note** - ...") render as a small
      // inline note so we don't lose information.
      li.classList.add('ww-tile-note')
      continue
    }
    const label = (firstLink.textContent || '').trim() || firstLink.href
    const href = firstLink.getAttribute('href') || '#'
    const target = firstLink.getAttribute('target') || ''
    const rel = firstLink.getAttribute('rel') || ''

    // Collect remaining links as small mirror chips
    const otherLinks = Array.from(li.querySelectorAll('a'))
      .slice(1)
      .map((a) => {
        const t = (a.textContent || '').trim()
        return { text: t, href: a.getAttribute('href') || '#' }
      })
      .filter((x) => x.text)

    // Get any plain description text (everything after the first ' - ')
    const fullText = (li.textContent || '').trim()
    let desc = ''
    const dashIdx = fullText.indexOf(' - ')
    if (dashIdx > -1) desc = fullText.slice(dashIdx + 3)

    // Derive a favicon URL from the link's hostname. DuckDuckGo's icon service
    // is fast and CDN-served; Google s2 is the fallback.
    let iconUrl = ''
    let iconFallback = ''
    try {
      const u = new URL(href, window.location.href)
      if (u.hostname) {
        iconUrl = `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`
        iconFallback = `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`
      }
    } catch {
      /* ignore */
    }

    // Replace LI content with a tile
    li.innerHTML = ''
    li.classList.add('ww-tile')

    const a = document.createElement('a')
    a.className = 'ww-tile-link'
    a.href = href
    if (target) a.target = target
    if (rel) a.rel = rel

    if (iconUrl) {
      const img = document.createElement('img')
      img.className = 'ww-tile-icon'
      // Defer the request: the IntersectionObserver promotes data-src → src
      // only when the tile actually enters the viewport.
      img.dataset.src = iconUrl
      if (iconFallback) img.dataset.fallback = iconFallback
      img.alt = ''
      img.decoding = 'async'
      img.referrerPolicy = 'no-referrer'
      img.width = 28
      img.height = 28
      a.appendChild(img)
    }

    const labelEl = document.createElement('span')
    labelEl.className = 'ww-tile-label'
    labelEl.textContent = label
    a.appendChild(labelEl)

    li.appendChild(a)

    if (desc || otherLinks.length) {
      const meta = document.createElement('div')
      meta.className = 'ww-tile-meta'
      if (desc) {
        const p = document.createElement('div')
        p.className = 'ww-tile-desc'
        p.textContent = desc
        meta.appendChild(p)
      }
      if (otherLinks.length) {
        const mirrors = document.createElement('div')
        mirrors.className = 'ww-tile-mirrors'
        for (const m of otherLinks) {
          const ml = document.createElement('a')
          ml.href = m.href
          ml.textContent = m.text
          ml.target = '_blank'
          ml.rel = 'noopener noreferrer'
          mirrors.appendChild(ml)
        }
        meta.appendChild(mirrors)
      }
      li.appendChild(meta)
    }
  }
}

// One shared IntersectionObserver per page that:
//   1. Loads each tile's favicon only when it nears the viewport.
//   2. Adds .is-visible to fade/slide the tile into view.
// After firing it stops observing the tile, so it pays a tiny one-time cost
// and frees memory.
let tileObserver: IntersectionObserver | null = null

function ensureTileObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null
  if (tileObserver) return tileObserver
  tileObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const tile = entry.target as HTMLElement
      tile.classList.add('is-visible')
      const img = tile.querySelector('img.ww-tile-icon[data-src]') as HTMLImageElement | null
      if (img) {
        const src = img.dataset.src!
        const fallback = img.dataset.fallback || ''
        delete img.dataset.src
        let triedFallback = false
        img.onerror = () => {
          if (!triedFallback && fallback) {
            triedFallback = true
            img.src = fallback
          } else {
            img.style.display = 'none'
          }
        }
        img.src = src
      }
      obs.unobserve(tile)
    }
  }, {
    rootMargin: '300px 0px',
    threshold: 0.01
  })
  return tileObserver
}

function observeTiles(root: HTMLElement) {
  const obs = ensureTileObserver()
  const tiles = root.querySelectorAll('li.ww-tile')
  if (!obs) {
    // Graceful fallback: just show everything immediately.
    tiles.forEach((t) => {
      const tile = t as HTMLElement
      tile.classList.add('is-visible')
      const img = tile.querySelector('img.ww-tile-icon[data-src]') as HTMLImageElement | null
      if (img && img.dataset.src) {
        img.src = img.dataset.src
        delete img.dataset.src
      }
    })
    return
  }
  tiles.forEach((t) => obs.observe(t))
}

function applyCategoryPageMode() {
  if (typeof document === 'undefined') return
  const isCat = isCategoryPath(route.path)
  document.documentElement.classList.toggle('ww-on-category', isCat)
  if (!isCat) {
    // Clear any leftover card-mode classes/flags so non-category pages render normally
    const root = document.querySelector('.VPDoc .vp-doc, .VPContent .vp-doc') as HTMLElement | null
    if (root) {
      root.classList.remove('vp-doc--ww-cards')
      delete root.dataset.wwTransformed
    }
  }
}

function maybeTransform() {
  applyCategoryPageMode()
  if (!isCategoryPath(route.path)) return
  // run after VitePress paints the new markdown. Try a few times because the
  // .vp-doc element is reused between routes — its inner HTML is replaced async,
  // and we need to re-run the transformer against the *fresh* content.
  const attempt = (n: number) => {
    nextTick(() => {
      const root = document.querySelector('.VPDoc .vp-doc, .VPContent .vp-doc') as HTMLElement | null
      if (root) {
        // Always reset the flag on a route change so the transformer re-runs
        // against the freshly mounted markdown rather than bailing out.
        delete root.dataset.wwTransformed
      }
      transformCategoryPage()
      // If the transform didn't take effect (content still not painted), retry.
      const done = root?.dataset.wwTransformed === '1'
      if (!done && n < 8) setTimeout(() => attempt(n + 1), 30)
    })
  }
  attempt(0)
}

watch(
  () => route.path,
  () => maybeTransform(),
  { immediate: false }
)

const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    // Sync with theme handler
    setMode(isDark.value ? 'dark' : 'light')
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    // Sync with theme handler
    setMode(isDark.value ? 'dark' : 'light')
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})

const { Layout } = DefaultTheme
const showBase64Dialog = ref(false)
const formattedUrl = ref('')

const handleClick = (e: MouseEvent) => {
  // Check if the clicked element is a link or within a link
  const target = e.target as HTMLElement
  const link = target.closest ? target.closest('a') : null
  
  if (link) {
    const href = (link as HTMLAnchorElement).href
    
    if (typeof href === 'string') {
      if (href.includes('https://rentry.co/WORKWATCHB64') || href.startsWith('https://rentry.co/WORKWATCHB64')) {
        const dontShow = localStorage.getItem('workwatch-base64-dialog-preference')
        if (dontShow === 'true') {
          return // Let the link click proceed normally
        }
        
        e.preventDefault()
        e.stopPropagation()
        formattedUrl.value = href
        showBase64Dialog.value = true
      }
    }
  }
}

// ---- Desktop sidebar collapse toggle ----
const SIDEBAR_KEY = 'workwatch-sidebar-collapsed'
const sidebarCollapsed = ref(false)

function applySidebarState() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('ww-sidebar-collapsed', sidebarCollapsed.value)
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  try {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed.value ? '1' : '0')
  } catch {}
  applySidebarState()
}

onMounted(() => {
  window.addEventListener('click', handleClick, { capture: true })
  try {
    sidebarCollapsed.value = localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {}
  applySidebarState()
  maybeTransform()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClick, { capture: true })
})
</script>

<template>
  <Layout>
    <template #sidebar-nav-after>
      <Sidebar />
    </template>
    <template #home-hero-info-before>
      <Announcement />
    </template>
    <template #home-features-before>
      <WorkWatchHome />
    </template>
    <template #layout-top>
      <button
        class="ww-sidebar-toggle"
        :class="{ 'is-collapsed': sidebarCollapsed }"
        :aria-label="sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'"
        :title="sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'"
        @click="toggleSidebar"
      >
        <svg
          v-if="!sidebarCollapsed"
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
        ><path d="m15 18-6-6 6-6"/></svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
        ><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </template>
    <Content />
  </Layout>
  <Base64Dialog :show="showBase64Dialog" :url="formattedUrl" @close="showBase64Dialog = false" />
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
