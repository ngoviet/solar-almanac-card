import { css } from 'lit';

// Sinh bởi: palette-axi generate --seed 25 --mode both --roles solar=80,battery=155,grid=250
// Hai màu tự chỉnh để đạt 4,5:1: --sac-dim ở chế độ sáng và --sac-band (chữ trắng trên băng đỏ).
// Tải không có màu riêng: chỉ ba nguồn cấp mang màu, chữ luôn một màu mực.
export const themeStyles = css`
  :host {
    --sac-surface: #fffaf9;
    --sac-border: #e5d3d1;
    --sac-dim: #7d5a56;
    --sac-fg: #443331;
    --sac-solar: #ac7a00;
    --sac-battery: #009655;
    --sac-grid: #0085e3;
    --sac-band: #c4302b;
    --sac-alert: #c4302b;
    --sac-on-band: #ffffff;
    color-scheme: light;
  }
  :host([data-mode='dark']) {
    --sac-surface: #2c1412;
    --sac-border: #4f2d2b;
    --sac-dim: #d6aca7;
    --sac-fg: #f2e5e3;
    --sac-solar: #e7a500;
    --sac-battery: #00ca75;
    --sac-grid: #6fb7ff;
    --sac-band: #8f1f1b;
    --sac-alert: #8f1f1b;
    --sac-on-band: #ffffff;
    color-scheme: dark;
  }
  /* band: neutral: băng đổi màu, cảnh báo vẫn đỏ nhờ --sac-alert. Chữ trắng trên băng đạt 6,3:1 và 7,9:1. */
  :host([data-band='neutral']) {
    --sac-band: #5b6068;
  }
  :host([data-mode='dark'][data-band='neutral']) {
    --sac-band: #4d5259;
  }
`;
