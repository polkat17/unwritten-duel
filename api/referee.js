/* The Unwritten Duel: spell referee for the website copy of the game.
   Holds the owner's Anthropic API key (env ANTHROPIC_API_KEY, never sent to the browser) and only answers players who
   know the passcode (env PLAY_CODE). Optional env ANTHROPIC_MODEL overrides the model. */
const hits=new Map();
const LIMIT=40,WINDOW=10*60*1000;
module.exports=async(req,res)=>{
  if(req.method!=="POST"){res.status(405).json({error:"method_not_allowed"});return;}
  const key=process.env.ANTHROPIC_API_KEY,code=process.env.PLAY_CODE;
  if(!key||!code){res.status(503).json({error:"not_setup"});return;}
  let body=req.body;
  if(typeof body==="string"){try{body=JSON.parse(body);}catch(e){body={};}}
  body=body||{};
  if(String(body.code||"").trim()!==String(code).trim()){res.status(401).json({error:"bad_code"});return;}
  const prompt=String(body.prompt||"");
  if(prompt.length<80||prompt.length>20000||!prompt.startsWith("You are the referee of a ")){res.status(400).json({error:"bad_request"});return;}
  const ip=String(req.headers["x-forwarded-for"]||"").split(",")[0].trim()||"?",now=Date.now();
  const list=(hits.get(ip)||[]).filter(t=>now-t<WINDOW);
  if(list.length>=LIMIT){res.status(429).json({error:"rate_limited"});return;}
  list.push(now);hits.set(ip,list);
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"x-api-key":key,"anthropic-version":"2023-06-01","content-type":"application/json"},
      body:JSON.stringify({model:process.env.ANTHROPIC_MODEL||"claude-haiku-5-5",max_tokens:800,messages:[{role:"user",content:prompt}]})});
    if(!r.ok){const t=await r.text();console.error("anthropic",r.status,t.slice(0,500));res.status(r.status===429?429:502).json({error:r.status===429?"rate_limited":"upstream"});return;}
    const j=await r.json();
    res.status(200).json({text:(j.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("")});
  }catch(e){console.error("referee",e&&e.message);res.status(502).json({error:"upstream"});}
};
