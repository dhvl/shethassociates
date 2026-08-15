
const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('.nav-links');
if(toggle) toggle.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const progress=document.querySelector('.progress');
window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight; progress.style.width=(h>0?(scrollY/h)*100:0)+'%';},{passive:true});
if ('IntersectionObserver' in window) { const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>obs.observe(el)); } else { document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible')); }
document.querySelectorAll('form.contact-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.innerHTML : 'Send enquiry →';
    
    let statusEl = form.querySelector('.form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'form-status';
      statusEl.style.cssText = 'margin-top: 12px; font-size: 14px; padding: 10px 14px; border-radius: 4px; font-weight: 500; transition: all 0.3s ease;';
      form.appendChild(statusEl);
    }
    statusEl.style.display = 'none';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Sending enquiry...';
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (res.ok && result.success) {
        statusEl.style.background = 'rgba(197, 160, 89, 0.15)';
        statusEl.style.color = '#c5a059';
        statusEl.style.border = '1px solid #c5a059';
        statusEl.innerText = result.message || 'Enquiry sent successfully!';
        statusEl.style.display = 'block';
        form.reset();
        setTimeout(() => {
          window.location.href = 'thank-you.html';
        }, 1200);
      } else {
        throw new Error(result.error || 'Failed to send enquiry. Please try again.');
      }
    } catch (err) {
      statusEl.style.background = 'rgba(220, 38, 38, 0.15)';
      statusEl.style.color = '#ef4444';
      statusEl.style.border = '1px solid #ef4444';
      statusEl.innerText = err.message || 'An error occurred. Please try again or email info@shethassociates.in directly.';
      statusEl.style.display = 'block';
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  });
});


// Subtle pointer glow for premium cards
if(window.matchMedia('(pointer:fine)').matches){
 document.querySelectorAll('.feature-card,.practice-tile,.profile-card,.person-card').forEach(card=>{
   card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')});
 });
}

/* V3 motion triggers */
const timelineAxis = document.querySelector('.timeline-axis');
const timelineItems = document.querySelectorAll('.reveal-timeline');
if (timelineItems.length) {
  const timelineObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('timeline-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.18, rootMargin: '0px 0px -8% 0px'});
  timelineItems.forEach((item, i) => {
    item.style.transitionDelay = `${Math.min(i * 90, 650)}ms`;
    timelineObserver.observe(item);
  });
  if (timelineAxis) {
    const axisObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) timelineAxis.classList.add('active');
      });
    }, {threshold: 0.08});
    axisObserver.observe(timelineAxis);
  }
}
const teamCards = document.querySelectorAll('.reveal-team');
if (teamCards.length) {
  const teamObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = [...teamCards];
      const i = cards.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(i * 100, 700)}ms`;
      entry.target.classList.add('team-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -6% 0px'});
  teamCards.forEach(card => teamObserver.observe(card));
}
const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('pointermove', e => {
    const x = e.clientX / window.innerWidth - .5;
    const y = e.clientY / window.innerHeight - .5;
    document.querySelectorAll('.hero-orb').forEach((orb, i) => {
      const factor = i === 0 ? 18 : -12;
      orb.style.transform = `translate3d(${x*factor}px,${y*factor}px,0)`;
    });
  });
}

/* =========================================================
   V4 — AUTOMATED INTERACTIONS & MOTION ENGINE
   ========================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('main section:not(.page-hero), .practice-detail, .strategy-card, .principle, .evolution-grid>div').forEach(el => {
    el.classList.add('auto-reveal'); io.observe(el);
  });

  // Automated number counters
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count); let started=false;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || started) return; started=true;
      if (reduce) { el.textContent=target; return; }
      const start=performance.now(), duration=1200;
      const tick=t=>{const p=Math.min((t-start)/duration,1); const e=1-Math.pow(1-p,3); el.textContent=Math.round(target*e); if(p<1)requestAnimationFrame(tick)};
      requestAnimationFrame(tick); observer.disconnect();
    }),{threshold:.5}); observer.observe(el);
  });

  // Practice accordion
  document.querySelectorAll('[data-accordion] .practice-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item=btn.closest('[data-accordion-item]');
      const was=item.classList.contains('open');
      document.querySelectorAll('[data-accordion-item].open').forEach(x=>{x.classList.remove('open');x.querySelector('.practice-trigger')?.setAttribute('aria-expanded','false')});
      if(!was){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
    });
  });

  // Team filters
  document.querySelectorAll('[data-team-filter] button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-team-filter] button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('[data-person-card]').forEach(card => {card.classList.toggle('is-hidden', f!=='all' && !card.classList.contains(f));});
  }));

  // Experience progress line + chapter activation
  const progress=document.querySelector('.timeline-progress span'); const chapters=[...document.querySelectorAll('[data-history]')];
  if(chapters.length){
    const chapterIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.2});
    chapters.forEach(c=>chapterIO.observe(c));
    const update=()=>{if(!progress)return; const rect=document.querySelector('.cinematic-timeline')?.getBoundingClientRect(); if(!rect)return; const h=rect.height-window.innerHeight*.35; const p=Math.min(1,Math.max(0,(window.innerHeight*.55-rect.top)/Math.max(h,1))); progress.style.width=(p*100)+'%'};
    window.addEventListener('scroll',update,{passive:true}); update();
  }

  // Automatic section spotlight: subtle active class based on viewport
  const sections=[...document.querySelectorAll('main section[id]')];
  if(sections.length){const sIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-focus')}),{threshold:.35});sections.forEach(s=>sIO.observe(s))}

  // Gentle cursor glow on desktop
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    const glow=document.createElement('div'); glow.className='cursor-glow'; document.body.appendChild(glow);
    window.addEventListener('pointermove',e=>{glow.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`},{passive:true});
  }
})();

/* V5 automatic page orchestration */
window.addEventListener('load', () => {
  const loader = document.querySelector('.brand-loader');
  if (loader) setTimeout(() => loader.classList.add('is-done'), 1900);
});
const pageIdentity = document.querySelector('.page-identity');
if (pageIdentity) {
  const words = pageIdentity.textContent.trim();
  pageIdentity.setAttribute('data-page-name', words);
}
const methodCards = document.querySelectorAll('.method-grid > div');
if (methodCards.length) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      methodCards.forEach((card, i) => {
        card.style.transitionDelay = `${Math.min(i * 110, 440)}ms`;
        card.classList.add('method-visible');
      });
      observer.disconnect();
    });
  }, {threshold:.15});
  io.observe(methodCards[0]);
}


/* FINAL MOBILE/ROBUST TEAM FALLBACK
   Never leave advocate profiles hidden if an observer is unavailable. */
(function () {
  const cards = document.querySelectorAll('body[data-page="people"] .team-card');
  if (!cards.length) return;

  const revealAll = () => {
    cards.forEach(card => {
      card.classList.add('team-visible');
      card.style.opacity = '1';
      card.style.visibility = 'visible';
      card.style.transform = 'none';
    });
  };

  // The CSS already guarantees visibility. This is an additional JS safety net.
  if (!('IntersectionObserver' in window)) revealAll();
  window.addEventListener('load', () => {
    setTimeout(revealAll, 1200);
  }, { once: true });
})();


/* FINAL POLICIES MOBILE FALLBACK
   Rendering of substantive policy content is independent of observers. */
(function () {
  if (!document.body || document.body.dataset.page !== 'policies') return;
  const reveal = () => {
    document.querySelectorAll('body[data-page="policies"] .auto-reveal, body[data-page="policies"] .policy-section').forEach(el => {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.transform = 'none';
    });
    document.querySelectorAll('body[data-page="policies"] main, body[data-page="policies"] main section').forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });
  };
  reveal();
  document.addEventListener('DOMContentLoaded', reveal, {once:true});
  window.addEventListener('load', reveal, {once:true});
  setTimeout(reveal, 500);
  setTimeout(reveal, 2000);
})();
