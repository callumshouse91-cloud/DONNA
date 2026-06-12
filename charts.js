/* ============================================================
   DONNA · tiny dependency-free SVG charts
   ============================================================ */

const Charts = (() => {
  const NS = "http://www.w3.org/2000/svg";

  function scale(domainMin, domainMax, rangeMin, rangeMax) {
    const d = domainMax - domainMin || 1;
    return v => rangeMin + ((v - domainMin) / d) * (rangeMax - rangeMin);
  }

  /** Multi-series line chart.
   * series: [{name, values, color, dash?}] ; labels: x labels */
  function line({ series, labels, height = 220, yFmt = v => v }) {
    const w = 640, h = height, padL = 46, padR = 12, padT = 14, padB = 26;
    const all = series.flatMap(s => s.values);
    let min = Math.min(...all), max = Math.max(...all);
    const span = max - min || 1; min -= span * 0.12; max += span * 0.12;

    const x = scale(0, labels.length - 1, padL, w - padR);
    const y = scale(min, max, h - padB, padT);

    let g = `<svg viewBox="0 0 ${w} ${h}" xmlns="${NS}" style="width:100%;height:auto">`;

    // gridlines + y labels
    for (let i = 0; i <= 3; i++) {
      const v = min + (i / 3) * (max - min);
      const yy = y(v);
      g += `<line x1="${padL}" x2="${w - padR}" y1="${yy}" y2="${yy}" stroke="#E8ECF1" stroke-width="1"/>`;
      g += `<text x="${padL - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#9AA7B3">${yFmt(Math.round(v))}</text>`;
    }
    // x labels
    labels.forEach((lb, i) => {
      g += `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" font-size="10" fill="#9AA7B3">${lb}</text>`;
    });

    series.forEach(s => {
      const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
      g += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5"
             ${s.dash ? `stroke-dasharray="${s.dash}"` : ""} stroke-linecap="round" stroke-linejoin="round"/>`;
      s.values.forEach((v, i) => {
        g += `<circle cx="${x(i)}" cy="${y(v)}" r="3.2" fill="#fff" stroke="${s.color}" stroke-width="2"/>`;
      });
    });

    return g + `</svg>`;
  }

  /** Grouped bar chart. groups: x labels; series: [{name, values, color}] */
  function bars({ series, labels, height = 220, yFmt = v => v }) {
    const w = 640, h = height, padL = 46, padR = 12, padT = 14, padB = 26;
    const all = series.flatMap(s => s.values);
    const max = Math.max(...all) * 1.15 || 1;
    const y = scale(0, max, h - padB, padT);
    const slot = (w - padL - padR) / labels.length;
    const bw = Math.min(22, (slot * 0.7) / series.length);

    let g = `<svg viewBox="0 0 ${w} ${h}" xmlns="${NS}" style="width:100%;height:auto">`;
    for (let i = 0; i <= 3; i++) {
      const v = (i / 3) * max, yy = y(v);
      g += `<line x1="${padL}" x2="${w - padR}" y1="${yy}" y2="${yy}" stroke="#E8ECF1"/>`;
      g += `<text x="${padL - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#9AA7B3">${yFmt(Math.round(v))}</text>`;
    }
    labels.forEach((lb, i) => {
      const cx = padL + slot * i + slot / 2;
      g += `<text x="${cx}" y="${h - 8}" text-anchor="middle" font-size="10" fill="#9AA7B3">${lb}</text>`;
      series.forEach((s, si) => {
        const v = s.values[i];
        const xx = cx - (series.length * bw) / 2 + si * bw;
        g += `<rect x="${xx + 1}" y="${y(v)}" width="${bw - 2}" height="${y(0) - y(v)}" rx="3" fill="${s.color}"/>`;
      });
    });
    return g + `</svg>`;
  }

  /** Donut. items: [{label, value, color}] */
  function donut({ items, size = 168, thickness = 26, centerTop = "", centerBottom = "" }) {
    const r = (size - thickness) / 2, cx = size / 2, cy = size / 2;
    const total = items.reduce((a, b) => a + b.value, 0) || 1;
    const C = 2 * Math.PI * r;
    let off = 0;
    let g = `<svg viewBox="0 0 ${size} ${size}" xmlns="${NS}" style="width:${size}px;height:${size}px">`;
    g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#EDF0F4" stroke-width="${thickness}"/>`;
    items.forEach(it => {
      const frac = it.value / total;
      g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${it.color}" stroke-width="${thickness}"
            stroke-dasharray="${frac * C} ${C}" stroke-dashoffset="${-off * C}"
            transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;
      off += frac;
    });
    g += `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="24" font-weight="600" fill="#3E4C5E" font-family="Oswald, sans-serif">${centerTop}</text>`;
    g += `<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="9.5" fill="#71808F">${centerBottom}</text>`;
    return g + `</svg>`;
  }

  return { line, bars, donut };
})();
