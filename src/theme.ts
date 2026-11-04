import { css } from 'lit';

// Sinh bởi: palette-axi generate --seed 25 --mode both --roles solar=80,battery=155,grid=250
// Hai màu tự chỉnh để đạt 4,5:1: --sfc-dim ở chế độ sáng và --sfc-band (chữ trắng trên băng đỏ).
// Tải không có màu riêng: chỉ ba nguồn cấp mang màu, chữ luôn một màu mực.
export const themeStyles = css`
  :host {
    --sfc-surface: #fffaf9;
    --sfc-border: #e5d3d1;
    --sfc-dim: #7d5a56;
    --sfc-fg: #443331;
    --sfc-solar: #ac7a00;
    --sfc-battery: #009655;
    --sfc-grid: #0085e3;
    --sfc-band: #c4302b;
    --sfc-on-band: #ffffff;
    color-scheme: light;
  }
  :host([data-mode='dark']) {
    --sfc-surface: #2c1412;
    --sfc-border: #4f2d2b;
    --sfc-dim: #d6aca7;
    --sfc-fg: #f2e5e3;
    --sfc-solar: #e7a500;
    --sfc-battery: #00ca75;
    --sfc-grid: #6fb7ff;
    --sfc-band: #8f1f1b;
    --sfc-on-band: #ffffff;
    color-scheme: dark;
  }
`;
