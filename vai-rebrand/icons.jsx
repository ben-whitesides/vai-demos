/* global React */
// VAI Icons — minimal 1.5px stroke SVG set. No emoji, ever.

const Icon = ({ children, size = 18, stroke = 'currentColor', fill = 'none', strokeWidth = 1.5, ...rest }) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>;


const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></Icon>;
const IconHamburger = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
const IconHome = (p) => <Icon {...p}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></Icon>;
const IconWallet = (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="17" cy="14.5" r="1" fill="currentColor" /></Icon>;
const IconMe = (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 5-6 8-6s7 2 8 6" /></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon>;
const IconUsers = (p) => <Icon {...p}><circle cx="9" cy="9" r="3.5" /><path d="M3 19c.5-3.5 3-5 6-5s5.5 1.5 6 5" /><circle cx="17" cy="8" r="2.8" /><path d="M16 14c3 .3 4.5 2 5 5" /></Icon>;
const IconChat = (p) => <Icon {...p}><path d="M4 5h16v11H8l-4 4z" /></Icon>;
const IconShare = (p) => <Icon {...p}><path d="M12 4v12" /><path d="m7 9 5-5 5 5" /><path d="M5 14v5h14v-5" /></Icon>;
const IconConnect = (p) => <Icon {...p}><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m9 11 6.5-3.5M9 13l6.5 3.5" /></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>;
const IconTrophy = (p) => <Icon {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M5 6H3v2a3 3 0 0 0 4 3M19 6h2v2a3 3 0 0 1-4 3" /><path d="M9 14h6v3l1 4H8l1-4z" /></Icon>;
const IconChart = (p) => <Icon {...p}><path d="M4 20V8M10 20V4M16 20v-7M22 20H2" /></Icon>;
const IconDollar = (p) => <Icon {...p}><path d="M12 3v18" /><path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8" /></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="m5 12 4 4 10-10" /></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></Icon>;
const IconQR = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v3M14 21h3M17 17h4v4" /></Icon>;
const IconActivity = (p) => <Icon {...p}><path d="M3 12h4l2-7 4 14 2-7h6" /></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 4v16M4 12h16" /></Icon>;
const IconChevR = (p) => <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>;
const IconChevL = (p) => <Icon {...p}><path d="m15 6-6 6 6 6" /></Icon>;
const IconArrowL = (p) => <Icon {...p}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></Icon>;
const IconArrowUp = (p) => <Icon {...p}><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></Icon>;
const IconDotsH = (p) => <Icon {...p}><circle cx="6" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="18" cy="12" r="1.4" fill="currentColor" /></Icon>;
const IconClose = (p) => <Icon {...p}><path d="m6 6 12 12M6 18 18 6" /></Icon>;
const IconResize = (p) => <Icon {...p}><path d="M3 9V3h6M21 15v6h-6M3 3l7 7M21 21l-7-7" /></Icon>;
const IconReplace = (p) => <Icon {...p}><path d="M4 7h12l-3-3M20 17H8l3 3" /></Icon>;
const IconHide = (p) => <Icon {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /><path d="m4 4 16 16" stroke="currentColor" /></Icon>;
const IconReset = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Icon>;
const IconMove = (p) => <Icon {...p}><path d="M12 3v18M3 12h18" /><path d="m8 7 4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" /></Icon>;
const IconSparkles = (p) => <Icon {...p}><path d="M12 4v4M12 16v4M4 12h4M16 12h4" /><path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></Icon>;
const IconSend = (p) => <Icon {...p}><path d="m4 12 16-8-6 16-2-7z" /></Icon>;
const IconGrip = (p) => <Icon {...p}><circle cx="9" cy="6" r="1.2" fill="currentColor" /><circle cx="9" cy="12" r="1.2" fill="currentColor" /><circle cx="9" cy="18" r="1.2" fill="currentColor" /><circle cx="15" cy="6" r="1.2" fill="currentColor" /><circle cx="15" cy="12" r="1.2" fill="currentColor" /><circle cx="15" cy="18" r="1.2" fill="currentColor" /></Icon>;
const IconWhistle = (p) => <Icon {...p}><path d="M14 8a4 4 0 1 1-2.5 7.1L4 18l1-3.5A4 4 0 0 1 14 8z" /><path d="M16 7V4l4-1v3" /></Icon>;

// VAI wingmark — wing in orange, letters (A·I and Y-strokes) in white
const VAIWingmark = ({ size = 22, color = '#F7941E', letterColor = '#F5F0EB' }) =>
<svg width={size * (285 / 194)} height={size} viewBox="0 0 285 194" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="VAI" style={{ width: "44px" }}>
    {/* Wing (V) */}
    <path d="M160.629 0L88.5482 53.0803V101.568L81.1401 91.6626L0 10.6842V102.773L88.6142 193.745V102.724L160.629 49.8154V0Z" fill={color} />
    {/* A */}
    <path fillRule="evenodd" clipRule="evenodd" d="M217.053 108.971L159.072 193.139H184.193L194.196 178.101L205.861 160.074L221.46 136.197V136.216L227.226 127.302L221.46 145.093V160.074V178.101V193.139H244.666V108.971H217.053Z" fill={letterColor} />
    {/* Y */}
    <path fillRule="evenodd" clipRule="evenodd" d="M132.421 165.25L169.924 109.567H195.876L139.801 193.744H112.537V109.567H132.421V157.509L127.051 173.067L132.421 165.108V165.25Z" fill={letterColor} />
    {/* I */}
    <path d="M262.04 109.567H285.142V193.139H262.04V109.567Z" fill={letterColor} />
  </svg>;


// just the wing portion (for bottom-nav center "Feed" tab)
const VAIWingOnly = ({ size = 22, color = '#F7941E' }) =>
<svg width={size} height={size} viewBox="0 0 161 194" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M160.629 0L88.5482 53.0803V101.568L81.1401 91.6626L0 10.6842V102.773L88.6142 193.745V102.724L160.629 49.8154V0Z" fill={color} />
  </svg>;


Object.assign(window, {
  Icon, IconSearch, IconBell, IconHamburger, IconHome, IconWallet, IconMe,
  IconCalendar, IconUsers, IconChat, IconShare, IconConnect, IconLock, IconTrophy,
  IconChart, IconDollar, IconCheck, IconShield, IconQR, IconActivity, IconPlus,
  IconChevR, IconChevL, IconArrowL, IconArrowUp, IconDotsH, IconClose,
  IconResize, IconReplace, IconHide, IconReset, IconMove, IconSparkles, IconSend, IconGrip, IconWhistle,
  VAIWingmark, VAIWingOnly
});