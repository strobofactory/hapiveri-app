'use client';

import { useRef } from 'react';
import type { NewsItem } from '@/lib/shopify';
import { formatDate } from '@/lib/shopify';

export default function NewsCarousel({ items }: { items: NewsItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const step = 320;

  function scroll(dir: -1 | 1) {
    ref.current?.scrollBy({ left: step * dir, behavior: 'smooth' });
  }

  if (items.length === 0) return null;

  return (
    <>
      <div className="news-head fade d3">
        <div className="label-stack">
          <div className="label-rule" />
          <div className="label-text">
            NEWS
            <br />
            FROM HAPIVERI
          </div>
        </div>
        <div className="nav-btns">
          <button className="nav-btn" onClick={() => scroll(-1)} aria-label="前のお知らせ">
            <i className="ti ti-arrow-left" aria-hidden="true" />
          </button>
          <button className="nav-btn" onClick={() => scroll(1)} aria-label="次のお知らせ">
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="carousel fade d3" ref={ref}>
        {items.map((item) => (
          <a key={item.id} href={item.url} className="news-card" target="_blank" rel="noopener noreferrer">
            <div className="news-thumb">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" />
              ) : (
                <span className="ph">NO IMAGE</span>
              )}
              {item.tag && <span className="news-tag">{item.tag}</span>}
            </div>
            <div className="news-body">
              <div className="news-date">{formatDate(item.publishedAt)}</div>
              <div className="news-title">{item.title}</div>
              <div className="news-more">
                READ MORE
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
