export function makeTypeAvatar(code: string, color: string, width = 600, height = 450): string {
  const safeCode = String(code || '').slice(0, 3)
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${color}' stop-opacity='0.92'/>
        <stop offset='100%' stop-color='${color}' stop-opacity='0.8'/>
      </linearGradient>
    </defs>
    <rect x='0' y='0' width='100%' height='100%' rx='24' fill='url(#g)'/>
    <text x='50%' y='56%' text-anchor='middle' font-size='${Math.round(height*0.38)}' font-weight='700' fill='#fff' font-family='-apple-system,system-ui,SF Pro Display'>${safeCode}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}


