<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

type Category = {
  id: string
  title: string
  link: string
  details: string
  color: string
  group: 'Tools' | 'Media' | 'Platforms' | 'Learn'
  icon: string
  trending?: boolean
}

const CATEGORIES: Category[] = [
  {
    id: 'privacy',
    title: 'Adblocking / Privacy',
    link: '/privacy',
    details: 'Learn how to block ads, trackers and other nasty things.',
    color: '#D05A6E',
    group: 'Tools',
    trending: true,
    icon: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>'
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    link: '/ai',
    details: 'Explore the world of AI and machine learning.',
    color: '#91989F',
    group: 'Tools',
    trending: true,
    icon: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>'
  },
  {
    id: 'video',
    title: 'Streaming',
    link: '/video',
    details: 'Stream, download, torrent and binge all your favourite movies and shows!',
    color: '#7aa2f7',
    group: 'Media',
    trending: true,
    icon: '<path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z"/><path d="M7 21h10"/><rect width="20" height="14" x="2" y="3" rx="2"/>'
  },
  {
    id: 'audio',
    title: 'Listening',
    link: '/audio',
    details: 'Stream, download and torrent songs, podcasts and more!',
    color: '#7c82fe',
    group: 'Media',
    icon: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
  },
  {
    id: 'gaming',
    title: 'Gaming',
    link: '/gaming',
    details: 'Download and play all your favourite games or emulate some old but gold ones!',
    color: '#49d3e9',
    group: 'Media',
    icon: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>'
  },
  {
    id: 'reading',
    title: 'Reading',
    link: '/reading',
    details: "Whether you're a bookworm, otaku or comic book fan, you'll be able to find your favourite literature here!",
    color: '#3ccd93',
    group: 'Media',
    icon: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/>'
  },
  {
    id: 'downloading',
    title: 'Downloading',
    link: '/downloading',
    details: 'Download all your favourite software, movies, shows, music, games and more!',
    color: '#BEC23F',
    group: 'Tools',
    icon: '<path d="M12 2v8"/><path d="m16 6-4 4-4-4"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 18h.01"/><path d="M10 18h.01"/>'
  },
  {
    id: 'torrenting',
    title: 'Torrenting',
    link: '/torrenting',
    details: 'Download your favourite media using the BitTorrent protocol.',
    color: '#8A6BBE',
    group: 'Tools',
    icon: '<path d="m12 15 4 4"/><path d="M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z"/><path d="m5 8 4 4"/>'
  },
  {
    id: 'educational',
    title: 'Educational',
    link: '/educational',
    details: 'Educational content for all ages.',
    color: '#A8D8B9',
    group: 'Learn',
    icon: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>'
  },
  {
    id: 'mobile',
    title: 'Android / iOS',
    link: '/mobile',
    details: 'All forms of content for Android and iOS.',
    color: '#DAC9A6',
    group: 'Platforms',
    icon: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>'
  },
  {
    id: 'linux-macos',
    title: 'Linux / macOS',
    link: '/linux-macos',
    details: 'The $HOME of Linux and macOS.',
    color: '#f17c67',
    group: 'Platforms',
    icon: '<path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>'
  },
  {
    id: 'non-english',
    title: 'Non-English',
    link: '/non-english',
    details: 'Content in languages other than English.',
    color: '#FB9966',
    group: 'Platforms',
    icon: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>'
  },
  {
    id: 'misc',
    title: 'Miscellaneous',
    link: '/misc',
    details: 'Various topics like food, travel, news, shopping, fun sites and more!',
    color: '#DDD23B',
    group: 'Learn',
    icon: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>'
  }
]

const GROUPS: Array<'All' | Category['group']> = ['All', 'Tools', 'Media', 'Platforms', 'Learn']

const BOOKMARK_KEY = 'workwatch-bookmarks'
const VIEW_KEY = 'workwatch-view-mode'
const RECENT_KEY = 'workwatch-recent'

const search = ref('')
const activeGroup = ref<typeof GROUPS[number]>('All')
const view = ref<'grid' | 'list'>('grid')
const bookmarks = ref<string[]>([])
const recentIds = ref<string[]>([])
const showSuggestions = ref(false)
const hydrated = ref(false)

const trending = computed(() => CATEGORIES.filter((c) => c.trending))

const recentCategories = computed(() =>
  recentIds.value
    .map((id) => CATEGORIES.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c))
)

const bookmarkedCategories = computed(() =>
  bookmarks.value
    .map((id) => CATEGORIES.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c))
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return CATEGORIES.filter((c) => {
    const groupOk = activeGroup.value === 'All' || c.group === activeGroup.value
    if (!groupOk) return false
    if (!q) return true
    return (
      c.title.toLowerCase().includes(q) ||
      c.details.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
    )
  })
})

const suggestions = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  return CATEGORIES.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.details.toLowerCase().includes(q)
  ).slice(0, 5)
})

function toggleBookmark(id: string, ev?: Event) {
  ev?.preventDefault()
  ev?.stopPropagation()
  const i = bookmarks.value.indexOf(id)
  if (i === -1) bookmarks.value = [...bookmarks.value, id]
  else bookmarks.value = bookmarks.value.filter((b) => b !== id)
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks.value))
  } catch {}
}

function isBookmarked(id: string) {
  return bookmarks.value.includes(id)
}

function pickSuggestion(c: Category) {
  showSuggestions.value = false
  search.value = ''
  if (typeof window !== 'undefined') window.location.href = c.link
}

function clearSearch() {
  search.value = ''
}

function setView(v: 'grid' | 'list') {
  view.value = v
  try {
    localStorage.setItem(VIEW_KEY, v)
  } catch {}
}

watch(view, (v) => {
  try {
    localStorage.setItem(VIEW_KEY, v)
  } catch {}
})

function hideSuggestions() {
  window.setTimeout(() => { showSuggestions.value = false }, 150)
}

// ---- Scroll-reveal: observe SECTIONS only, cards stagger via CSS ----
let homeObserver: IntersectionObserver | null = null

function revealSections() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    // Fallback: show everything immediately
    document.querySelectorAll<HTMLElement>('.ww-home .ww-section.ww-reveal')
      .forEach(el => el.classList.add('is-visible'))
    return
  }
  homeObserver?.disconnect()
  homeObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add('is-visible')
        obs.unobserve(el)
      }
    },
    // Pre-load 80px before the element reaches the viewport bottom so the
    // animation is already playing by the time the user sees it.
    { rootMargin: '0px 0px -20px 0px', threshold: 0.04 }
  )
  // Use rAF to ensure DOM is fully painted before observing
  requestAnimationFrame(() => {
    nextTick(() => {
      const sections = document.querySelectorAll<HTMLElement>('.ww-home .ww-section.ww-reveal:not(.is-visible)')
      sections.forEach(el => homeObserver!.observe(el))
    })
  })
}

onMounted(() => {
  try {
    const b = localStorage.getItem(BOOKMARK_KEY)
    if (b) bookmarks.value = JSON.parse(b)
    const v = localStorage.getItem(VIEW_KEY)
    if (v === 'list' || v === 'grid') view.value = v
    const r = localStorage.getItem(RECENT_KEY)
    if (r) recentIds.value = JSON.parse(r)
  } catch {}
  hydrated.value = true
  revealSections()
})

onUnmounted(() => {
  homeObserver?.disconnect()
  homeObserver = null
})

// Re-run observer after reactive data changes (search, view, hydration)
watch([filtered, view, hydrated], () => {
  nextTick(() => revealSections())
})
</script>

<template>
  <div class="ww-home">
    <!-- Search bar -->
    <div class="ww-search-wrap ww-hero-item" :class="{ 'has-suggestions': showSuggestions && suggestions.length }">
      <div class="ww-search">
        <svg class="ww-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search categories…"
          class="ww-search-input"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
        />
        <button v-if="search" class="ww-search-clear" aria-label="Clear" @click="clearSearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      <ul v-if="showSuggestions && suggestions.length" class="ww-suggestions">
        <li
          v-for="s in suggestions"
          :key="s.id"
          class="ww-suggestion"
          @mousedown.prevent="pickSuggestion(s)"
        >
          <span class="ww-suggestion-dot" :style="{ background: s.color }" />
          <span class="ww-suggestion-title">{{ s.title }}</span>
          <span class="ww-suggestion-group">{{ s.group }}</span>
        </li>
      </ul>
    </div>

    <!-- Filters + view toggle -->
    <div class="ww-toolbar ww-hero-item">
      <div class="ww-chips" role="tablist">
        <button
          v-for="g in GROUPS"
          :key="g"
          class="ww-chip"
          :class="{ active: activeGroup === g }"
          @click="activeGroup = g"
        >
          {{ g }}
        </button>
      </div>
      <div class="ww-view-toggle" role="group">
        <button
          class="ww-view-btn"
          :class="{ active: view === 'grid' }"
          aria-label="Grid view"
          @click="setView('grid')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        </button>
        <button
          class="ww-view-btn"
          :class="{ active: view === 'list' }"
          aria-label="List view"
          @click="setView('list')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Bookmarks -->
    <section v-if="hydrated && bookmarkedCategories.length" class="ww-section ww-reveal">
      <header class="ww-section-head">
        <h3 class="ww-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
          Bookmarks
        </h3>
        <span class="ww-section-count">{{ bookmarkedCategories.length }}</span>
      </header>
      <div class="ww-grid" :class="{ 'is-list': view === 'list' }">
        <a
          v-for="c in bookmarkedCategories"
          :key="'bm-' + c.id"
          :href="c.link"
          class="ww-card"
        >
          <div class="ww-card-icon" :style="{ color: c.color, background: c.color + '22' }">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="c.icon" />
          </div>
          <div class="ww-card-body">
            <h4 class="ww-card-title">{{ c.title }}</h4>
            <p class="ww-card-desc">{{ c.details }}</p>
          </div>
          <button
            class="ww-bookmark active"
            aria-label="Remove bookmark"
            @click="toggleBookmark(c.id, $event)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </a>
      </div>
    </section>

    <!-- Recently viewed -->
    <section v-if="hydrated && recentCategories.length" class="ww-section ww-reveal">
      <header class="ww-section-head">
        <h3 class="ww-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          Recently viewed
        </h3>
      </header>
      <div class="ww-grid" :class="{ 'is-list': view === 'list' }">
        <a
          v-for="c in recentCategories"
          :key="'r-' + c.id"
          :href="c.link"
          class="ww-card"
        >
          <div class="ww-card-icon" :style="{ color: c.color, background: c.color + '22' }">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="c.icon" />
          </div>
          <div class="ww-card-body">
            <h4 class="ww-card-title">{{ c.title }}</h4>
            <p class="ww-card-desc">{{ c.details }}</p>
          </div>
          <button
            class="ww-bookmark"
            :class="{ active: isBookmarked(c.id) }"
            :aria-label="isBookmarked(c.id) ? 'Remove bookmark' : 'Add bookmark'"
            @click="toggleBookmark(c.id, $event)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(c.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </a>
      </div>
    </section>

    <!-- Trending -->
    <section v-if="!search && activeGroup === 'All'" class="ww-section ww-reveal">
      <header class="ww-section-head">
        <h3 class="ww-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          Trending
        </h3>
      </header>
      <div class="ww-grid" :class="{ 'is-list': view === 'list' }">
        <a v-for="c in trending" :key="'t-' + c.id" :href="c.link" class="ww-card">
          <div class="ww-card-icon" :style="{ color: c.color, background: c.color + '22' }">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="c.icon" />
          </div>
          <div class="ww-card-body">
            <h4 class="ww-card-title">
              {{ c.title }}
              <span class="ww-trending-badge">Hot</span>
            </h4>
            <p class="ww-card-desc">{{ c.details }}</p>
          </div>
          <button
            class="ww-bookmark"
            :class="{ active: isBookmarked(c.id) }"
            :aria-label="isBookmarked(c.id) ? 'Remove bookmark' : 'Add bookmark'"
            @click="toggleBookmark(c.id, $event)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(c.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </a>
      </div>
    </section>

    <!-- All / filtered -->
    <section class="ww-section ww-reveal">
      <header class="ww-section-head">
        <h3 class="ww-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
          {{ search ? `Results for "${search}"` : (activeGroup === 'All' ? 'All categories' : activeGroup) }}
        </h3>
        <span class="ww-section-count">{{ filtered.length }}</span>
      </header>

      <div v-if="filtered.length" class="ww-grid" :class="{ 'is-list': view === 'list' }">
        <a v-for="c in filtered" :key="c.id" :href="c.link" class="ww-card">
          <div class="ww-card-icon" :style="{ color: c.color, background: c.color + '22' }">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="c.icon" />
          </div>
          <div class="ww-card-body">
            <h4 class="ww-card-title">{{ c.title }}</h4>
            <p class="ww-card-desc">{{ c.details }}</p>
          </div>
          <button
            class="ww-bookmark"
            :class="{ active: isBookmarked(c.id) }"
            :aria-label="isBookmarked(c.id) ? 'Remove bookmark' : 'Add bookmark'"
            @click="toggleBookmark(c.id, $event)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(c.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
        </a>
      </div>

      <div v-else class="ww-empty">
        <p>No matching categories.</p>
        <button class="ww-chip" @click="search = ''; activeGroup = 'All'">Reset filters</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ww-home {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  padding: 8px 24px 64px;
  color: var(--ww-text, #e2e8f0);
  /* Own stacking context so the search suggestions always float above
     the VPHero section that is rendered before this component in the DOM */
  position: relative;
  z-index: 2;
}

/* ---- Search ---- */
.ww-search-wrap {
  position: relative;
  margin: 0 auto 24px;
  max-width: 640px;
  /* Lift search wrap above sibling sections so the dropdown never hides behind cards */
  z-index: 20;
}
.ww-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  height: 48px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid var(--ww-glass-border, rgba(148, 163, 184, 0.12));
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  transition: border-color 200ms ease-in-out, box-shadow 200ms ease-in-out;
}
.ww-search:focus-within {
  border-color: rgba(56, 189, 248, 0.55);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.12);
}
.ww-search-icon {
  color: var(--ww-text-muted, #94a3b8);
  flex-shrink: 0;
}
.ww-search-input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--ww-text, #e2e8f0);
  font-size: 15px;
  font-weight: 500;
}
.ww-search-input::placeholder {
  color: var(--ww-text-muted, #94a3b8);
}
.ww-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--ww-text-muted, #94a3b8);
  border: 0;
  cursor: pointer;
  transition: all 200ms ease-in-out;
}
.ww-search-clear:hover {
  background: rgba(148, 163, 184, 0.22);
  color: var(--ww-text, #e2e8f0);
}

.ww-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  list-style: none;
  margin: 0;
  padding: 6px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid var(--ww-glass-border, rgba(148, 163, 184, 0.12));
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  z-index: 30;
  animation: ww-fade-down 200ms ease-in-out;
}
.ww-suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 160ms ease-in-out;
}
.ww-suggestion:hover {
  background: rgba(56, 189, 248, 0.1);
}
.ww-suggestion-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ww-suggestion-title {
  font-weight: 600;
  font-size: 14px;
  flex: 1;
}
.ww-suggestion-group {
  font-size: 12px;
  color: var(--ww-text-muted, #94a3b8);
  background: rgba(148, 163, 184, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
}

/* ---- Toolbar ---- */
.ww-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}
.ww-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ww-chip {
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--ww-glass-border, rgba(148, 163, 184, 0.12));
  color: var(--ww-text-muted, #94a3b8);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease-in-out;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.ww-chip:hover {
  color: var(--ww-text, #e2e8f0);
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-1px);
}
.ww-chip:active {
  transform: scale(0.98);
}
.ww-chip.active {
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

.ww-view-toggle {
  display: flex;
  padding: 4px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--ww-glass-border, rgba(148, 163, 184, 0.12));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.ww-view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ww-text-muted, #94a3b8);
  cursor: pointer;
  transition: all 200ms ease-in-out;
}
.ww-view-btn:hover {
  color: var(--ww-text, #e2e8f0);
}
.ww-view-btn.active {
  background: rgba(56, 189, 248, 0.18);
  color: var(--ww-accent, #38bdf8);
}

/* ---- Sections ---- */
.ww-section {
  margin-bottom: 36px;
  animation: ww-fade-up 280ms ease-in-out;
}
.ww-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.ww-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ww-text-muted, #94a3b8);
  margin: 0;
}
.ww-section-count {
  font-size: 12px;
  color: var(--ww-text-muted, #94a3b8);
  background: rgba(148, 163, 184, 0.12);
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
}

/* ---- Grid ---- */
.ww-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.ww-grid.is-list {
  grid-template-columns: 1fr;
}
.ww-grid.is-list .ww-card {
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
}
.ww-grid.is-list .ww-card-icon {
  margin-bottom: 0;
}
.ww-grid.is-list .ww-card-body {
  flex: 1;
}
.ww-grid.is-list .ww-card-desc {
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

.ww-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 18px;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid var(--ww-glass-border, rgba(148, 163, 184, 0.12));
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 220ms ease-in-out, box-shadow 220ms ease-in-out, border-color 220ms ease-in-out, background 220ms ease-in-out;
}
.ww-card:hover {
  transform: translateY(-3px);
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(30, 41, 59, 0.7);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(56, 189, 248, 0.1);
}
.ww-card:active {
  transform: scale(0.98);
}

.ww-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-bottom: 14px;
  transition: transform 220ms ease-in-out;
}
.ww-card:hover .ww-card-icon {
  transform: scale(1.06);
}
.ww-card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ww-text, #e2e8f0);
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ww-card-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--ww-text-muted, #94a3b8);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ww-trending-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fb923c;
  background: rgba(251, 146, 60, 0.16);
  padding: 2px 8px;
  border-radius: 999px;
}

.ww-bookmark {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid transparent;
  color: var(--ww-text-muted, #94a3b8);
  cursor: pointer;
  opacity: 0;
  transform: translateY(-2px);
  transition: all 200ms ease-in-out;
}
.ww-card:hover .ww-bookmark,
.ww-bookmark.active {
  opacity: 1;
  transform: translateY(0);
}
.ww-bookmark:hover {
  color: var(--ww-accent, #38bdf8);
  border-color: rgba(56, 189, 248, 0.35);
}
.ww-bookmark.active {
  color: var(--ww-accent, #38bdf8);
}

.ww-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: var(--ww-text-muted, #94a3b8);
}

@keyframes ww-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes ww-fade-down {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .ww-home {
    padding: 8px 16px 48px;
  }
  .ww-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .ww-view-toggle {
    align-self: flex-end;
  }
}
</style>
