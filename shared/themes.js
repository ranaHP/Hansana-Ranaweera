export const THEMES = {
  original: { name: 'Systems Garden', colors: { page:'#f5f7f8', field:'#e5e9e7', paper:'#ffffff', ink:'#18263b', muted:'#586577', blue:'#345de3', line:'#d3dcd9', mint:'#9ed8bc', hero:'#eaf0ed', soft:'#e5ebe8' } },
  halloween: { name:'Halloween', colors:{ page:'#100e19',field:'#21192e',paper:'#271f33',ink:'#fff1df',muted:'#c4b5cb',blue:'#f1ab6b',line:'#49364f',mint:'#bea0cd',hero:'#241c31',soft:'#34243e' } },
  christmas: { name:'Christmas', colors:{ page:'#f6f8f4',field:'#e0eae3',paper:'#ffffff',ink:'#183c32',muted:'#5e7168',blue:'#ad3340',line:'#cbdcd1',mint:'#87bc9b',hero:'#e7efe9',soft:'#dce9e0' } },
  custom: { name:'Custom', colors:{} }
};
export function resolveTheme(appearance,date=new Date()) {
  let preset=appearance.preset;
  if(appearance.schedule.enabled){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:appearance.schedule.timezone,month:'2-digit',day:'2-digit'}).formatToParts(date);
    const stamp=parts.find(p=>p.type==='month').value+'-'+parts.find(p=>p.type==='day').value;
    const rule=appearance.schedule.rules.find(r=>r.enabled&&(r.start<=r.end?(stamp>=r.start&&stamp<=r.end):(stamp>=r.start||stamp<=r.end)));
    if(rule)preset=rule.theme;
  }
  return {preset,colors:preset==='custom'?appearance.customColors:THEMES[preset].colors};
}
