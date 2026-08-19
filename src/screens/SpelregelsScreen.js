import { useState } from 'react';
import ZenPaper, { ZEN_STYLE } from '../components/ZenPaper';

export default   function SpelregelsScreen({ th, go, S, themeName }) {
    const [lang, setLang] = useState("nl");
    const [activeGame, setActiveGame] = useState("bollen");

    const rules = {
      bollen: {
        nl: {
          title: "Bollen",
          intro: "Bollen is een biedspel waarbij je exact het aantal slagen moet voorspellen dat je gaat winnen. Raad je het goed? Dan scoor je punten. Mis je? Dan krijg je een bol van -5!",
          sections: [
            { heading: "Rondes", body: "Het spel heeft 17 rondes: 1-2-3-4-5-6-7-8T-8-8T-7-6-5-4-3-2-1 kaarten per speler. Alle rondes hebben een troefkleur, behalve ronde 9 (de middelste ronde met 8 kaarten zonder troef)." },
            { heading: "Kaarten per spelersaantal", body: "Het gebruikte kaartdek hangt af van het aantal spelers (altijd de hoogste kaarten):\n2 spelers: A t/m J (16 kaarten)\n3 spelers: A t/m 9 (24 kaarten)\n4 spelers: A t/m 7 (32 kaarten)\n5 spelers: A t/m 5 (40 kaarten)\n6 spelers: A t/m 3 (48 kaarten)" },
            { heading: "Troef & ongebruikte kaarten", body: "In rondes met 8 kaarten zijn alle kaarten verdeeld. De troefkaart wordt bepaald door de bovenste kaart van het resterende stapeltje om te draaien. In alle andere rondes met troef geldt dezelfde methode." },
            { heading: "Troef spelen", body: "Je mag alleen een troefkaart spelen als je de gevraagde kleur niet hebt. Je mag niet ondertroefen – tenzij de gevraagde kleur zelf troef is, of je geen andere keuze hebt." },
            { heading: "Dealer & biedvolgorde", body: "Na elke ronde schuift de dealer één plek met de klok mee. De speler links van de dealer biedt als eerste." },
            { heading: "Bieden", body: "Elke speler biedt hoeveel slagen hij verwacht te winnen. In ronde 1 en ronde 17 mag het totaal van alle biedingen gelijk zijn aan het aantal beschikbare slagen. In alle andere rondes moet het totaal minstens 1 hoger of lager zijn dan het aantal slagen – de dealer past als laatste zijn bod aan." },
            { heading: "Scoren", body: "Raad je het exact? Dan scoor je punten gelijk aan je bod. Bid je 0 en win je geen slag? Dan scoor je 0 punten (geen winst, geen verlies). Zit je er naast? Dan krijg je een bol: -5 punten." },
            { heading: "Iedereen fout", body: "Als alle spelers in dezelfde ronde een bol halen (-5 punten), wordt de ronde volledig overgespeeld: biedingen worden gewist en iedereen biedt opnieuw." },
            { heading: "Winnaar", body: "Na 17 rondes wint de speler met de hoogste score." },
          ],
        },
        en: {
          title: "Bollen",
          intro: "Bollen is a bidding game where you must predict exactly how many tricks you will win. Guess right and score points. Guess wrong and you get a sphere worth -5!",
          sections: [
            { heading: "Rounds", body: "The game has 17 rounds: 1-2-3-4-5-6-7-8T-8-8T-7-6-5-4-3-2-1 cards per player. Every round has a trump suit except round 9 (the middle round with 8 cards and no trump)." },
            { heading: "Cards per player count", body: "The deck used depends on the number of players (always the highest cards):\n2 players: A to J (16 cards)\n3 players: A to 9 (24 cards)\n4 players: A to 7 (32 cards)\n5 players: A to 5 (40 cards)\n6 players: A to 3 (48 cards)" },
            { heading: "Trump & undealt cards", body: "In rounds with 8 cards all cards are dealt. The trump suit is determined by flipping the top card of the remaining undealt stack. The same method applies in all other trump rounds." },
            { heading: "Playing trump", body: "You may only play a trump card when you do not have the led suit. You are not allowed to under-trump – unless the led suit itself is trump, or you have no other card to play." },
            { heading: "Dealer & bidding order", body: "After each round the dealer moves one seat clockwise. The player to the left of the dealer bids first." },
            { heading: "Bidding", body: "Each player bids how many tricks they expect to win. In round 1 and round 17 the total of all bids may equal the number of available tricks. In all other rounds the total must be at least 1 above or below the number of tricks – the dealer adjusts their bid last." },
            { heading: "Scoring", body: "Guess exactly right? You score points equal to your bid. Bid 0 and win no tricks? You score 0 points (no gain, no loss). Wrong? You receive a sphere: -5 points." },
            { heading: "Everyone wrong", body: "If every player scores a sphere (-5) in the same round, the round is fully replayed: all bids are cleared and everyone bids again." },
            { heading: "Winner", body: "After 17 rounds the player with the highest score wins." },
          ],
        },
      },
      toepen: {
        nl: {
          title: "Toepen",
          intro: "Toepen is een snel kaartspel met 4 kaarten per speler. Verzamel zo min mogelijk punten. Kom je op 14 dan zit je op 'Pelt' / 'Armoe' – bij 15 punten ben je uitgeschakeld!",
          sections: [
            { heading: "Kaartwaarden (hoog → laag)", body: "10 · 9 · 8 · 7 · A · K · Q · J" },
            { heading: "Begin van de ronde", body: "De speler links van de dealer begint en bepaalt welke kleur er gespeeld wordt. Je bent verplicht de gevraagde kleur te volgen. Heb je die kleur niet? Dan mag je een andere kleur spelen." },
            { heading: "Slagen winnen", body: "De hoogste kaart van de gevraagde kleur wint de slag. De winnaar van de slag bepaalt welke kleur de volgende slag gespeeld wordt." },
            { heading: "Einde van de ronde", body: "De speler die de laatste slag wint, wint de ronde – hij krijgt 0 punten en wordt dealer voor de volgende ronde. De verliezende spelers krijgen 1 punt, plus 1 extra punt voor elke Toep waarvoor ze in het spel zijn gebleven." },
            { heading: "Boer wint de ronde", body: "Wint iemand de ronde met een Boer (J)? Dan krijgt de verliezende speler dubbele punten." },
            { heading: "Toepen!", body: "Als je verwacht de ronde te winnen, mag je op de tafel kloppen ('Toepen'). De inzet wordt verhoogd met 1 punt. Andere spelers kiezen: meespelen voor de nieuwe inzet, of stoppen en het huidige puntenaantal betalen. Dezelfde speler mag niet twee keer achter elkaar Toepen." },
            { heading: "Pelt / Armoe (14 punten)", body: "Heeft een speler 14 punten, dan mogen de overige spelers vóór de ronde kiezen: stoppen voor 1 punt, of doorspelen voor 2 punten. Er mag in deze ronde niet Getoeped worden." },
            { heading: "Vuile Was", body: "Krijg je 4 kaarten die allemaal een Aas of lager zijn (of een 7 of lager – af te spreken vóór het spel), dan mag je 'Vuile Was' roepen. Leg je kaarten met de achterkant omhoog in het midden en noteer de melding. Bluffen is toegestaan. Andere spelers mogen je kaarten controleren als ze je niet geloven. Kloppen ze? Dan krijgt de controlerende speler 1 extra punt en jij krijgt nieuwe kaarten. Bluf je? Dan speel je verder met je huidige kaarten én krijg je 1 extra punt." },
            { heading: "Punten & Uitschakeling", body: "Bij 15 punten ben je uitgeschakeld. De laatste speler die nog in het spel is, wint." },
          ],
        },
        en: {
          title: "Toepen",
          intro: "Toepen is a fast card game with 4 cards per player. Collect as few points as possible. At 14 points you are on 'Pelt' / 'Armoe' – at 15 points you are eliminated!",
          sections: [
            { heading: "Card order (high → low)", body: "10 · 9 · 8 · 7 · A · K · Q · J" },
            { heading: "Start of a round", body: "The player to the left of the dealer starts and chooses which suit is played. You must follow the led suit. Only if you don't have that suit may you play a different one." },
            { heading: "Winning tricks", body: "The highest card of the led suit wins the trick. The trick winner decides which suit is led next." },
            { heading: "End of a round", body: "The player who wins the last trick wins the round – they score 0 points and become dealer for the next round. Losing players score 1 point, plus 1 extra point for every Toep they stayed in during the round." },
            { heading: "Winning with a Jack", body: "If a player wins the round with a Jack (J), the losing player receives double points." },
            { heading: "Toepen!", body: "If you expect to win the round, knock on the table ('Toepen'). The stake increases by 1 point. Other players choose: stay in and play for the higher stake, or leave and pay the current point total. The same player cannot Toep twice in a row." },
            { heading: "Pelt / Armoe (14 points)", body: "When a player reaches 14 points, before the next round all other players may choose: fold for 1 point, or play for 2 points. No one may Toep during this round." },
            { heading: "Dirty Laundry (Vuile Was)", body: "If you receive 4 cards that are all Ace or lower, or all 7 or lower (agreed before the game), you may call 'Vuile Was'. Place your cards face-down in the centre and note the claim. Bluffing is allowed. Other players may check your cards if they don't believe you. If you were honest, the checking player gets 1 extra point and you receive new cards. If you were bluffing, you keep your cards and receive 1 extra point." },
            { heading: "Points & Elimination", body: "At 15 points you are eliminated. The last player remaining wins the game." },
          ],
        },
      },
    };

    const current = rules[activeGame][lang];

    return (
      <div style={{...S.app, minHeight:"100dvh"}}>
        {themeName==="zen"&&<><style>{ZEN_STYLE}</style><ZenPaper/></>}
        <div style={S.wrap}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderBottom:`1px solid ${th.border}`}}>
            <button style={S.backBtn} onClick={()=>go("home")}>‹</button>
            <h2 style={{...S.title,flex:1}}>Spelregels</h2>
            <button
              onClick={()=>setLang(l=>l==="nl"?"en":"nl")}
              style={{background:"transparent",border:`1px solid ${th.border}`,borderRadius:6,color:th.gold,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:1,fontFamily:th.font}}
            >{lang==="nl"?"EN":"NL"}</button>
          </div>

          <div style={{display:"flex",gap:8,padding:"12px 16px 0"}}>
            {["bollen","toepen"].map(g=>{
              const isAct = activeGame===g;
              const isZenAct = isAct && themeName==="zen";
              return (
                <button key={g} onClick={()=>setActiveGame(g)} style={{flex:1,padding:"10px 0",background:isZenAct?"transparent":isAct?th.gold:"transparent",border:`1px solid ${isZenAct?"#8b1a1a":isAct?th.gold:th.border}`,borderRadius:6,color:isZenAct?"#8b1a1a":isAct?th.bg:th.gold,fontSize:13,fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:2,fontFamily:th.font}}>{g}</button>
              );
            })}
          </div>

          <div style={{padding:"16px 16px 40px"}}>
            <div style={{...S.card,marginBottom:12,padding:"18px"}}>
              <div style={{fontSize:20,fontWeight:700,color:th.gold,letterSpacing:3,textTransform:"uppercase",fontFamily:th.titleFont,marginBottom:10}}>{current.title}</div>
              <div style={{fontSize:13,color:th.textMid,lineHeight:1.6}}>{current.intro}</div>
            </div>
            {current.sections.map(sec=>(
              <div key={sec.heading} style={{...S.card,marginBottom:8,padding:"14px 18px"}}>
                <div style={{fontSize:12,fontWeight:700,color:th.gold,letterSpacing:2,textTransform:"uppercase",fontFamily:th.titleFont,marginBottom:6}}>{sec.heading}</div>
                <div style={{fontSize:13,color:th.text,lineHeight:1.7}}>{sec.body.split("\n").map((line,i,arr)=><span key={i}>{line}{i<arr.length-1&&<br/>}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
