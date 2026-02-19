import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, Outfit, JetBrains_Mono, Inter } from 'next/font/google'
import Script from 'next/script'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Analytics } from '@vercel/analytics/react'
import '@/styles/globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://insanprihatin.org'),
  title: {
    default: 'Yayasan Insan Prihatin | Empowering Communities Through Compassion',
    template: '%s | Yayasan Insan Prihatin',
  },
  description:
    'Yayasan Insan Prihatin is a prestigious Malaysian foundation dedicated to community service, education, and sustainable development. Join us in making a difference.',
  keywords: [
    'Yayasan Insan Prihatin',
    'yayasan malaysia',
    'charity malaysia',
    'derma online',
    'sumbangan amal',
    'bantuan komuniti',
    'NGO malaysia',
    'badan kebajikan',
    'community service malaysia',
    'nonprofit malaysia',
    'sedekah online',
    'zakat fitrah',
    'tabung amal',
    'pertubuhan kebajikan',
    'bantuan pendidikan',
    'Malaysian foundation',
    'charity donation malaysia',
  ],
  other: {
    'geo.region': 'MY',
    'geo.placename': 'Kuala Lumpur, Malaysia',
    'geo.position': '3.139003;101.686855',
    'ICBM': '3.139003, 101.686855',
  },
  authors: [{ name: 'Yayasan Insan Prihatin' }],
  creator: 'Yayasan Insan Prihatin',
  publisher: 'Yayasan Insan Prihatin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: '/',
    siteName: 'Yayasan Insan Prihatin',
    title: 'Yayasan Insan Prihatin | Empowering Communities Through Compassion',
    description:
      'A prestigious Malaysian foundation dedicated to community service, education, and sustainable development.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yayasan Insan Prihatin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yayasan Insan Prihatin',
    description: 'Empowering communities through compassion and sustainable development.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://www.insanprihatin.org',
    languages: {
      'en': 'https://www.insanprihatin.org/en',
      'ms': 'https://www.insanprihatin.org/ms',
      'x-default': 'https://www.insanprihatin.org/en',
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2AADAD' },
    { media: '(prefers-color-scheme: dark)', color: '#1B7474' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${outfit.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* New Relic Browser Monitoring */}
        <Script
          id="new-relic"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              ;window.NREUM||(NREUM={});NREUM.init={privacy:{cookies_enabled:true},ajax:{deny_list:["bam.nr-data.net"]},distributed_tracing:{enabled:true}};NREUM.loader_config={accountID:"7688108",trustKey:"7688108",agentID:"1103478445",licenseKey:"NRJS-b34655948560c962120",applicationID:"1103478445"};NREUM.info={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",licenseKey:"NRJS-b34655948560c962120",applicationID:"1103478445",sa:1};(function(){var e,t,n={6498:function(e,t,n){"use strict";n.d(t,{Vp:function(){return c},fn:function(){return s},x1:function(){return u}});var r=n(384),i=n(8122);const o={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net"};function a(){return globalThis.NREUM||(globalThis.NREUM={}),void 0===globalThis.newrelic&&(globalThis.newrelic=globalThis.NREUM),globalThis.NREUM}function s(){let e=a();return e.o||(e.o={ST:globalThis.setTimeout,SI:globalThis.setImmediate,CT:globalThis.clearTimeout,XHR:globalThis.XMLHttpRequest,REQ:globalThis.Request,EV:globalThis.Event,PR:globalThis.Promise,MO:globalThis.MutationObserver,FETCH:globalThis.fetch,WS:globalThis.WebSocket,FP:globalThis.FinalizationRegistry}),e}function c(e,t){let n=a();n.initializedAgents??={},t.initializedAt={ms:(0,r.t)(),date:new Date},n.initializedAgents[e]=t}function u(e){let t=a();return t.initializedAgents?.[e]}s(),a().ee||(a().ee=(0,i.E)())},8122:function(e,t,n){"use strict";n.d(t,{A:function(){return c},E:function(){return u},ee:function(){return s}});var r=n(384),i=n(7494),o=Object.prototype.hasOwnProperty,a={};function s(){return function e(t){return new c(t)}()}class c{constructor(e){this.contextId=e}static instance(){return e||(e=new c("nr@context::SINGLETON_INSTANCE"))}emit(e,t,n,r,i){return!1!==a[e]&&(this.runHandlers(e,t,n,r,i),(0,i.p)(this.contextId,e).forEach((e=>{e.emit(e.eventType,t,n,r,i)}))),this}runHandlers(e,t,n,r,o){let a=(0,i.C)(this.contextId,e);for(let e=0;e<a.length;e++)try{(0,i.z)(this.contextId,a[e],r,n,...t)}catch(e){(0,i.p)(this.contextId,"internal-error").forEach((t=>{try{t.emit(t.eventType,[e,(0,r.t)()])}catch(e){}}))}}get(e){return this.contextId&&a[this.contextId]?.get(e)}set(e,t){return this.contextId&&(a[this.contextId]??=new Map,a[this.contextId].set(e,t)),t}context(e){return e?(a[e]=a[e]??new Map,new c(e)):this}}function u(){return new c}},7494:function(e,t,n){"use strict";n.d(t,{C:function(){return s},p:function(){return a},z:function(){return c}});var r=n(384),i={};function o(e){return i[e]=i[e]||{wildcard:[],specific:{}}}function a(e,t){const n=o(e);return n.specific[t]||[]}function s(e,t){const n=o(e);return[...n.specific[t]||[],...n.wildcard]}function c(e,t,n,i,...o){const a=t.handler;if(!a)return;const s=(0,r.t)();try{return a.apply(n,o)}finally{}}},384:function(e,t,n){"use strict";n.d(t,{Ht:function(){return s},t:function(){return a}});var r=n(6498);const i=()=>Date.now()-(0,r.fn)().o?.PO||(o=Date.now(),o-performance.timeOrigin);var o;const a=i,s=()=>Math.floor(i())},909:function(e,t,n){"use strict";n.d(t,{a:function(){return o},o:function(){return i}});var r=n(6498);const i=(0,r.fn)(),o=e=>(0,r.x1)(e)||{}},5217:function(e,t,n){"use strict";n.d(t,{D:function(){return i}});var r=n(909);const i=(0,r.o)().info||{}},7864:function(e,t,n){"use strict";n.d(t,{D:function(){return i}});var r=n(909);const i=(0,r.o)().init||{}},5546:function(e,t,n){"use strict";n.d(t,{D:function(){return i}});var r=n(909);const i=(0,r.o)().loader_config||{}},6154:function(e,t,n){"use strict";n.d(t,{A:function(){return r}});const r="1.309.0"}},r={};function i(e){var t=r[e];if(void 0!==t)return t.exports;var o=r[e]={exports:{}};return n[e](o,o.exports,i),o.exports}i.d=function(e,t){for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};var o=i(6498),a=i(5217),s=i(5546),c=i(6154);const u="PROD";(0,o.Vp)(a.D.applicationID,{agentVersion:c.A,...s.D});const d="undefined"!=typeof window;var l=n=6498;function f(){return(f=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function g(e,t){return e.apply(t,Array.prototype.slice.call(arguments,2))}const h=Object.prototype.hasOwnProperty,p=globalThis?.crypto;function v(e,t=16){let n="";const r=p?.getRandomValues(new Uint8Array(t));if(r)for(let e=0;e<t;e++)n+="0123456789ABCDEF"[r[e]>>4&15]+"0123456789ABCDEF"[15&r[e]];return n}const m=i(384),b=i(909);e=v(32);const y=e,w=(0,m.t)(),E={agentIdentifier:y,ee:void 0,query:void 0,config:{},runtime:{},urlGroupingConfig:{enabled:!1,rewritePatterns:[]}};(0,o.Vp)(y,E);const A=(0,b.o)(y),x=i(7864);t={};const _={stn:[],err:[],ins:[],spa:[],sr:[]};function T(e,t){for(let n of(_.stn.push(e),_.err.push(e),_.ins.push(e),t.q))switch(n.n){case"sts":_.spa.push(n.a);break;case"err":_.err.push(n.a);break;case"ins":_.ins.push(n.a);break;case"feat":_.spa.push(n.a),_.sr.push(n.a);break;case"stn":_.stn.push(n.a);break;case"fn":_.stn.push(n.a)}}const S=()=>_.stn,R=()=>_.err,N=()=>_.ins,O=()=>_.spa,I=()=>_.sr;var C={};const D=/([^?#]*)(\\?[^#]*)?(#.*)?/;function k(e){return D.exec(e)?.slice(1)||[]}var P;!function(e){e.ERROR="ERROR",e.WARN="WARN",e.INFO="INFO",e.DEBUG="DEBUG",e.TRACE="TRACE"}(P||(P={}));const L=()=>"undefined"==typeof console,j={};function M(e,t,n=P.ERROR){if(L())return;const r=j[e]||(j[e]=new Set);r.has(t)||(r.add(t),function(e,t){switch(L(),e){case P.ERROR:return void console.error(t);case P.WARN:return void console.warn(t);case P.INFO:return void console.info(t);case P.DEBUG:case P.TRACE:return void console.debug(t)}}(n,"NR Agent: "+t))}const H=new Set;function B(){const e="NRBA";for(const t of Object.values(globalThis[e]??{}))T(t.info,t);delete globalThis[e],H.forEach((e=>e())),H.clear()}d&&(B(),document.readyState&&"loading"!==document.readyState||document.addEventListener("DOMContentLoaded",B))})();
            `,
          }}
        />
        {/* Preconnect to external resources for faster loading (LCP optimization) */}
        <link rel="preconnect" href="https://sgp.cloud.appwrite.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://sgp.cloud.appwrite.io" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
