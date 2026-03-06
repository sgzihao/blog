import"./hoisted.DuoHcRRy.js";const m="sg-primary-mistake-bank-v1",g=document.getElementById("level"),y=document.getElementById("subject"),k=document.getElementById("goal"),f=document.getElementById("generate-plan"),E=document.getElementById("study-plan"),h=document.getElementById("study-plan-content"),x=document.getElementById("mistake-subject"),l=document.getElementById("mistake-topic"),d=document.getElementById("mistake-detail"),v=document.getElementById("save-mistake"),b=document.getElementById("clear-mistakes"),i=document.getElementById("mistake-list"),u=document.getElementById("practice-output");function o(){try{const e=localStorage.getItem(m);return e?JSON.parse(e):[]}catch{return[]}}function p(e){localStorage.setItem(m,JSON.stringify(e))}function a(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function w(e,t){return e==="Math"?[`Warm-up: 5 ${t} arithmetic questions`,"Concept review: 10 minutes with worked examples","Error correction: explain each step aloud"]:e==="English"?[`Read a short ${t} passage and summarize in 3 lines`,"Vocabulary drill: 8 words with sentence writing","Grammar check: find and fix 5 sentence errors"]:[`Review one ${t} science concept map`,"Use CER method (Claim-Evidence-Reasoning) for one question","Draw one labelled diagram from memory"]}function I(){const e=g?.value||"P1",t=y?.value||"Math",s=(k?.value||"").trim()||"General revision",n=w(t,e);h.innerHTML=`
      <p><strong>Focus:</strong> ${a(s)}</p>
      <ul class="list-disc pl-5 space-y-1 text-slate-300">
        ${n.map(r=>`<li>${a(r)}</li>`).join("")}
      </ul>
      <p class="text-emerald-300"><strong>AI tip:</strong> After each question, ask "Why is this correct?" before checking answers.</p>
    `,E.classList.remove("hidden")}function $(e){const t=e.subject,s=a(e.topic),n=a(e.detail);return t==="Math"?`
        <p><strong>Target:</strong> ${s}</p>
        <p class="mt-2"><strong>Fix strategy:</strong> Write units first, solve step-by-step, then check if answer size makes sense.</p>
        <p class="mt-2"><strong>Mini practice:</strong> Solve 3 similar questions and explain your final step in words.</p>
        <p class="mt-2 text-slate-400"><strong>From mistake:</strong> ${n}</p>
      `:t==="English"?`
        <p><strong>Target:</strong> ${s}</p>
        <p class="mt-2"><strong>Fix strategy:</strong> Read sentence aloud, identify tense/subject, then rewrite correctly.</p>
        <p class="mt-2"><strong>Mini practice:</strong> Correct 5 sentences and create 2 original examples.</p>
        <p class="mt-2 text-slate-400"><strong>From mistake:</strong> ${n}</p>
      `:`
      <p><strong>Target:</strong> ${s}</p>
      <p class="mt-2"><strong>Fix strategy:</strong> Use key words in question to choose concept, then support with one evidence.</p>
      <p class="mt-2"><strong>Mini practice:</strong> Answer 2 open questions using Claim-Evidence-Reasoning format.</p>
      <p class="mt-2 text-slate-400"><strong>From mistake:</strong> ${n}</p>
    `}function c(){const e=o();if(!e.length){i.innerHTML='<p class="text-sm text-slate-500">No mistakes yet. Add one after homework or tests.</p>';return}i.innerHTML=e.map(t=>`
          <button class="w-full text-left rounded-xl border border-surface-600 bg-surface-800/50 p-3 hover:border-accent-cyan/30 transition-colors" data-id="${t.id}">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-cyan-300">${a(t.subject)}</span>
              <span class="text-xs text-slate-500">${new Date(t.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="text-sm text-white mt-1">${a(t.topic)}</p>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">${a(t.detail)}</p>
          </button>
        `).join(""),i.querySelectorAll("[data-id]").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-id"),n=o().find(r=>r.id===s);n&&(u.innerHTML=$(n))})})}f?.addEventListener("click",I);v?.addEventListener("click",()=>{const e=x?.value||"Math",t=(l?.value||"").trim(),s=(d?.value||"").trim();if(!t||!s){alert("Please enter both topic and mistake details.");return}const r=[{id:String(Date.now()),subject:e,topic:t,detail:s,createdAt:new Date().toISOString()},...o()].slice(0,100);p(r),l.value="",d.value="",c()});b?.addEventListener("click",()=>{p([]),u.textContent="No mistake selected yet.",c()});c();
