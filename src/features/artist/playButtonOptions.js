// Первые 3 бесплатно, остальные премиум
export const PLAY_BUTTON_OPTIONS = [
  {
    id: 'default',
    name: 'Базовый (стандартная иконка)',
    component: 'play-button-default',
    html: ``, // Пустой - показываем только стандартную иконку
    premium: false, // Первый - бесплатный
  },
  {
    id: 'cksunandh',
    name: 'Orbital',
    component: 'play-button-cksunandh',
    html: `<div class="orbital">
  <div class="ringOne"></div>
  <div class="ringTwo"></div>
  <div class="ringThree"></div>
  <div class="core"></div>
  <div class="spin"></div>
</div>`,
    premium: false, // Второй - бесплатный
  },
  {
    id: 'marcelodolza',
    name: 'Ripple Loader',
    component: 'play-button-marcelodolza',
    html: `<div class="loader">
  <div style="--i: 1; --inset:44%" class="box">
    <div class="logo">
      <svg class="svg" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z"></path>
        <path d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z"></path>
        <path d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z"></path>
      </svg>
    </div>
  </div>
  <div style="--i: 2; --inset:40%" class="box"></div>
  <div style="--i: 3; --inset:36%" class="box"></div>
  <div style="--i: 4; --inset:32%" class="box"></div>
  <div style="--i: 5; --inset:28%" class="box"></div>
  <div style="--i: 6; --inset:24%" class="box"></div>
  <div style="--i: 7; --inset:20%" class="box"></div>
  <div style="--i: 8; --inset:16%" class="box"></div>
</div>`,
    premium: false, // Третий - бесплатный
  },
  {
    id: 'charandeepsingh01',
    name: 'Red Spinner',
    component: 'play-button-charandeepsingh01',
    html: `<div class="loader"></div>`,
    premium: true, // Премиум
  },
  {
    id: 'nawsome',
    name: 'Goo Preloader',
    component: 'play-button-nawsome',
    premium: true, // Премиум
    html: `<svg class="svg_preloader" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 248 248" style="enable-background:new 0 0 248 248;" xml:space="preserve">
<filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -20"></feColorMatrix>
</filter>
<circle stroke="#fff" fill="none" stroke-width="3" cx="124" cy="124" r="120"></circle>
<g id="shape" filter="url(#goo)">
	<circle stroke="#fff" fill="none" stroke-width="10" cx="124" cy="124" r="105"></circle>
	<circle fill="#fff" cx="0" cy="0" r="36" transform="translate(124 124)">
		<animateTransform attributeName="transform" type="scale" additive="sum" values="1.3;0.55;0.55;1.3" keyTimes="0;0.4;0.6;1" dur="2s" repeatCount="indefinite"></animateTransform> 
	</circle>
	<circle fill="#fff" cx="0" cy="0" r="22">
		<animateMotion path="M124.1,124l-14.9-14.9c-22.3-22.3-2.5-60.3,28.4-54.4c13.3,2.6,26.1,9,36.4,19.4
		c10.1,10.1,16.5,22.4,19.2,35.4c6.5,31.3-31.7,51.9-54.3,29.3L124.1,124z" dur="2s" repeatCount="indefinite"></animateMotion>
	</circle>
	<circle fill="#fff" cx="0" cy="0" r="22">
		<animateMotion path="M124.1,124l15.2,15.2c22.2,22.2,2.5,60-28.3,54.2c-13.5-2.5-26.4-9-36.8-19.4c-8.9-8.9-14.9-19.5-18-30.7
		c-9.1-32.5,31.4-55.7,55.2-31.8L124.1,124z" dur="2s" repeatCount="indefinite"></animateMotion>
	</circle>
</g>
</svg>`
  },
  {
    id: 'jkhuger',
    name: '3D Spinner',
    component: 'play-button-jkhuger',
    html: `<div class="loader"></div>`,
    premium: true, // Премиум
  },
  {
    id: 'adamgiebl',
    name: 'Radar',
    component: 'play-button-adamgiebl',
    html: `<div class="loader">
  <span></span>
</div>`,
    premium: true, // Премиум
  },
  {
    id: 'know_3739',
    name: 'Ripple Green',
    component: 'play-button-know_3739',
    premium: true, // Премиум
    html: `<div class="loader">
  <div class="box">
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 94 94" class="svg">
        <path d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z"></path>
        <path d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z"></path>
        <path d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z"></path>
      </svg>
    </div>
  </div>
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
</div>`
  },
  {
    id: 'elijahgummer-complex',
    name: '3D Complex',
    component: 'play-button-elijahgummer-complex',
    premium: true, // Премиум
    html: `<div class="mainWrap">
  <div class="wrapper">
    <div class="c1">
      <div class="c2">
        <div class="c3">
          <div class="rect1">
            <div class="miniC">
              <div class="miniC1"></div>
              <div class="miniC2"></div>
              <div class="miniC3"></div>
              <div class="miniC4"></div>
            </div>
            <div class="c4">
              <div class="rect2"><div class="rect3"></div></div>
            </div>
            <div class="c5"></div>
            <div class="c6"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: 'elijahgummer-hole',
    name: 'Hole',
    component: 'play-button-elijahgummer-hole',
    premium: true, // Премиум
    html: `<div class="hole">
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
</div>`
  },
  {
    id: 'smit-prajapati',
    name: 'Ripple Grey',
    component: 'play-button-smit-prajapati',
    premium: true, // Премиум
    html: `<div class="loader">
  <div class="box">
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 94 94" class="svg">
        <path d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z"></path>
        <path d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z"></path>
        <path d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z"></path>
      </svg>
    </div>
  </div>
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
  <div class="box"></div>
</div>`
  },
  {
    id: 'z4drus',
    name: 'Orbit Dots',
    component: 'play-button-z4drus',
    premium: true, // Премиум
    html: `<div class="loader">
  <div class="loader__inner"></div>
  <div class="loader__orbit">
    <div class="loader__dot"></div>
    <div class="loader__dot"></div>
    <div class="loader__dot"></div>
    <div class="loader__dot"></div>
  </div>
</div>`
  },
  {
    id: 'andrew-manzyk',
    name: 'Triangle Mask',
    component: 'play-button-andrew-manzyk',
    premium: true, // Премиум
    html: `<div class="loader">
  <svg width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <mask id="clipping">
        <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
        <polygon points="25,25 75,25 50,75" fill="white"></polygon>
        <polygon points="50,25 75,75 25,75" fill="white"></polygon>
        <polygon points="35,35 65,35 50,65" fill="white"></polygon>
        <polygon points="35,35 65,35 50,65" fill="white"></polygon>
        <polygon points="35,35 65,35 50,65" fill="white"></polygon>
        <polygon points="35,35 65,35 50,65" fill="white"></polygon>
      </mask>
    </defs>
  </svg>
  <div class="box"></div>
</div>`
  },
  {
    id: 'escannord',
    name: 'Rotating Balls',
    component: 'play-button-escannord',
    premium: true, // Премиум
    html: `<div class="loader">
  <span style="--delay:1" class="ball"></span>
  <span style="--delay:2" class="ball"></span>
  <span style="--delay:3" class="ball"></span>
  <span style="--delay:4" class="ball"></span>
  <span style="--delay:5" class="ball"></span>
  <span style="--delay:6" class="ball"></span>
  <span style="--delay:7" class="ball"></span>
  <span style="--delay:8" class="ball"></span>
</div>`
  },
  {
    id: 'elijahgummer-wave',
    name: 'Wave Equalizer',
    component: 'play-button-elijahgummer-wave',
    premium: true, // Премиум
    html: `<div class="wrapper">
  <div class="container">
    <div class="wave">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
    <div data-level="1" class="wave">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
    <div data-level="2" class="wave">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
    <div data-level="3" class="wave">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  </div>
</div>`
  }
];

