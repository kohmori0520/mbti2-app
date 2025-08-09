/* eslint-disable */
import React from 'react'
import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge'
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || '次世代タイプ診断'
  const subtitle = searchParams.get('subtitle') || 'あなたのタイプは…'
  const accent = searchParams.get('accent') || '#007aff'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: '#fff', color: '#1d1d1f', padding: '48px', fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif'
        }}
      >
        <div style={{ fontSize: 28, color: '#666', marginBottom: 12 }}>{subtitle}</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
        <div style={{ marginTop: 24, height: 8, width: 600, background: '#eee', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '66%', background: accent }} />
        </div>
        <div style={{ marginTop: 24, fontSize: 20, color: '#666' }}>next-gen personality test</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}


