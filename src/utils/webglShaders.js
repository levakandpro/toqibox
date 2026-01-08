/**
 * WebGL шейдеры для фонов
 * Адаптированы из ShaderToy формата для WebGL
 */

// Вершинный шейдер (общий для всех)
const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Фрагментные шейдеры для каждого фона
const FRAGMENT_SHADERS = {
  "tlVGDt": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.5;
  vec3 col = vec3(0.0);
  
  for (float i = 0.0; i < 3.0; i++) {
    float d = length(uv - vec2(sin(t + i * 2.0), cos(t + i * 2.0)) * 0.3);
    col += vec3(0.3, 0.5, 0.8) / (1.0 + d * 10.0);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`,
  "3l23Rh": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  float t = u_time * 1.2;
  vec3 col = vec3(0.0);
  
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    vec2 p = vec2(sin(t * 0.8 + fi * 0.8), cos(t * 0.6 + fi * 0.6)) * (0.4 + sin(t * 0.3) * 0.1);
    float d = length(uv - p);
    float pulse = sin(d * 8.0 - t * 2.0) * 0.3 + 0.7;
    col += vec3(0.8, 0.4, 0.6) * pulse * 0.15 / (d * d + 0.1);
  }
  
  col = pow(col, vec3(0.9));
  gl_FragColor = vec4(col, 1.0);
}
`,
  "XlfGRj": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time;
  vec3 col = vec3(0.1, 0.1, 0.2);
  
  for (float i = 0.0; i < 5.0; i++) {
    vec2 p = vec2(sin(t + i * 1.2), cos(t * 0.7 + i * 1.5)) * 0.5;
    float d = length(uv - p);
    col += vec3(0.2, 0.6, 0.9) * 0.15 / (d * d * 2.0 + 0.1);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`,
  "MdX3zr": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  float t = u_time * 0.8;
  vec3 col = vec3(0.05, 0.05, 0.1);
  
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 p = vec2(sin(t + fi * 1.0), cos(t * 0.6 + fi * 1.2)) * 0.6;
    float d = length(uv - p);
    float wave = sin(d * 10.0 - t * 3.0) * 0.5 + 0.5;
    col += vec3(0.9, 0.3, 0.5) * wave * 0.1 / (d + 0.2);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`,
  "mtyGWy": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time;
  vec3 col = vec3(0.0);
  
  for (float i = 0.0; i < 4.0; i++) {
    vec2 p = vec2(sin(t * 0.4 + i * 2.0), cos(t * 0.5 + i * 2.5)) * 0.4;
    float d = length(uv - p);
    col += vec3(0.4, 0.8, 0.9) / (1.0 + d * 8.0);
  }
  
  col = pow(col, vec3(0.8));
  gl_FragColor = vec4(col, 1.0);
}
`,
  "3sySRK": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  
  float t = u_time * 1.5;
  vec3 col = vec3(0.0, 0.0, 0.1);
  
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    vec2 p = vec2(sin(t * 0.5 + fi * 0.9), cos(t * 0.6 + fi * 1.1)) * (0.5 + cos(t * 0.4 + fi) * 0.15);
    float d = length(uv - p);
    float wave = sin(d * 12.0 - t * 3.0) * 0.4 + 0.6;
    col += vec3(0.7, 0.4, 0.9) * wave * 0.15 / (d * d * 1.5 + 0.15);
  }
  
  col = pow(col, vec3(0.85));
  gl_FragColor = vec4(col, 1.0);
}
`,
  "3ftcW4": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Shader by Frostbyte
// Licensed under CC BY-NC-SA 4.0
vec4 frostbyte(vec2 u) {
  vec2 uv = (u * 2.0 - u_resolution.xy) / u_resolution.y + vec2(-1.68, 0.9);
  float v = 50.0 * length(max(abs(uv) - 0.05, 0.0));
  float f = min(v, 1.0 - v) * 2.0 * fract(atan(uv.y + 1e-6, uv.x + 1e-6) / 3.141592 - u_time * 0.3);
  return clamp(vec4(f * 1.8, f * 0.2, f * 0.1, f), 0.0, 1.0);
}

#define P(z) vec3(0.0, sin(z * 0.05) * 0.1, z)

// https://www.stevenfrady.com/tools/palette?p=[[0.8,0.79,0.89],[0.79,0.01,0.22],[0.89,0,0.55],[0.47,0.9,0.83]]
vec3 palette(float t) {
  vec3 a = vec3(0.8, 0.79, 0.89);
  vec3 b = vec3(0.79, 0.01, 0.22);
  vec3 c = vec3(0.89, 0.0, 0.55);
  vec3 d = vec3(0.47, 0.9, 0.83);
  return a + b * cos(6.28318 * (c * t + d));
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// Box
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  vec3 q = p;
  q = fract(p) - 0.5;
  
  float verBeam = sdBox(q, vec3(0.03, 0.5, 0.03));
  float horBeam = sdBox(q, vec3(0.5, 0.05, 0.03));
  float zBeam = sdBox(q, vec3(0.03, 0.03, 0.5));
  float centralCube = sdBox(q, vec3(0.15, 0.15, 0.15));
  
  return min(verBeam, min(horBeam, zBeam));
}

void main() {
  vec4 O = vec4(0.0); // initialize output color
  
  vec3 p, ro, r = u_resolution.xyx;
  float z = 0.0;
  float d = 0.01; // Initialize d
  vec2 C = gl_FragCoord.xy;
  
  for (float i = 1.0; i < 100.0; i += 1.0) {
    z += 0.4 * d;
    ro = P(u_time); // Camera origin moving along a curve
    p = ro + z * normalize(vec3(C - 0.5 * r.xy, r.y));
    p.z += u_time * 1.5;
    p.xy *= rot(p.z * 0.2 - 0.9 * smoothstep(-1.0, 1.0, sin(p.z * 0.01)));
    d = abs(map(p)) + 0.0001;
    d += abs(sin(p.z + p.y + u_time) * 0.01 + 0.001); // Sin wave for moving reflect or shine look
    // Front-to-back compositing:
    O.rgb += (4.0 - d) * (palette(d * 0.1 + 3.0) / (d));
  }
  // tanh не поддерживается в WebGL 1.0, используем аппроксимацию
  // tanh(x) ≈ x / (1.0 + abs(x)) для больших значений
  vec3 rgbSq = O.rgb * O.rgb / 1e10;
  O.rgb = sqrt(vec3(
    rgbSq.x / (1.0 + abs(rgbSq.x)),
    rgbSq.y / (1.0 + abs(rgbSq.y)),
    rgbSq.z / (1.0 + abs(rgbSq.z))
  ));
  O += frostbyte(C);
  
  gl_FragColor = O;
}
`,
  "mtyGWy": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

//https://iquilezles.org/articles/palettes/
vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

//https://www.shadertoy.com/view/mtyGWy
void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i*.4 + u_time*.4);

        d = sin(d*8. + u_time)/8.;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }
        
    gl_FragColor = vec4(finalColor, 1.0);
}
`,
  "bumpedWarp": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Warp function. Variations have been around for years. This is
// almost the same as Fabrice's version:
// Fabrice - Plop 2
// https://www.shadertoy.com/view/MlSSDV
vec2 W(vec2 p){
    
    p = (p + 3.)*4.;

    float t = u_time/2.;

    // Layered, sinusoidal feedback, with time component.
    for (int i=0; i<3; i++){
        p += cos(p.yx*3. + vec2(t, 1.57))/3.;
        p += sin(p.yx + t + vec2(1.57, 0))/2.;
        p *= 1.3;
    }

    // A bit of jitter to counter the high frequency sections.
    p +=  fract(sin(p+vec2(13., 7.))*5e5)*.03 - .015;

    return mod(p, 2.) - 1.; // Range: [vec2(-1), vec2(1)]
    
}

// Bump mapping function. Put whatever you want here. In this case, 
// we're returning the length of the sinusoidal warp function.
float bumpFunc(vec2 p){ 

	return length(W(p))*.7071; // Range: [0, 1]

}

vec3 smoothFract(vec3 x){ x = fract(x); return min(x, x*(1.-x)*12.); }

void main(){

    // Screen coordinates.
	vec2 uv = (gl_FragCoord.xy - u_resolution.xy*.5)/u_resolution.y;
    
    // VECTOR SETUP - surface postion, ray origin, unit direction vector, and light postion.
    vec3 sp = vec3(uv, 0.); // Surface position. Hit point, if you prefer. Essentially, a screen at the origin.
    vec3 rd = normalize(vec3(uv, 1.)); // Unit direction vector. From the origin to the screen plane.
    vec3 lp = vec3(cos(u_time)*.5, sin(u_time)*.2, -1.); // Light position - Back from the screen.
	vec3 sn = vec3(0., 0., -1.); // Plane normal. Z pointing toward the viewer.
    
    // BUMP MAPPING - PERTURBING THE NORMAL
    vec2 eps = vec2(4./u_resolution.y, 0.);
    
    float f = bumpFunc(sp.xy); // Sample value multiplied by the amplitude.
    float fx = bumpFunc(sp.xy - eps.xy); // Same for the nearby sample in the X-direction.
    float fy = bumpFunc(sp.xy - eps.yx); // Same for the nearby sample in the Y-direction.
   
 	// Controls how much the bump is accentuated.
	const float bumpFactor = .05;
    
    // Using the above to determine the dx and dy function gradients.
    fx = (fx - f)/eps.x; // Change in X
    fy = (fy - f)/eps.x; // Change in Y.
    sn = normalize(sn + vec3(fx, fy, 0.)*bumpFactor);   
   
    // LIGHTING
	// Determine the light direction vector, calculate its distance, then normalize it.
	vec3 ld = lp - sp;
	float lDist = max(length(ld), .0001);
	ld /= lDist;

    // Light attenuation.    
    float atten = 1./(1. + lDist*lDist*.15);
    
    // Using the bump function, "f," to darken the crevices. Completely optional, but I
    // find it gives extra depth.
    atten *= f*.9 + .1;

	// Diffuse value.
	float diff = max(dot(sn, ld), 0.);  
    // Enhancing the diffuse value a bit. Made up.
    diff = pow(diff, 4.)*.66 + pow(diff, 8.)*.34; 
    // Specular highlighting.
    float spec = pow(max(dot( reflect(-ld, sn), -rd), 0.), 12.); 
    
    // TEXTURE COLOR
    // Using procedural texture instead of iChannel0
    vec3 texCol = smoothFract( W(sp.xy).xyy )*.1 + .2;
    // A bit of color processing.
    texCol = smoothstep(.05, .75, pow(texCol, vec3(.75, .8, .85)));    
    
    // FINAL COLOR
    // Using the values above to produce the final color.   
    vec3 col = (texCol*(diff*vec3(1., .97, .92)*2. + .5) + vec3(1., .6, .2)*spec*2.)*atten;
    
    // Faux environment mapping: I added this in at a later date out of sheer boredome, and  
    // because I like shiny stuff. You can comment it out if it's not to your liking. :)
    float ref = max(dot(reflect(rd, sn), vec3(1.)), 0.);
    col += col*pow(ref, 4.)*vec3(.25, .5, 1.)*3.;
    

    // Perform some statistically unlikely (but close enough) 2.0 gamma correction. :) 
	gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1.);
}
`,
  "quadTree2026": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define Rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))
#define antialiasing(n) n/min(u_resolution.y,u_resolution.x)
#define S(d) 1.-smoothstep(-1.3,1.3, (d)*u_resolution.y )
#define B(p,s) max(abs(p).x-s.x,abs(p).y-s.y)
#define PI 3.1415
#define FONT_H 0.017
#define FONT_THICK 0.005

float random (vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float lineTo(vec2 p, vec2 a, vec2 b, float t){
    float k = dot(p-a,b-a)/dot(b-a,b-a);
    return mix(distance(p,mix(a,b,clamp(k,0.,t))),1e5, step(t,0.01));
}

// thx, iq! https://iquilezles.org/articles/distfunctions2d/
float dot2( vec2 v ) { return dot(v,v); }
float sdBezier( in vec2 pos, in vec2 A, in vec2 B, in vec2 C, float t )
{    
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    float kk = 1.0/dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);      
    float res = 0.0;
    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx-3.0*ky) + kz;
    float h = q*q + 4.0*p3;
    if( h >= 0.0) 
    { 
        h = sqrt(h);
        vec2 x = (vec2(h,-h)-q)/2.0;
        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
        float t = clamp( uv.x+uv.y-kx, 0.0, t );
        res = dot2(d + (c + b*t)*t);
    }
    else
    {
        float z = sqrt(-p);
        float v = acos( q/(p*z*2.0) ) / 3.0;
        float m = cos(v);
        float n = sin(v)*1.732050808;
        vec3  t = clamp(vec3(m+m,-n-m,n-m)*z-kx,0.0,t);
        res = min( dot2(d+(c+b*t.x)*t.x),
                   dot2(d+(c+b*t.y)*t.y) );
    }
    return mix(sqrt( res ),1e5, step(t,0.01));
}

float cL(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    float d = lineTo(p,vec2(-h,h),vec2(-h,-h),1.)-FONT_THICK;
    float d2 = lineTo(p,vec2(-h,-h),vec2(h,-h),1.)-FONT_THICK;
    d = min(d,d2);
    return d;
}

float cP(vec2 p){
    float h = FONT_H;
    float d = lineTo(p,vec2(-h,0.0),vec2(-h,-h),1.)-FONT_THICK;
    float d2 = lineTo(p,vec2(-h,h),vec2(h,h),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(-h,0.),vec2(h,0.),1.)-FONT_THICK;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(h,h),vec2(h,0.),1.)-FONT_THICK;
    d = min(d,d4);
    return d;
}

float c0(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    p.x = abs(p.x);
    float d = lineTo(p,vec2(h,h),vec2(h,-h),1.)-FONT_THICK;
    p = prevP;
    p.y = abs(p.y);
    float d2 = lineTo(p,vec2(h,h),vec2(-h,h),1.)-FONT_THICK;
    d = min(d,d2);
    return d;
}

float c1(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    float d = lineTo(p,vec2(0.,h),vec2(0.,-h),1.)-FONT_THICK;
    return d;
}

float c2(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    p.y = abs(p.y);
    float d = lineTo(p,vec2(h,h),vec2(-h,h),1.)-FONT_THICK;
    p = prevP;
    float d2 = lineTo(p,vec2(h,0.),vec2(-h,0.),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(h,h),vec2(h,0.),1.)-FONT_THICK;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(-h,0.),vec2(-h,-h),1.)-FONT_THICK;
    d = min(d,d4);
    return d;
}

float c3(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    p.y = abs(p.y);
    float d = lineTo(p,vec2(h,h),vec2(-h,h),1.)-FONT_THICK;
    p = prevP;
    float d2 = lineTo(p,vec2(h*0.25,0.),vec2(-h,0.),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(h,h),vec2(h,-h),1.)-FONT_THICK;
    d = min(d,d3);
    return d;
}

float c4(vec2 p){
    float h = FONT_H;
    float d = lineTo(p,vec2(-h,h),vec2(-h,0.0),1.)-FONT_THICK;
    float d2 = lineTo(p,vec2(h,0.0),vec2(-h,0.0),1.)-FONT_THICK;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(h,0.0),vec2(h,-h),1.)-FONT_THICK;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(h,h),vec2(h,h*0.75),1.)-FONT_THICK;
    d = min(d,d4);
    return d;
}

float c5(vec2 p){
    vec2 prevP = p;
    p.y*=-1.;
    float d = c2(p);
    return d;
}

float c6(vec2 p){
    vec2 prevP = p;
    p.y*=-1.;
    float d = cP(p);
    return d;
}

float c7(vec2 p){
    vec2 prevP = p;
    p*=-1.;
    float d = cL(p);
    return d;
}

float c8(vec2 p){
    vec2 prevP = p;
    float h = FONT_H;
    float d = c0(p);
    float d2 = lineTo(p,vec2(-h,0.),vec2(h,0.0),1.)-FONT_THICK;
    d = min(d,d2);
    return d;
}

float c9(vec2 p){
    vec2 prevP = p;
    p.x*=-1.;
    float d = cP(p);
    return d;
}

float drawNumber(vec2 p, int char){
    float d = 10.;
    if(char == 0) {
        d = c0(p);
    } else if(char == 1){
        d = c1(p);
    } else if(char == 2){
        d = c2(p);
    } else if(char == 3){
        d = c3(p);
    } else if(char == 4){
        d = c4(p);
    } else if(char == 5){
        d = c5(p);
    } else if(char == 6){
        d = c6(p);
    } else if(char == 7){
        d = c7(p);
    } else if(char == 8){
        d = c8(p);
    } else if(char == 9){
        d = c9(p);
    }
    
    return d;
}

float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

float linesLayer1(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(-0.1851,0.0842),vec2(-0.2210,0.1274),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(-0.2210,0.1274),vec2(-0.0657,0.1654),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0657,0.1654),vec2(-0.2523,-0.0546),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.2523,-0.0546),vec2(-0.0986,-0.0150),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0986,-0.0150),vec2(-0.1182,0.0230),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.1182,0.0230),vec2(-0.1182,0.0230),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float linesLayer2(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(-0.0677,0.0360),vec2(-0.0911,0.0864),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(-0.0911,0.0864),vec2(-0.0391,0.1612),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0391,0.1612),vec2(-0.0052,0.0780),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0052,0.0780),vec2(-0.0589,-0.0468),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0589,-0.0468),vec2(-0.1007,0.0222),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.1007,0.0222),vec2(-0.0911,0.0572),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float linesLayer3(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(0.0156,0.0820),vec2(-0.0052,0.1168),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(-0.0052,0.1168),vec2(0.1250,0.1728),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.1250,0.1728),vec2(-0.0299,-0.0340),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(-0.0299,-0.0340),vec2(0.0755,-0.0158),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.0755,-0.0158),vec2(0.0475,0.0102),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.0475,0.0102),vec2(0.0475,0.0102),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float linesLayer4(vec2 p, float anim, float speed, float thick){
    float num = 7.0;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = mix(num,t,anim);
    
    float d = lineTo(p,vec2(0.1396,0.0890),vec2(0.1484,0.1612),clamp(t,0.,1.))-thick;
    float d2 = lineTo(p,vec2(0.1484,0.1612),vec2(0.0716,0.0244),clamp(t-1.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.0716,0.0244),vec2(0.1783,-0.0456),clamp(t-2.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.1783,-0.0456),vec2(0.2411,0.0848),clamp(t-3.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.2411,0.0848),vec2(0.1042,0.0340),clamp(t-4.,0.,1.))-thick;
    d = min(d,d2);
    d2 = lineTo(p,vec2(0.1042,0.0340),vec2(0.1042,0.0340),clamp(t-5.,0.,1.))-thick;
    d = min(d,d2);
    return d;
}

float draw2026_items(vec2 p, float t, float thick){
    float d = sdBezier(p,vec2(0.15,-0.08),vec2(0.0,-0.035),vec2(-0.2,-0.09),t)-thick;
    float d2 = sdBezier(p,vec2(0.25,-0.13),vec2(0.0,-0.03),vec2(-0.25,-0.13),t)-thick;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(0.03,-0.11),vec2(-0.07,-0.12),t)-thick;
    d = min(d,d3);
    
    float d4 = lineTo(p,vec2(0.2,0.18),vec2(0.17,0.12),t)-thick;
    d = min(d,d4);
    float d5 = lineTo(p,vec2(0.1,0.19),vec2(0.0,0.14),t)-thick;
    d = min(d,d5);  
    float d6 = lineTo(p,vec2(0.1,-0.03),vec2(0.21,-0.09),t)-thick;
    d = min(d,d6);      
    float d7 = lineTo(p,vec2(-0.27,0.14),vec2(-0.21,0.08),t)-thick;
    d = min(d,d7);    
    float d8 = lineTo(p,vec2(-0.3,-0.05),vec2(-0.21,0.03),t)-thick;
    d = min(d,d8); 
    return d;
}

float draw2026_bg(vec2 p){
    float d = linesLayer1(p,0.0,0.0,0.007);
    float d2 = linesLayer2(p,0.0,0.0,0.007);
    d = min(d,d2);
    float d3 = linesLayer3(p,0.0,0.0,0.007);
    d = min(d,d3);
    float d4 = linesLayer4(p,0.0,0.0,0.007);
    d = min(d,d4);
    float thick = 0.007;
    float d5 = draw2026_items(p,1.0,thick);
    d = min(d,d5);      
    
    return d;
}

float draw2026(vec2 p, float speed){
    float d = linesLayer1(p,1.0,speed,0.007);
    float d2 = linesLayer2(p,1.0,speed,0.007);
    d = min(d,d2);
    float d3 = linesLayer3(p,1.0,speed,0.007);
    d = min(d,d3);
    float d4 = linesLayer4(p,1.0,speed,0.007);
    d = min(d,d4);
    float thick = 0.007;
    float num = 7.;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    
    float d5 = draw2026_items(p,clamp(t,0.,1.0),thick);
    d = min(d,d5);     
    
    return d;
}

float drawStarBg(vec2 p){
    float d = lineTo(p,vec2(-0.18,-0.15),vec2(0.0,0.2),1.)-0.015;
    float d2 = lineTo(p,vec2(0.0,0.2),vec2(0.2,-0.2),1.)-0.015;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(0.2,-0.2),vec2(-0.25,0.1),1.)-0.015;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(-0.25,0.1),vec2(0.25,0.0),1.)-0.015;
    d = min(d,d4);
    float d5 = lineTo(p,vec2(0.25,0.0),vec2(-0.18,-0.15),1.)-0.015;
    d = min(d,d5);
    return d;
}

float drawStar(vec2 p, float speed){
    float num = 7.;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }
    t = clamp(t,0.,1.);
    
    float d = lineTo(p,vec2(-0.18,-0.15),vec2(0.0,0.2),t)-0.015;
    float d2 = lineTo(p,vec2(0.0,0.2),vec2(0.2,-0.2),clamp(t-1.,0.,1.))-0.015;
    d = min(d,d2);
    float d3 = lineTo(p,vec2(0.2,-0.2),vec2(-0.25,0.1),clamp(t-2.,0.,1.))-0.015;
    d = min(d,d3);
    float d4 = lineTo(p,vec2(-0.25,0.1),vec2(0.25,0.0),clamp(t-3.,0.,1.))-0.015;
    d = min(d,d4);
    float d5 = lineTo(p,vec2(0.25,0.0),vec2(-0.18,-0.15),clamp(t-4.,0.,1.))-0.015;
    d = min(d,d5);
    return d;
}

float drawCircleBg(vec2 p){
    float thick = 0.01;
    float d = sdBezier(p,vec2(-0.07,0.05),vec2(-0.2,0.0),vec2(-0.08,-0.05),1.)-thick;
    float d2 = sdBezier(p,vec2(0.08,-0.05),vec2(0.2,0.0),vec2(-0.01,0.05),1.)-thick;
    d = min(d,d2);
    float d3 = sdBezier(p,vec2(-0.08,-0.05),vec2(0.01,-0.07),vec2(0.08,-0.05),1.)-thick;
    d = min(d,d3);
    return d;
}

float drawCircle(vec2 p, float speed){
    float thick = 0.01;
    
    float num = 7.;
    float t = mod(u_time*speed,num);
    if(t<num*0.3){
        t = cubicInOut(t);
    } else {
        t = (num-1.)-cubicInOut((t*0.7)-(num*0.3));
    }    
    
    float d = sdBezier(p,vec2(-0.07,0.05),vec2(-0.2,0.0),vec2(-0.08,-0.05),clamp(t,0.,1.0))-thick;
    float d2 = sdBezier(p,vec2(0.08,-0.05),vec2(0.2,0.0),vec2(-0.01,0.05),clamp(t-2.,0.,1.0))-thick;
    d = min(d,d2);
    float d3 = sdBezier(p,vec2(-0.08,-0.05),vec2(0.01,-0.07),vec2(0.08,-0.05),clamp(t-1.,0.,1.0))-thick;
    d = min(d,d3);
    return d;
}

float drawNumbersText(vec2 p, float n){
    p-=vec2(0.42,-0.42);

    float d = drawNumber(p,int(mod(10.*u_time+n,10.)));
    p.x-=-0.05;
    float d2 = drawNumber(p,int(mod(5.*u_time+n,10.)));
    d = min(d,d2);
    p.x-=-0.05;
    float d3 = drawNumber(p,int(mod(3.*u_time+n,10.)));
    d = min(d,d3);
    return d;
}

vec3 quadTree(vec2 p, vec3 col){
    p.y-=u_time*0.1;
    p*=2.;
    vec2 id = floor(p);
    vec2 gr = (p-id)-0.5;
    
    float n = random(id);
    float n2 = random(id)*10.;
    int type = 0;
    vec2 cell = id;

    // Заменяем массив на отдельные переменные для WebGL 1.0
    float threshold0 = 0.6;
    float threshold1 = 0.6;
    float threshold2 = 0.5;

    for (int i = 0; i < 3; i++)
    {
        n = random(cell + id + float(i) * 12.34);
        
        float threshold = 0.6;
        if (i == 0) threshold = threshold0;
        else if (i == 1) threshold = threshold1;
        else if (i == 2) threshold = threshold2;

        if (n < threshold)
            break;

        type = i + 1;
        
        if(i<2){
            gr *= 2.0;
            cell = floor(gr);
            gr = fract(gr) - 0.5;
        }
    }

    float d;
    vec2 prevGr = gr;
    if (type <= 1)
    {
        gr*=0.65;
        gr.x -=0.03;
        gr.y +=0.03;
        d = draw2026_bg(gr);
        col = mix(col,vec3(0.4),S(d));
        d = draw2026(gr,((n*0.5)+0.5));
        col = mix(col,vec3(1.),S(d));
        gr = prevGr;
        
        d = abs(B(gr,vec2(0.47)))-0.002;
        d = max(-(abs(gr.x)-0.4),d);
        d = max(-(abs(gr.y)-0.4),d);
        col = mix(col,vec3(1.),S(d));        
        
        gr = prevGr;
        d = abs(B(gr,vec2(0.47)))-0.006;
        gr*=Rot(radians(30.*u_time+(n*10.0)));
        d = max(-(abs(gr.x)-0.2),d);
        d = max(-(abs(gr.y)-0.2),d);
        col = mix(col,vec3(0.5),S(d));
        
        gr = prevGr;
        d = drawNumbersText(gr,n2);
        col = mix(col,vec3(0.8),S(d));
    }
    else if (type == 2)
    {
         gr*=0.7;
         d = drawStarBg(gr);
         col = mix(col,vec3(0.4),S(d));
         d = drawStar(gr,((n*0.5)+0.5));
         col = mix(col,vec3(1.),S(d));
    }
    else
    {
         gr*=0.35;
         d = drawCircleBg(gr);
         col = mix(col,vec3(0.4),S(d));
         d = drawCircle(gr,((n*0.5)+0.5));
         col = mix(col,vec3(1.),S(d)); 
    }
    
    if(type >= 2){
         gr = prevGr;
         d = abs(B(gr,vec2(0.44)))-0.005;
         d = max(-(abs(gr.x)-0.3),d);
         d = max(-(abs(gr.y)-0.3),d);
         col = mix(col,vec3(1.),S(d));  
         
         gr.x+=0.33;
         gr.y-=0.33;
         gr*=0.6;
         d = drawNumbersText(gr,n2);
         col = mix(col,vec3(0.8),S(d));
    }
    
    return col;
}

vec3 bg(vec2 p, vec3 col){
    vec2 prevP = p;
    p.y-=u_time*0.12;
    
    p = mod(p,0.05)-0.025;
    float d = length(p)-0.001;
    col = mix(col,vec3(1.),S(d));
    
    p = prevP;
    p.y-=u_time*0.135;
    vec2 id = floor(p*70.);
    col = mix(col,vec3(0.25),step(0.98, random(id)));
    
    return col;
}

vec2 getSphereMap(vec2 p, float size){
    p*=size;
    float r = dot(p, p);
    float z = sqrt(1.0 - r);
    vec3 q = vec3(p, z);
    q.xz*=Rot(radians(53.+20.*u_time*0.5));
    vec3 normal = normalize(q);

    float longitude = atan(normal.x, normal.z);
    float latitude  = asin(normal.y);

    float u = longitude / (2. * PI) + 0.5;
    float v = latitude / (2.*PI) + 0.5;

    p = vec2(u,v);
    p -= 0.5;
    p*=size;
    return p;
}

float getTime(float t, float duration){
    return clamp(t,0.0,duration)/duration;
}

float getAnimationValue(){
    float easeValue = 0.;
    float frame = mod(u_time,12.0);
    float time = frame;
    
    float duration = 1.;
    if(frame>=5. && frame<6.){
        time = getTime(time-5.,duration);
        easeValue = cubicInOut(time);
    } else if(frame>=6. && frame<11.){
        easeValue = 1.;
    } else if(frame>=11. && frame<12.){
        time = getTime(time-11.,duration);
        easeValue = 1.0-cubicInOut(time);
    }
    
    return easeValue;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-0.5*u_resolution.xy)/u_resolution.y;
    uv*=1.-(getAnimationValue()*0.3);
    vec3 col = vec3(0.);
    
    col = bg(uv,col);
    col = quadTree(uv,col);

    gl_FragColor = vec4(col,1.0);
}
`,
  "octgrams": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float gTime = 0.;
const float REPEAT = 5.0;

// 回転行列
mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c,s,-s,c);
}

float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float box(vec3 pos, float scale) {
	pos *= scale;
	float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
	pos.xy *= 5.;
	pos.y -= 3.5;
	pos.xy *= rot(.75);
	float result = -base;
	return result;
}

float box_set(vec3 pos, float iTime) {
	vec3 pos_origin = pos;
	pos = pos_origin;
	pos .y += sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
	pos = pos_origin;
	pos .y -=sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
	pos = pos_origin;
	pos .x +=sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
	pos = pos_origin;
	pos .x -=sin(gTime * 0.4) * 2.5;
	pos.xy *=   rot(.8);
	float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);	
	pos = pos_origin;
	pos.xy *=   rot(.8);
	float box5 = box(pos,.5) * 6.;	
	pos = pos_origin;
	float box6 = box(pos,.5) * 6.;	
	float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
	return result;
}

float map(vec3 pos, float iTime) {
	vec3 pos_origin = pos;
	float box_set1 = box_set(pos, iTime);

	return box_set1;
}

void main() {
	vec2 p = (gl_FragCoord.xy * 2. - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	vec3 ro = vec3(0., -0.2 ,mod(u_time * 4., 20.0));
	vec3 ray = normalize(vec3(p, 1.5));
	ray.xy = ray.xy * rot(sin(u_time * .03) * 5.);
	ray.yz = ray.yz * rot(sin(u_time * .05) * .2);
	float t = 0.1;
	vec3 col = vec3(0.);
	float ac = 0.0;

	for (int i = 0; i < 99; i++){
		vec3 pos = ro + ray * t;
		pos = mod(pos-2., 4.) -2.;
		gTime = u_time -float(i) * 0.01;
		
		float d = map(pos, u_time);

		d = max(abs(d), 0.01);
		ac += exp(-d*23.);

		t += d* 0.55;
	}

	col = vec3(ac * 0.02);

	col +=vec3(0.,0.2 * abs(sin(u_time)),0.5 + sin(u_time) * 0.2);

	gl_FragColor = vec4(col ,1.0 - t * (0.02 + 0.02 * sin (u_time)));
}
`,
  "universeWithin": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define S(a, b, t) smoothstep(a, b, t)
#define NUM_LAYERS 4.

float N21(vec2 p) {
	vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
    a += dot(a, a.yzx + 79.76);
    return fract((a.x + a.y) * a.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
	return dot(p-ro, rd); 
}

float LineDist(vec3 a, vec3 b, vec3 p) {
	return length(cross(b-a, p-a))/length(p-a);
}

float df_line( in vec2 a, in vec2 b, in vec2 p)
{
    vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);	
	return length(pa - ba * h);
}

float line(vec2 a, vec2 b, vec2 uv) {
    float r1 = .04;
    float r2 = .01;
    
    float d = df_line(a, b, uv);
    float d2 = length(a-b);
    float fade = S(1.5, .5, d2);
    
    fade += S(.05, .02, abs(d2-.75));
    return S(r1, r2, d)*fade;
}

float NetLayer(vec2 st, float n, float t) {
    vec2 id = floor(st)+n;

    st = fract(st)-.5;
   
    // Заменяем массив на отдельные переменные для WebGL 1.0
    vec2 p0 = GetPos(id, vec2(-1.,-1.), t);
    vec2 p1 = GetPos(id, vec2(0.,-1.), t);
    vec2 p2 = GetPos(id, vec2(1.,-1.), t);
    vec2 p3 = GetPos(id, vec2(-1.,0.), t);
    vec2 p4 = GetPos(id, vec2(0.,0.), t);
    vec2 p5 = GetPos(id, vec2(1.,0.), t);
    vec2 p6 = GetPos(id, vec2(-1.,1.), t);
    vec2 p7 = GetPos(id, vec2(0.,1.), t);
    vec2 p8 = GetPos(id, vec2(1.,1.), t);
    
    float m = 0.;
    float sparkle = 0.;
    
    // Центральная точка p4 соединяется со всеми остальными
    m += line(p4, p0, st);
    m += line(p4, p1, st);
    m += line(p4, p2, st);
    m += line(p4, p3, st);
    m += line(p4, p5, st);
    m += line(p4, p6, st);
    m += line(p4, p7, st);
    m += line(p4, p8, st);
    
    // Вычисляем sparkle для каждой точки
    float d0 = length(st-p0);
    float s0 = (.005/(d0*d0)) * S(1., .7, d0) * pow(sin((fract(p0.x)+fract(p0.y)+t)*5.)*.4+.6, 20.);
    sparkle += s0;
    
    float d1 = length(st-p1);
    float s1 = (.005/(d1*d1)) * S(1., .7, d1) * pow(sin((fract(p1.x)+fract(p1.y)+t)*5.)*.4+.6, 20.);
    sparkle += s1;
    
    float d2 = length(st-p2);
    float s2 = (.005/(d2*d2)) * S(1., .7, d2) * pow(sin((fract(p2.x)+fract(p2.y)+t)*5.)*.4+.6, 20.);
    sparkle += s2;
    
    float d3 = length(st-p3);
    float s3 = (.005/(d3*d3)) * S(1., .7, d3) * pow(sin((fract(p3.x)+fract(p3.y)+t)*5.)*.4+.6, 20.);
    sparkle += s3;
    
    float d4 = length(st-p4);
    float s4 = (.005/(d4*d4)) * S(1., .7, d4) * pow(sin((fract(p4.x)+fract(p4.y)+t)*5.)*.4+.6, 20.);
    sparkle += s4;
    
    float d5 = length(st-p5);
    float s5 = (.005/(d5*d5)) * S(1., .7, d5) * pow(sin((fract(p5.x)+fract(p5.y)+t)*5.)*.4+.6, 20.);
    sparkle += s5;
    
    float d6 = length(st-p6);
    float s6 = (.005/(d6*d6)) * S(1., .7, d6) * pow(sin((fract(p6.x)+fract(p6.y)+t)*5.)*.4+.6, 20.);
    sparkle += s6;
    
    float d7 = length(st-p7);
    float s7 = (.005/(d7*d7)) * S(1., .7, d7) * pow(sin((fract(p7.x)+fract(p7.y)+t)*5.)*.4+.6, 20.);
    sparkle += s7;
    
    float d8 = length(st-p8);
    float s8 = (.005/(d8*d8)) * S(1., .7, d8) * pow(sin((fract(p8.x)+fract(p8.y)+t)*5.)*.4+.6, 20.);
    sparkle += s8;
    
    // Дополнительные линии
    m += line(p1, p3, st);
	m += line(p1, p5, st);
    m += line(p7, p5, st);
    m += line(p7, p3, st);
    
    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;
    
    return m;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-u_resolution.xy*.5)/u_resolution.y;
	vec2 M = u_mouse.xy/u_resolution.xy-.5;
    
    float t = u_time*.1;
    
    float s = sin(t);
    float c = cos(t);
    mat2 rot = mat2(c, -s, s, c);
    vec2 st = uv*rot;  
	M *= rot*2.;
    
    float m = 0.;
    for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
        float z = fract(t+i);
        float size = mix(15., 1., z);
        float fade = S(0., .6, z)*S(1., .8, z);
        
        m += fade * NetLayer(st*size-M*z, i, u_time);
    }
    
	// Процедурная генерация FFT вместо texelFetch(iChannel0)
    float fft = sin(u_time * 2.0) * 0.5 + 0.5;
    fft = pow(fft, 2.0);
    float glow = -uv.y*fft*2.;
   
    vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;
    vec3 col = baseCol*m;
    col += baseCol*glow;
    
    col *= 1.-dot(uv,uv);
    t = mod(u_time, 230.);
    col *= S(0., 20., t)*S(224., 200., t);
    
    gl_FragColor = vec4(col,1.);
}
`,
  "custom-shader-1": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float seg(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float cosh(float x) {
    return (exp(x) + exp(-x)) * 0.5;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float a = atan(uv.y, uv.x);
    vec2 p = cos(a + u_time) * vec2(cos(0.5 * u_time), sin(0.3 * u_time));
    vec2 q = (cos(u_time)) * vec2(cos(u_time), sin(u_time));
    
    float d1 = length(uv - p);
    float d2 = length(uv - vec2(0.0));
    
    float denom = d1 + d2;
    vec2 uv2 = 2. * cos(log(length(uv))*0.25 - 0.5 * u_time + log(vec2(d1,d2)/max(denom, 0.0001)));
    
    vec2 fpos = fract(4. *  uv2) - 0.5;
    float d = max(abs(fpos.x), abs(fpos.y));
    float k = 5. / max(u_resolution.y, 1.0);
    float s = smoothstep(-k, k, 0.25 - d);
    vec3 col = vec3(s, 0.5 * s, 0.1-0.1 * s);
    col += 1./cosh(-2.5 * (length(uv - p) + length(uv))) * vec3(1,0.5,0.1);
    
    float c = cos(10. * length(uv2) + 4. * u_time);
    col += (0.5 + 0.5 * c) * vec3(0.5,1,1) *
           exp(-9. * abs(cos(9. * a + u_time) * uv.x
                       + sin(9. * a + u_time) * uv.y 
                       + 0.1 * c));
    
    gl_FragColor = vec4(col,1.0);
}
`,
  "hexagon-x5": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define R     u_resolution
#define T     u_time
#define M     u_mouse

#define PI    3.141592653
#define PI2   6.283185307

const float N = 3.;
const float s4 = .577350, s3 = .288683, s2 = .866025;
const vec2 s = vec2(1.732,1);

vec3 clr, trm;
float tk, ln;
mat2 r2,r3;

mat2 rot(float g) { return mat2(cos(g), sin(g),-sin(g), cos(g)); }
float hash21(vec2 p) { 
    p.x = mod(p.x,3.*N);
    return fract(sin(dot(p,vec2(26.37,45.93)))*4374.23); 
}

// Hexagon grid system, can be simplified but
// written out long-form for readability. 
// return vec2 uv and vec2 id
vec4 hexgrid(vec2 uv) {
    vec2 p1 = floor(uv/vec2(1.732,1))+.5,
         p2 = floor((uv-vec2(1,.5))/vec2(1.732,1))+.5;
    vec2 h1 = uv- p1*vec2(1.732,1),
         h2 = uv-(p2+.5)*vec2(1.732,1);
    return dot(h1,h1) < dot(h2,h2) ? vec4(h1,p1) : vec4(h2,p2+.5);
}

void draw(float d, float px, inout vec3 C) {
    float b = abs(d)-tk;
    C = mix(C,C*.25,smoothstep(.1+px,-px,b-.01) );
    C = mix(C,clr,smoothstep(px,-px,b ));
    C = mix(C,clamp(C+.2,C,vec3(.95)),smoothstep(.01+px,-px, b+.1 ));
    C = mix(C,trm,smoothstep(px,-px,abs(b)-ln ));
}

void main() {
    r2 = rot( 1.047);
    r3 = rot(-1.047);
    
    vec2 uv = (2.*gl_FragCoord.xy-R.xy)/max(R.x,R.y);
  
    uv = -vec2(log(length(uv)),atan(uv.y,uv.x))-((2.*M.xy-R.xy)/R.xy);
    uv /= 3.628;
    uv *= N;
        
    uv.y += T*.05;
    uv.x += T*.15;
    vec2 mv=uv;
    float sc = 3., px = fwidth(uv.x*sc);

    vec4 H = hexgrid(uv.yx*sc);
    vec2 p = H.xy, id = H.zw;

    float hs = hash21(id);
    
    if(hs<.5) p *= hs < .25 ? r3 : r2;

    vec2 p0 = p - vec2(-s3, .5),
         p1 = p - vec2( s4,  0),
         p2 = p - vec2(-s3,-.5);

    vec3 d3 = vec3(length(p0), length(p1), length(p2));
    vec2 pp = vec2(0);

    if(d3.x>d3.y) pp = p1;
    if(d3.y>d3.z) pp = p2;
    if(d3.z>d3.x && d3.y>d3.x) pp = p0;
     
    ln = .015;
    tk = .14+.1*sin(uv.x*5.+T);
    
    vec3 C = vec3(0);
    
    // tile background
    float d = max(abs(p.x)*.866025 + abs(p.y)/2., abs(p.y))-(.5-ln);
    // Заменяем texture(iChannel0,...) на процедурную генерацию
    vec3 texColor = vec3(0.906,0.282,0.075) * (0.5 + 0.5 * sin(p.x * 10.0 + T) * sin(p.y * 10.0 + T));
    C = mix(vec3(.0125),texColor,smoothstep(px,-px,d) );
    C = mix(C,C+.1,mix(smoothstep(px,-px,d+.035),0.,clamp(1.-(H.y+.15),0.,1.)) );
    C = mix(C,C*.1,mix(smoothstep(px,-px,d+.025),0.,clamp(1.-(H.x+.5),0.,1.)) );
    
    // base tile and empty vars
    float b = length(pp)-s3;
    float t = 1e5, g = 1e5;
    float tg= 1.;
    
    hs = fract(hs*53.71);

    // alternate tiles
    if(hs>.95) {
        vec2 p4 = p*r3, p5 = p*r2;
        
        b = length(vec2(p.x,abs(p.y)-.5));
        g = length(p5.x);
        t = length(p4.x);
        tg= 0.;
    }else if(hs>.65) {
        b = length(p.x);
        g = min(length(p1)-s3,length(p1+vec2(1.155,0))-s3);
        
        tg= 0.;
    } else if(hs<.15) {
        vec2 p4 = p*r3, p5 = p*r2;
        
        t = length(p.x);
        b = length(p5.x);
        g = length(p4.x);
        
        tg= 0.;
    } else if(hs<.22) {
        b = length(vec2(p.x,abs(p.y)-.5));
        g = min(length(p1)-s3,length(p1+vec2(1.155,0))-s3);

    }
    
    clr = vec3(0.420,0.278,0.043);
    trm = vec3(.0);
    
    // draw segments
    draw(t,px,C);
    draw(g,px,C);
    draw(b,px,C);
    // solid balls
    if(tg>0.){
        float v = length(p)-.25;
        C = mix(C,C*.25,smoothstep(.1+px,-px,v-.01) );
        C = mix(C,clr,smoothstep(px,-px,v ));
        C = mix(C,clamp(C+.2,C,vec3(.95)),smoothstep(.01+px,-px, v+.1 ));
        C = mix(C,trm,smoothstep(px,-px,abs(v)-ln ));
    
    }
    
    C = pow(C,vec3(.4545));
    gl_FragColor = vec4(C,1);
}
`,
  "traced-tunnel": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Sample number: Higher is better, but slower. Eight is enough. :)
const int sampleNum = 8;

// 2D rotation.
mat2 r2(float a){ return mat2(cos(a), sin(a), -sin(a), cos(a)); }

// Random functions: All based on IQ's originals.

// vec2 to float hash.
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(425.215, 714.388)))*45758.5453);
}

// vec2 to vec2 hash.
vec2 hash22(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(72.927, 98.283)), dot(p, vec2(41.295, 57.263))))
                  *vec2(43758.5453, 23421.6361));
}

// vec2 to vec3 hash.
vec3 hash23(vec2 p){
    return fract(sin(vec3(dot(p, vec2(12.989, 78.233)), dot(p, vec2(51.898, 56.273)),
                      dot(p, vec2(41.898, 57.263)))) *vec3(43758.5453, 23421.6361, 65426.6357));
}

// Also from NuSan's example. I tried other variations, but
// this just seems to work better.
float tick(float t, float d) {
  
  float m = fract(t/d);
  m = smoothstep(0., 1., m);
  m = smoothstep(0., 1., m);
  return (floor(t/d) + m)*d;
}

// NuSan's cool camera tick function.
float tickTime(float t){ return t*2. + tick(t, 4.)*.75; }

// Camera movement. Adapted from NuSan's example.
void cam(inout vec3 p, float tm, float tTime) {
  
    // CAM_SWING
  	p.xz *= r2(sin(tTime*.3)*.4);
  	p.xy *= r2(sin(tTime*.1)*2.);
    
}

// Plane intersection: Old formula, and could do with some tidying up.
float rayPlane(vec3 ro, vec3 rd, vec3 n, float d){

    float t = 1e8;
	float ndotdir = dot(rd, n);
     
	if (ndotdir < 0.){
	
		float dist = (-d - dot(ro, n) + 9e-7)/ndotdir;
   		
		if (dist>0. && dist<t){ 
            t = dist; 
		}
	}
    
    return t;

}

float udBox(in vec2 p, in vec2 b){
	return length(max(abs(p) - b + .1, 0.)) - .1;
}

// Used for polar mapping various shapes.
float uvShape(vec2 p){
    // Polar mapping a square wall.
    p = abs(p);
    return max(p.x, p.y);
}

// Процедурная генерация текстуры вместо texture(iChannel0, ...)
vec3 procTexture(vec2 uv) {
    vec2 id = floor(uv);
    vec2 gv = fract(uv) - 0.5;
    float d = length(gv);
    float m = smoothstep(0.3, 0.0, d);
    vec3 col = vec3(0.5 + 0.5 * sin(id.x * 0.5 + u_time));
    col += vec3(0.3 + 0.3 * sin(id.y * 0.3 + u_time * 0.7));
    return col * m;
}

void main(){

    // Aspect correct screen coordinates.
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy*.5)/u_resolution.y;
    

    // Depth of field (DOF) amount, and the DOF distance.
    const float DOF = .05, DOFDist = 3.;
    
    // Global time, and tick time.
    float tm = u_time;
    float tickTm = tickTime(tm);
    
    // Initial camera position.
    vec3 ca = vec3(0, 0, tickTm);
    
    // Initialize the scene color to zero.
    vec3 col = vec3(0);

    // Taking a few samples.
    for(int j = 0; j<sampleNum; j++) {

        // Pixel offset.
        vec2 offs = hash22(uv + float(j)*74.542 + 35.877) - .5;
 
        vec3 ro = vec3(0);
        // Depth of field.
        ro.xy += offs*DOF;
        vec3 r = normalize(vec3(uv - offs*DOF/DOFDist, 1));

        // Camera movement.
        cam(ro, tm, tickTm);
        cam(r, tm, tickTm);
        
        ro.z += ca.z;

        // Alpha, for blending layers.
        float alpha = 1.;

        // Fog distance.
        float fogD = 1e5;

        // Reflective bounces. Just three here.
        for(int i = 0; i<3; i++) {

            // Tracing the four planes, then determining the closest.
            vec4 pl; // Vector storage for the four planes.
            pl.x = rayPlane(ro, r, vec3(0, 1, 0), 1.); // Bottom.
            pl.y = rayPlane(ro, r, vec3(0, -1, 0), 1.); // Top.
            pl.z = rayPlane(ro, r, vec3(1, 0, 0), 1.); // Left.
            pl.w = rayPlane(ro, r, vec3(-1, 0, 0), 1.); // Right.
           
            // Minimum plane distance.
            float d = min(min(pl.x, pl.y), min(pl.z, pl.w));
    
            // Set the fog distance on the first pass.
            if(i==0) fogD = d;

            // Hit position.
            vec3 p = ro + r*d;
            // Determine the UV coordinates for texturing, and the normal.
            vec3 n = vec3(0,  pl.x<pl.y? 1 : -1, 0);
            vec2 tuv = p.xz + vec2(0, n.y);

            // If we've hit the side walls instead, change the normal and UVs accordingly.
            if(min(pl.z, pl.w)<min(pl.x, pl.y)) {
                n = vec3(pl.z<pl.w? 1 : -1, 0, 0);
                tuv = p.yz + vec2(n.x, 0); // Left walls.
            }

            // Texture scaling for texturing.
            const float sc = 12.;
            tuv *= sc;
            
            // Sample color.
            vec3 sampleCol = vec3(1);
            
            // Grid square ID and local coordinates.
            vec2 id = floor(tuv);
            tuv -= id + .5;
            
            // Use the UV coordinates to create a whitish colored rounded box grid.
            float patDist = udBox(tuv, vec2(.4));
            // Use the square grid shape for shading.
            float sh = clamp(.5 - patDist/.2, 0., 1.);
       
            // Subtle coloring.
            vec3 sqCol = .85 + .3*cos((hash21(id + .2)*2.)*6.2831 + vec3(0, 1, 2));
            sampleCol = mix(vec3(0), sqCol*sh, (1. - smoothstep(0., .005, patDist)));
 
            // Quantized squarish polar mapping.
            const vec2 txSc = vec2(2, 1./2.);
            vec3 ip3 = (floor(p*sc) + .0)/sc;
            float ang = atan(ip3.x, ip3.y)/6.2831;
            vec2 tnuv = vec2(uvShape(ip3.xy)*ang*txSc.x, ip3.z*txSc.y);
            
            // Smooth squarish polar mapping.
            const vec2 txSc2 = vec2(1, 1./4.);
    		vec3 p3 = mix(p, (floor(p*sc) + .0)/sc, .8);
            float ang2 = atan(p3.x, p3.y)/6.2831;
            vec2 tnuv2 = vec2(uvShape(p3.xy)*ang2*txSc2.x + p3.z*.075, p3.z*txSc2.y);

            // Процедурные текстуры вместо texture(iChannel0, ...) и texture(iChannel1, ...)
            vec3 tx = procTexture(fract(tnuv - .5 - vec2(u_time/(sc)/2., 0)));
            tx = mix(tx, vec3(dot(tx, vec3(.299, .587, .114))), .75);
            tx = smoothstep(.1, .55, tx);

            vec3 tx2 = procTexture(fract(tnuv2 - .5 - vec2(u_time/(sc)/2., 0)));
            tx2 = smoothstep(.18, .5, tx2);
            
            // Apply the textures to the sample color. 
            sampleCol *= tx*tx2*4.; 
            
            // Some fakish point lighting. 
            vec3 ld = normalize(ca + vec3(0, 0, 3) - p);
            float dif = max(dot(ld, n), 0.);
            float spe = pow(max(dot(reflect(ld, -n), -r), 0.), 8.);
            float fre = pow(max(1. - abs(dot(r, n))*.5, 0.), 1.);
            
            sampleCol *= (dif + vec3(1, .9, .7)*spe*4. + vec3(.5, .7, 1)*fre);
            
            // Applying some fog.
            sampleCol *= 1.35/(1. + fogD*fogD*.05);
         
            // Add the sample color to overall accumulated scene color.
            col += sampleCol*alpha*fre;
            
            // Reduce the alpha factor by a bit.
            alpha *= .9;

            // Calculate the reflection vector for the next pass.
            float h = hash21(id)*smoothstep(0., .005, -patDist + .15);
          
            // Purely reflected vector.
            vec3 ref = reflect(r,n);
            // Random vector.
            r = normalize(hash23(uv + float(j)*74.524 + float(i)*35.712) - .5);
            // Mixing the purely reflected vector with the random vector.
            r = normalize(mix(ref, r, (hash21(tuv)*.0 + h*.1*sh)*exp(-fogD*.05)));
            
            // Ensuring random reflection.
            r = dot(r, n)<0.? -r : r;

            // Advance the position to the new hit point.
            ro = p + n*.0011;
        }

    }
    
    // Divide by the total number of samples.
    col /= float(sampleNum);
    
    // Gamma correction and screen presentation.
    gl_FragColor = vec4(pow(max(col, 0.), vec3(0.4545)), 1);
    
}
`,
  "spin-effect": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Configuration (modify these values to change the effect)
#define SPIN_ROTATION -2.0
#define SPIN_SPEED 7.0
#define OFFSET vec2(0.0)
#define COLOUR_1 vec4(0.871, 0.267, 0.231, 1.0)
#define COLOUR_2 vec4(0.0, 0.42, 0.706, 1.0)
#define COLOUR_3 vec4(0.086, 0.137, 0.145, 1.0)
#define CONTRAST 3.5
#define LIGTHING 0.4
#define SPIN_AMOUNT 0.25
#define PIXEL_FILTER 745.0
#define SPIN_EASE 1.0
#define PI 3.14159265359
#define IS_ROTATE false

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
    vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
    float uv_len = length(uv);
    
    float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
    if(IS_ROTATE){
       speed = u_time * speed;
    }
    speed += 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
    vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
    uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
    
    uv *= 30.;
    speed = u_time*(SPIN_SPEED);
    vec2 uv2 = vec2(uv.x+uv.y);
    
    for(int i=0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
        uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
    }
    
    float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
    float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
    float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
    float c2p = max(0.,1. - contrast_mod*abs(paint_res));
    float c3p = 1. - min(1., c1p + c2p);
    float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
    return (0.3/CONTRAST)*COLOUR_1 + (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
}

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    
    gl_FragColor = effect(u_resolution.xy, uv * u_resolution.xy);
}
`,
  "fxaa-effect": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// FXAA code from: http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/3/

#define FXAA_SPAN_MAX 8.0
#define FXAA_REDUCE_MUL   (1.0/FXAA_SPAN_MAX)
#define FXAA_REDUCE_MIN   (1.0/128.0)
#define FXAA_SUBPIX_SHIFT (1.0/4.0)

// Процедурная генерация текстуры вместо sampler2D
vec3 procTexture(vec2 uv) {
    vec2 p = uv * 10.0;
    float d = length(fract(p) - 0.5);
    float m = smoothstep(0.3, 0.0, d);
    vec3 col = vec3(0.5 + 0.5 * sin(p.x * 3.14159 + u_time));
    col += vec3(0.3 + 0.3 * sin(p.y * 2.0 + u_time * 0.7));
    col += vec3(0.2 + 0.2 * sin((p.x + p.y) * 1.5 + u_time * 0.5));
    return col * m;
}

vec3 FxaaPixelShader( vec4 uv, vec2 rcpFrame) {
    
    vec3 rgbNW = procTexture(uv.zw);
    vec3 rgbNE = procTexture(uv.zw + vec2(1,0)*rcpFrame.xy);
    vec3 rgbSW = procTexture(uv.zw + vec2(0,1)*rcpFrame.xy);
    vec3 rgbSE = procTexture(uv.zw + vec2(1,1)*rcpFrame.xy);
    vec3 rgbM  = procTexture(uv.xy);

    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max(
        (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
        FXAA_REDUCE_MIN);
    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
    
    dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),
          max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
          dir * rcpDirMin)) * rcpFrame.xy;

    vec3 rgbA = (1.0/2.0) * (
        procTexture(uv.xy + dir * (1.0/3.0 - 0.5)) +
        procTexture(uv.xy + dir * (2.0/3.0 - 0.5)));
    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
        procTexture(uv.xy + dir * (0.0/3.0 - 0.5)) +
        procTexture(uv.xy + dir * (3.0/3.0 - 0.5)));
    
    float lumaB = dot(rgbB, luma);

    if((lumaB < lumaMin) || (lumaB > lumaMax)) return rgbA;
    
    return rgbB; 
}

void main() {
    vec2 rcpFrame = 1./u_resolution.xy;
  	vec2 uv2 = gl_FragCoord.xy / u_resolution.xy;
        
    vec3 col;
    
    vec4 uv = vec4( uv2, uv2 - (rcpFrame * (0.5 + FXAA_SUBPIX_SHIFT)));
    col = FxaaPixelShader( uv, 1./u_resolution.xy );

    
	col = pow(col * .5 + .0, vec3(1.3));
    col *= 1. - abs(sin(gl_FragCoord.y * .8)) * .4;
    gl_FragColor = vec4( col, 1. );
}
`,
  "digital-clock": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define TWELVE_HOUR_CLOCK   1
#define GLOWPULSE    1
#define SHOW_GRID

float pi = atan(1.0)*4.0;
float tau = atan(1.0)*8.0;

const float scale = 1.0 / 6.0;

vec2 digitSize = vec2(1.0,1.5) * scale;
vec2 digitSpacing = vec2(1.1,1.6) * scale;

// hash function copy from https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 pos) {
    vec2 i = floor(pos);
    vec2 f = fract(pos);
    
    float a = hash12(i);
    float b = hash12(i + vec2(1, 0));
    float c = hash12(i + vec2(0, 1));
    float d = hash12(i + vec2(1, 1));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

//Distance to a line segment,
float dfLine(vec2 start, vec2 end, vec2 uv)
{
	start *= scale;
	end *= scale;
    
	vec2 line = end - start;
	float frac = dot(uv - start,line) / dot(line,line);
	return distance(start + line * clamp(frac, 0.0, 1.0), uv);
}

//Distance to the edge of a circle.
float dfCircle(vec2 origin, float radius, vec2 uv)
{
	origin *= scale;
	radius *= scale;
    
	return abs(length(uv - origin) - radius);
}

//Distance to an arc.
float dfArc(vec2 origin, float start, float sweep, float radius, vec2 uv)
{
	origin *= scale;
	radius *= scale;
    
	uv -= origin;
	uv *= mat2(cos(start), sin(start),-sin(start), cos(start));
	
	float offs = (sweep / 2.0 - pi);
	float ang = mod(atan(uv.y, uv.x) - offs, tau) + offs;
	ang = clamp(ang, min(0.0, sweep), max(0.0, sweep));
	
	return distance(radius * vec2(cos(ang), sin(ang)), uv);
}

//Distance to the digit "d" (0-9).
float dfDigit(vec2 origin, float d, vec2 uv)
{
	uv -= origin;
	d = floor(d);
	float dist = 1e6;
	
	if(d == 0.0)
	{
		dist = min(dist, dfLine(vec2(1.000,1.000), vec2(1.000,0.500), uv));
		dist = min(dist, dfLine(vec2(0.000,1.000), vec2(0.000,0.500), uv));
		dist = min(dist, dfArc(vec2(0.500,1.000),0.000, 3.142, 0.500, uv));
		dist = min(dist, dfArc(vec2(0.500,0.500),3.142, 3.142, 0.500, uv));
		return dist;
	}
	if(d == 1.0)
	{
		dist = min(dist, dfLine(vec2(0.500,1.500), vec2(0.500,0.000), uv));
		return dist;
	}
	if(d == 2.0)
	{
		dist = min(dist, dfLine(vec2(1.000,0.000), vec2(0.000,0.000), uv));
		dist = min(dist, dfLine(vec2(0.388,0.561), vec2(0.806,0.719), uv));
		dist = min(dist, dfArc(vec2(0.500,1.000),0.000, 3.142, 0.500, uv));
		dist = min(dist, dfArc(vec2(0.700,1.000),5.074, 1.209, 0.300, uv));
		dist = min(dist, dfArc(vec2(0.600,0.000),1.932, 1.209, 0.600, uv));
		return dist;
	}
	if(d == 3.0)
	{
		dist = min(dist, dfLine(vec2(0.000,1.500), vec2(1.000,1.500), uv));
		dist = min(dist, dfLine(vec2(1.000,1.500), vec2(0.500,1.000), uv));
		dist = min(dist, dfArc(vec2(0.500,0.500),3.142, 4.712, 0.500, uv));
		return dist;
	}
	if(d == 4.0)
	{
		dist = min(dist, dfLine(vec2(0.700,1.500), vec2(0.000,0.500), uv));
		dist = min(dist, dfLine(vec2(0.000,0.500), vec2(1.000,0.500), uv));
		dist = min(dist, dfLine(vec2(0.700,1.200), vec2(0.700,0.000), uv));
		return dist;
	}
	if(d == 5.0)
	{
		dist = min(dist, dfLine(vec2(1.000,1.500), vec2(0.300,1.500), uv));
		dist = min(dist, dfLine(vec2(0.300,1.500), vec2(0.200,0.900), uv));
		dist = min(dist, dfArc(vec2(0.500,0.500),3.142, 5.356, 0.500, uv));
		return dist;
	}
	if(d == 6.0)
	{
		dist = min(dist, dfLine(vec2(0.067,0.750), vec2(0.500,1.500), uv));
		dist = min(dist, dfCircle(vec2(0.500,0.500), 0.500, uv));
		return dist;
	}
	if(d == 7.0)
	{
		dist = min(dist, dfLine(vec2(0.000,1.500), vec2(1.000,1.500), uv));
		dist = min(dist, dfLine(vec2(1.000,1.500), vec2(0.500,0.000), uv));
		return dist;
	}
	if(d == 8.0)
	{
		dist = min(dist, dfCircle(vec2(0.500,0.400), 0.400, uv));
		dist = min(dist, dfCircle(vec2(0.500,1.150), 0.350, uv));
		return dist;
	}
	if(d == 9.0)
	{
		dist = min(dist, dfLine(vec2(0.933,0.750), vec2(0.500,0.000), uv));
		dist = min(dist, dfCircle(vec2(0.500,1.000), 0.500, uv));
		return dist;
	}

	return dist;
}

//Distance to a number
float dfNumber(vec2 origin, float num, vec2 uv)
{
	uv -= origin;
	float dist = 1e6;
	float offs = 0.0;
	
	for(float i = 5.0;i > -3.0;i--)
	{	
		float d = mod(num / pow(10.0,i),10.0);
		
		vec2 pos = digitSpacing * vec2(offs,0.0);

		if(i == 0.0)
		{
			dist = min(dist, dfCircle(vec2(offs+0.9,0.1)*1.1, 0.04,uv));
		}
		
		if(num > pow(10.0,i) || i == 0.0)
		{
			dist = min(dist, dfDigit(pos, d, uv));
			offs++;
		}	
	}
	return dist;	
}

//Distance to a number This handles 2 digit integers, leading 0's will be drawn
float dfNumberInt(vec2 origin, int inum, vec2 uv)
{
    float num = float(inum);
	uv -= origin;
	float dist = 1e6;
	float offs = 0.0;
	
	for(float i = 1.0;i >= 0.0;i--)
	{	
		float d = mod(num / pow(10.0,i),10.0);
		
		vec2 pos = digitSpacing * vec2(offs,0.0);
		
        dist = min(dist, dfDigit(pos, d, uv));
        offs++;
	}
	return dist;	
}

float dfColon(vec2 origin, vec2 uv) {
	uv -= origin;
	float dist = 1e6;
	float offs = 0.0;

    dist = min(dist, dfCircle(vec2(offs+0.9,0.9)*1.1, 0.04,uv));
    dist = min(dist, dfCircle(vec2(offs+0.9,0.4)*1.1, 0.04,uv));
    return dist;
}

//Length of a number in digits
float numberLength(float n)
{
	return floor(max(log(n) / log(10.0), 0.0) + 1.0) + 2.0;
}

void main() 
{
	vec2 aspect = u_resolution.xy / u_resolution.y;
	vec2 uv = (gl_FragCoord.xy / u_resolution.y - aspect/2.0) *0.86;
	
    // Вычисляем время из u_time (секунды с начала дня)
    // Используем остаток от деления на 86400 (секунды в дне)
    float secondsInDay = mod(u_time, 86400.0);
    int hour = int(secondsInDay/3600.);
#if TWELVE_HOUR_CLOCK
    if( hour > 12 ) hour -= 12;
    if( hour == 0 ) hour = 12;
#endif
    int minute = int(mod(secondsInDay/60.,60.));
    
	float nsize = numberLength(9999.);
	vec2 pos = -digitSpacing * vec2(nsize,1.0)/2.0;

    vec2 basepos = pos;
    pos.x = basepos.x + 0.16;
	float dist = 1e6;
	dist = min(dist, dfNumberInt(pos, hour, uv));
    
    pos.x = basepos.x + 0.39;
	dist = min(dist, dfColon( pos, uv ));
    
    pos.x = basepos.x + 0.60;
    float dist2 = 1e6;
	dist = min(dist, dfNumberInt(pos, minute, uv));
	
	vec3 color = vec3(0);
	
	float shade = 0.0;
	
	shade = 0.004 / (dist);
	
	color += vec3(1,0.2,0) * shade;
#if GLOWPULSE
	color += vec3(1,0.2,0) * shade * noise((uv + vec2(u_time*.5)) * 2.5 + .5);
#endif

    #ifdef SHOW_GRID
    float grid = 0.5-max(abs(mod(uv.x*64.0,1.0)-0.5), abs(mod(uv.y*64.0,1.0)-0.5));
    
    color *= 0.25+vec3(smoothstep(0.0,64.0 / u_resolution.y,grid))*0.75;
    #endif
	
	gl_FragColor = vec4( color , 1.0 );
}
`,
  "galaxy-trip": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Increase pass count for a denser effect
#define PASS_COUNT 4

float fBrightness = 2.5;

// Number of angular segments
float fSteps = 121.0;

float fParticleSize = 0.015;
float fParticleLength = 0.5 / 60.0;

// Min and Max star position radius. Min must be present to prevent stars too near camera
float fMinDist = 0.8;
float fMaxDist = 5.0;

float fRepeatMin = 1.0;
float fRepeatMax = 2.0;

// fog density
float fDepthFade = 0.8;

float Random(float x)
{
	return fract(sin(x * 123.456) * 23.4567 + sin(x * 345.678) * 45.6789 + sin(x * 456.789) * 56.789);
}

vec3 GetParticleColour( const in vec3 vParticlePos, const in float fParticleSize, const in vec3 vRayDir )
{		
	vec2 vNormDir = normalize(vRayDir.xy);
	float d1 = dot(vParticlePos.xy, vNormDir.xy) / length(vRayDir.xy);
	vec3 vClosest2d = vRayDir * d1;
	
	vec3 vClampedPos = vParticlePos;
	
	vClampedPos.z = clamp(vClosest2d.z, vParticlePos.z - fParticleLength, vParticlePos.z + fParticleLength);
	
	float d = dot(vClampedPos, vRayDir);
	
	vec3 vClosestPos = vRayDir * d;
	
	vec3 vDeltaPos = vClampedPos - vClosestPos;	
		
	float fClosestDist = length(vDeltaPos) / fParticleSize;
	float fShade = clamp(1.0 - fClosestDist, 0.0, 1.0);
	
	if (d<3.0)
	{
		fClosestDist = max(abs(vDeltaPos.x),abs(vDeltaPos.y)) / fParticleSize;
		float f = clamp(1.0 - 0.8*fClosestDist, 0.0, 1.0);
		fShade += f*f*f*f;
		fShade *= fShade;
	}
	
	fShade = fShade * exp2(-d * fDepthFade) * fBrightness;
	return vec3(fShade);
}

vec3 GetParticlePos( const in vec3 vRayDir, const in float fZPos, const in float fSeed )
{
	float fAngle = atan(vRayDir.x, vRayDir.y);
	float fAngleFraction = fract(fAngle / (3.14 * 2.0));
	
	float fSegment = floor(fAngleFraction * fSteps + fSeed) + 0.5 - fSeed;
	float fParticleAngle = fSegment / fSteps * (3.14 * 2.0);

	float fSegmentPos = fSegment / fSteps;
	float fRadius = fMinDist + Random(fSegmentPos + fSeed) * (fMaxDist - fMinDist);
	
	float tunnelZ = vRayDir.z / length(vRayDir.xy / fRadius);
	
	tunnelZ += fZPos;
	
	float fRepeat = fRepeatMin + Random(fSegmentPos + 0.1 + fSeed) * (fRepeatMax - fRepeatMin);
	
	float fParticleZ = (ceil(tunnelZ / fRepeat) - 0.5) * fRepeat - fZPos;
	
	return vec3( sin(fParticleAngle) * fRadius, cos(fParticleAngle) * fRadius, fParticleZ );
}

vec3 Starfield( const in vec3 vRayDir, const in float fZPos, const in float fSeed )
{	
	vec3 vParticlePos = GetParticlePos(vRayDir, fZPos, fSeed);
	
	return GetParticleColour(vParticlePos, fParticleSize, vRayDir);	
}

vec3 RotateX( const in vec3 vPos, const in float fAngle )
{
    float s = sin(fAngle); float c = cos(fAngle);
    return vec3( vPos.x, c * vPos.y + s * vPos.z, -s * vPos.y + c * vPos.z);
}

vec3 RotateY( const in vec3 vPos, const in float fAngle )
{
    float s = sin(fAngle); float c = cos(fAngle);
    return vec3( c * vPos.x + s * vPos.z, vPos.y, -s * vPos.x + c * vPos.z);
}

vec3 RotateZ( const in vec3 vPos, const in float fAngle )
{
    float s = sin(fAngle); float c = cos(fAngle);
    return vec3( c * vPos.x + s * vPos.y, -s * vPos.x + c * vPos.y, vPos.z);
}

// Simplex Noise by IQ
vec2 hash( vec2 p )
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			  dot(p,vec2(269.5,183.3)) );

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2 i = floor( p + (p.x+p.y)*K1 );
	
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;

    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );

	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));

    return dot( n, vec3(70.0) );
	
}

const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm4( in vec2 p )
{
    float f = 0.0;
    f += 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );
    return f;
}

float marble(in vec2 p)
{
	return cos(p.x+fbm4(p));
}

float dowarp ( in vec2 q, out vec2 a, out vec2 b )
{
	float ang=0.;
	ang = 1.2345 * sin (33.33);
	mat2 m1 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
	ang = 0.2345 * sin (66.66);
	mat2 m2 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

	a = vec2( marble(m1*q), marble(m2*q+vec2(1.12,0.654)) );

	ang = 0.543 * cos (13.33);
	m1 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
	ang = 1.128 * cos (53.33);
	m2 = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

	b = vec2( marble( m2*(q + a)), marble( m1*(q + a) ) );
	
	return marble( q + b +vec2(0.32,1.654));
}

void main()
{
 	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	vec2 q = 2.*uv-1.;
	q.y *= u_resolution.y/u_resolution.x;
	
	// camera	
	vec3 rd = normalize(vec3( q.x, q.y, 1. ));
	vec3 euler = vec3(
		sin(u_time * 0.2) * 0.625,
		cos(u_time * 0.1) * 0.625,
		u_time * 0.1 + sin(u_time * 0.3) * 0.5);

	// Проверяем, используется ли мышь (если u_mouse не нулевой)
	if(length(u_mouse) > 0.01)
	{
		euler.x = -((u_mouse.y / u_resolution.y) * 2.0 - 1.0);
		euler.y = -((u_mouse.x / u_resolution.x) * 2.0 - 1.0);
		euler.z = 0.0;
	}
	rd = RotateX(rd, euler.x);
	rd = RotateY(rd, euler.y);
	rd = RotateZ(rd, euler.z);
	
	// Nebulae Background
	float pi = 3.141592654;
	q.x = 0.5 + atan(rd.z, rd.x)/(2.*pi);
	q.y = 0.5 - asin(rd.y)/pi + 0.512 + 0.001*u_time;
	q *= 2.34;
	
	vec2 wa = vec2(0.);
	vec2 wb = vec2(0.);
	float f = dowarp(q, wa, wb);
	f = 0.5+0.5*f;
	
	vec3 col = vec3(f);
	float wc = 0.;
	wc = f;
	col = vec3(wc, wc*wc, wc*wc*wc);
	wc = abs(wa.x);
	col -= vec3(wc*wc, wc, wc*wc*wc);
	wc = abs(wb.x);
	col += vec3(wc*wc*wc, wc*wc, wc);
	col *= 0.7;
	col.x = pow(col.x, 2.18);
	col.z = pow(col.z, 1.88);
	col = smoothstep(0., 1., col);
	col = 0.5 - (1.4*col-0.7)*(1.4*col-0.7);
	col = 0.75*sqrt(col);
	col *= 1. - 0.5*fbm4(8.*q);
	col = clamp(col, 0., 1.);
	
	// StarField
	float fShade = 0.0;
	float a = 0.2;
	float b = 10.0;
	float c = 1.0;
	float fZPos = 5.0;
	float fSpeed = 0.;
	
	fParticleLength = 0.25 * fSpeed / 60.0;
	
	float fSeed = 0.0;
	
	vec3 vResult = vec3(0.);
	
	vec3 red = vec3(0.7,0.4,0.3);
	vec3 blue = vec3(0.3,0.4,0.7);
	vec3 tint = vec3(0.);
	float ti = 1./float(PASS_COUNT-1);
	float t = 0.;
	for(int i=0; i<PASS_COUNT; i++)
	{
		tint = mix(red,blue,t);
		vResult += 1.1*tint*Starfield(rd, fZPos, fSeed);
		t += ti;
		fSeed += 1.234;
		rd = RotateX(rd, 0.25*euler.x);
	}
	
	col += sqrt(vResult);
	
	// Vignetting
	vec2 r = -1.0 + 2.0*(uv);
	float vb = max(abs(r.x), abs(r.y));
	col *= (0.15 + 0.85*(1.0-exp(-(1.0-vb)*30.0)));
	gl_FragColor = vec4( col, 1.0 );
}
`,
  "ice-and-fire": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

/* ice and fire, by mattz
   License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

   Demonstrate triangulation of jittered triangular lattice.

*/
const float s3 = 1.7320508075688772;
const float i3 = 0.5773502691896258;

const mat2 tri2cart = mat2(1.0, 0.0, -0.5, 0.5*s3);
const mat2 cart2tri = mat2(1.0, 0.0, i3, 2.0*i3);

//////////////////////////////////////////////////////////////////////
// cosine based palette 
// adapted from https://www.shadertoy.com/view/ll2GD3

vec3 pal( in float t ) {
    
    const vec3 a = vec3(0.5);
    const vec3 b = vec3(0.5);
    const vec3 c = vec3(0.8, 0.8, 0.5);
    const vec3 d = vec3(0, 0.2, 0.5);
    
    return clamp(a + b*cos( 6.28318*(c*t+d) ), 0.0, 1.0);
    
}

//////////////////////////////////////////////////////////////////////
// from https://www.shadertoy.com/view/4djSRW

#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(443.897, 441.423, 437.195)

float hash12(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);   
}

vec2 hash23(vec3 p3) {
	p3 = fract(p3 * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

//////////////////////////////////////////////////////////////////////
// compute barycentric coordinates from point differences
// adapted from https://www.shadertoy.com/view/lslXDf

vec3 bary(vec2 v0, vec2 v1, vec2 v2) {
    float inv_denom = 1.0 / (v0.x * v1.y - v1.x * v0.y);
    float v = (v2.x * v1.y - v1.x * v2.y) * inv_denom;
    float w = (v0.x * v2.y - v2.x * v0.y) * inv_denom;
    float u = 1.0 - v - w;
    return vec3(u,v,w);
}

//////////////////////////////////////////////////////////////////////
// distance to line segment from point differences

float dseg(vec2 xa, vec2 ba) {
    return length(xa - ba*clamp(dot(xa, ba)/dot(ba, ba), 0.0, 1.0));
}

//////////////////////////////////////////////////////////////////////
// generate a random point on a circle from 3 integer coords (x, y, t)

vec2 randCircle(vec3 p) {
    
    vec2 rt = hash23(p);
    
    float r = sqrt(rt.x);
    float theta = 6.283185307179586 * rt.y;
    
    return r*vec2(cos(theta), sin(theta));
    
}

//////////////////////////////////////////////////////////////////////
// make a time-varying cubic spline at integer coords p that stays
// inside a unit circle

vec2 randCircleSpline(vec2 p, float t) {

    // standard catmull-rom spline implementation
    float t1 = floor(t);
    t -= t1;
    
    vec2 pa = randCircle(vec3(p, t1-1.0));
    vec2 p0 = randCircle(vec3(p, t1));
    vec2 p1 = randCircle(vec3(p, t1+1.0));
    vec2 pb = randCircle(vec3(p, t1+2.0));
    
    vec2 m0 = 0.5*(p1 - pa);
    vec2 m1 = 0.5*(pb - p0);
    
    vec2 c3 = 2.0*p0 - 2.0*p1 + m0 + m1;
    vec2 c2 = -3.0*p0 + 3.0*p1 - 2.0*m0 - m1;
    vec2 c1 = m0;
    vec2 c0 = p0;
    
    return (((c3*t + c2)*t + c1)*t + c0) * 0.8;
    
}

//////////////////////////////////////////////////////////////////////
// perturbed point from index

vec2 triPoint(vec2 p) {
    float t0 = hash12(p);
    return tri2cart*p + 0.45*randCircleSpline(p, 0.15*u_time + t0);
}

//////////////////////////////////////////////////////////////////////
// main shading function. inputs:
// 
//   p - current pixel location in scene
//
//   tfloor - integer grid coordinates of bottom-left triangle vertex
//
//   t0, t1, t2 - displaced cartesian coordinates (xy) and integer
//                grid offsets (zw) of triangle vertices, relative
//                to tfloor
//
//   scl - pixel size in scene units
//
//   cw - pixel accumulator. xyz are rgb color pre-multiplied by
//        weights, and w is total weight.
//

void tri_color(in vec2 p, 
               in vec4 t0, in vec4 t1, in vec4 t2, 
               in float scl, 
               inout vec4 cw) {
               
    // get differences relative to vertex 0
    vec2 p0 = p - t0.xy;
    vec2 p10 = t1.xy - t0.xy;
    vec2 p20 = t2.xy - t0.xy;
    
    // get barycentric coords
    vec3 b = bary(p10, p20, p0);
    
    // distances to line segments
    float d10 = dseg(p0, p10);
    float d20 = dseg(p0, p20);
    float d21 = dseg(p - t1.xy, t2.xy - t1.xy);
    
    // unsigned distance to triangle boundary
    float d = min(min(d10, d20), d21);

    // now signed distance (negative inside, positive outside)
    d *= -sign(min(b.x, min(b.y, b.z))); 

    // only wory about coloring if close enough
    if (d < 0.5*scl) {

        //////////////////////////////////////////////////
        // generate per-vertex palette entries
    
        // sum of all integer grid indices
        vec2 tsum = t0.zw + t1.zw + t2.zw;

        // generate unique random number in [0, 1] for each vertex of
        // this triangle
        vec3 h_tri = vec3(hash12(tsum + t0.zw),
                          hash12(tsum + t1.zw),
                          hash12(tsum + t2.zw));

        //////////////////////////////////////////////////
        // now set up the "main" triangle color:
        
        // get the cartesian centroid of this triangle
        vec2 pctr = (t0.xy + t1.xy + t2.xy) / 3.0;

        // angle of scene-wide color gradient
        float theta = 1.0 + 0.01*u_time;
        vec2 dir = vec2(cos(theta), sin(theta));

        // how far are we along gradient?
        float grad_input = dot(pctr, dir) - sin(0.05*u_time);

        // h0 varies smoothly from 0 to 1
        float h0 = sin(0.7*grad_input)*0.5 + 0.5;

        // now the per-vertex random numbers are all biased towards h
        // (still in [0, 1] range tho)
        h_tri = mix(vec3(h0), h_tri, 0.4);

        //////////////////////////////////////////////////
        // final color accumulation
        
        // barycentric interpolation of per-vertex palette indices
        float h = dot(h_tri, b);

        // color lookup
        vec3 c = pal(h);
        
        // weight for anti-aliasing is 0.5 at border, 0 just outside,
        // 1 just inside
        float w = smoothstep(0.5*scl, -0.5*scl, d);

        // add to accumulator
        cw += vec4(w*c, w);
        
    }
    
}

//////////////////////////////////////////////////////////////////////

void main() {
	
    float scl = 4.1 / u_resolution.y;
    
    // get 2D scene coords
    vec2 p = (gl_FragCoord.xy - 0.5 - 0.5*u_resolution.xy) * scl;
    
    // get triangular base coords
    vec2 tfloor = floor(cart2tri * p + 0.5);

    // precompute 9 neighboring points
    vec2 pts[9];

    for (int i=0; i<3; ++i) {
        for (int j=0; j<3; ++j) {
            pts[3*i+j] = triPoint(tfloor + vec2(float(i-1), float(j-1)));
        }
    }
    
    // color accumulator
    vec4 cw = vec4(0);

    // for each of the 4 quads:
    for (int i=0; i<2; ++i) {
        for (int j=0; j<2; ++j) {
    
            // look at lower and upper triangle in this quad
            vec4 t00 = vec4(pts[3*i+j  ], tfloor + vec2(float(i-1), float(j-1)));
            vec4 t10 = vec4(pts[3*i+j+3], tfloor + vec2(float(i),   float(j-1)));
            vec4 t01 = vec4(pts[3*i+j+1], tfloor + vec2(float(i-1), float(j)));
            vec4 t11 = vec4(pts[3*i+j+4], tfloor + vec2(float(i),   float(j)));
          
            // lower
            tri_color(p, t00, t10, t11, scl, cw);

            // upper
            tri_color(p, t00, t11, t01, scl, cw);
           
        }
    }    
        
    
    // final pixel color
    gl_FragColor = cw / max(cw.w, 0.0001);
    
}
`,
  "particle-field": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159

void main(){
	vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	vec2 t = vec2(gl_FragCoord.xy / u_resolution.xy);
	
	vec3 c = vec3(0);
	
	for(int i = 0; i < 20; i++) {
		float t = 0.4 * PI * float(i) / 30.0 * u_time * 0.5;
		float x = cos(3.0*t);
		float y = sin(4.0*t);
		vec2 o = 0.40 * vec2(x, y);
		float r = fract(x);
		float g = 1.0 - r;
		c += 0.01 / (length(p-o)) * vec3(r, g, 0.9);
	}
	
	gl_FragColor = vec4(c, 1);
}
`,
  "rotating-particles": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define PI 3.14159265358979
#define N 12

void main() {
	float size = 0.2;
	float dist = 0.0;
	float ang = 0.0;
	vec2 pos = vec2(0.0,0.0);
	vec3 color = vec3(0.1);
	
	vec2 surfacePosition = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	
	for(int i=0; i<N; i++){
		float r = 0.4;
		ang += PI / (float(N)*0.5);
		pos = vec2(cos(ang),sin(ang))*r*cos(u_time+ang/.5);
		dist += size / distance(pos,surfacePosition);
		vec3 c = vec3(0.05);
		color = c*dist;
	}
	gl_FragColor = vec4(color, 1.0);
}
`,
  "wave-particles": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main(void){
	
	vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
	vec3 color1 = vec3(0.0, 0.3, 0.5);
	vec3 color2 = vec3(0.5, 0.0, 0.3);
	
	float f = 0.0;
	float g = 0.0;
	float h = 0.0;
	float PI = 3.14159265;
	for(float i = 0.0; i < 40.0; i++){
		if (floor(u_mouse.x * 41.0) < i)
			break;
		float s = sin(u_time + i * PI / 20.0) * 0.8;
		float c = cos(u_time + i * PI / 20.0) * 0.8;
		float d = abs(p.x + c);
		float e = abs(p.y + s);
		f += 0.001 / max(d, 0.0001);
		g += 0.001 / max(e, 0.0001);
		h += 0.00003 / max(d * e, 0.0001);
	}
	
	
	gl_FragColor = vec4(f * color1 + g * color2 + vec3(h), 1.0);
}
`,
  "flower-matrix": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Flower Matrix
// By: Brandon Fogerty
// xdpixel.com

void main() 
{

	vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
	uv.x *= u_resolution.x/u_resolution.y;
	
	vec2 px = vec2(gl_FragCoord.x, gl_FragCoord.y);
	
	vec3 finalColor = vec3( 0.0, 0.0, 0.0 );

	float a = 0.;
	float r = -1.5 + length( uv );
	

	float timeT = .1;
	float move = .6 + u_time;
	
     	float t = .7 + .1 * sin(move * 1.);
    
     	finalColor += vec3( 8.0 * t, 4.0 * t, 2.0 * t );
    
     	finalColor *= .5 * (1.-r);
	
	float g = -mod( px.y + u_time, cos( px.x ) + 0.004 ) * .5;
	finalColor *= vec3( 0.0, g, 0.0 );
	
	gl_FragColor = vec4( finalColor, 1.0 );

}
`,
  "photon-torpedo": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Posted by Trisomie21
// photon torpedo?

// from http://glsl.heroku.com/e#5248.0
#define BLADES 4.0
#define BIAS 0.01
#define SHARPNESS 4.0
vec3 star(vec2 position) {
	float blade = clamp(pow(sin(atan(position.y,position.x )*BLADES)+BIAS, SHARPNESS), 0.4, 0.8);
	
	vec3 color = mix(vec3(-0.34, -0.5, -1.0), vec3(0.0, -0.5, -1.0), (position.y + 1.0) * 0.25);
	color += (vec3(0.95, 0.65, 0.30) * 1.0 / max(distance(vec2(0.0), position), 0.0001) * 0.075);
	color += vec3(0.95, 0.45, 0.30) * min(1.0, blade *0.7) * (1.0 / max(distance(vec2(0.0, 0.0), position), 0.0001)*0.075);
	return color;

}

void main(void) {

	vec2 uv = 2.0* gl_FragCoord.xy/u_resolution.xy - 1.0;
	uv.x *= u_resolution.x/u_resolution.y;
	
	uv /= 2.0;
	
	float r = length(uv);
	float a = atan(uv.y, uv.x);
	
	a += sin(floor(u_time*10.0)/.5);
	
	uv.x = r*cos(a);
	uv.y = r*sin(a);
	
	gl_FragColor = vec4(star(uv), 1.0);
	

}
`,
  "explosive": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Posted by Trisomie21

float nrand(vec2 n)
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Процедурная генерация вместо texture2D(backbuffer, ...)
float procBackbuffer(vec2 uv) {
    vec2 p = uv * 10.0;
    float d = length(fract(p) - 0.5);
    float m = smoothstep(0.3, 0.0, d);
    float c = 0.5 + 0.5 * sin(p.x * 3.14159 + u_time * 0.5);
    c += 0.3 + 0.3 * sin(p.y * 2.0 + u_time * 0.7);
    return c * m;
}

void main() {

	vec2 screen_pos = gl_FragCoord.xy;
	vec2 mouse_pos = u_resolution.xy*.5;
	
	vec2 n = screen_pos - mouse_pos;
	float color = nrand(screen_pos*0.01 + u_time*0.01);
	
	if (length(n) > 4.0)
	{
		vec2 y = normalize(-n);
		vec2 x = vec2(-y.y, y.x);
		
		float d = length(n);
		float r = color*d*.25;
	
		// Заменяем texture2D(backbuffer, ...) на процедурную генерацию
		vec2 uv1 = (screen_pos + y*r*.2)/u_resolution.xy;
		vec2 uv2 = (screen_pos + y*r*.8 - x*r*.9)/u_resolution.xy;
		color = procBackbuffer(uv1)*.5 + procBackbuffer(uv2)*.5;
	}
	gl_FragColor = vec4(color-.2, color - .5, color, 1.0 );
}
`,
  "blobs": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// By @paulofalcao
//
// Blobs

float makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){
   float xx=x+sin(t*fx)*sx;
   float yy=y+cos(t*fy)*sy;
   return 1.0/max(sqrt(xx*xx+yy*yy), 0.0001);
}

void main() {

   vec2 p=(gl_FragCoord.xy/u_resolution.x)*2.0-vec2(1.0,u_resolution.y/u_resolution.x);

   p=p*2.0;
   
   float x=p.x;
   float y=p.y;

   float a=
       makePoint(x,y,3.3,2.9,0.3,0.3,u_time);
   a=a+makePoint(x,y,1.9,2.0,0.4,0.4,u_time);
   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,u_time);
   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,u_time);
   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,u_time);
   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,u_time);
   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,u_time);
   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,u_time);
   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,u_time);   
   
   float b=
       makePoint(x,y,1.2,1.9,0.3,0.3,u_time);
   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,u_time);
   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,u_time);
   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,u_time);
   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,u_time);
   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,u_time);
   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,u_time);
   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,u_time);
   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,u_time);

   float c=
       makePoint(x,y,3.7,0.3,0.3,0.3,u_time);
   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,u_time);
   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,u_time);
   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,u_time);
   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,u_time);
   c=c+makePoint(x,y,0.3,0.3,0.4,0.4,u_time);
   c=c+makePoint(x,y,1.4,0.8,0.4,0.5,u_time);
   c=c+makePoint(x,y,0.2,0.6,0.6,0.3,u_time);
   c=c+makePoint(x,y,1.3,0.5,0.5,0.4,u_time);
   
   vec3 d=vec3(a,b,c)/32.0;
   
   gl_FragColor = vec4(d.x,d.y,d.z,1.0);

}
`,
  "spiral-waves": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main()
{

	vec2 position = -1.0 + 2.0 * (gl_FragCoord.xy / u_resolution.xy);
	position.x *= u_resolution.x / u_resolution.y;
	
	position += vec2(cos(u_time * 0.25), sin(u_time * 0.5)) * 0.8;

	vec3 colour = vec3(0.0);
	
	float u = sqrt(dot(position, position));
	float v = atan(position.y, position.x);
	
	float t = u_time + 1.0 / max(u, 0.0001);
	
	float val = smoothstep(0.0, 1.0, sin(5.0 * (u_time + sin(1.0/max(u, 0.0001) * 7.0)) + 10.0 * v) + cos(t * 10.0));
	
	colour = vec3(val * 0.8, val, 0.0) + (1.0 - val) * vec3(0.05, 0.05, 0.05);
	colour *= clamp(u * 1.0, 0.0, 1.0);
	
	gl_FragColor = vec4(colour, 1.0);

}
`,
  "sinus": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

//SINUS by Green120

void main() {

	vec2 p = ( gl_FragCoord.xy / u_resolution.xy ) -0.5;
	
	float sx =0.2*(p.x+0.5)*sin(20.0*p.x-2.*u_time); 
	float dy =1./max(1000.*abs(p.y-sx), 0.0001);
	
	float red =.0;
	
	float blue =dy*5.;
	float green =blue/.3;
	
	float px = .0;
	
	if (p.x<.0){	
	px =p.x*(-1.);
	}
	
	if (p.x>.0){
	blue +=sin(p.x/2.);
	green += p.x/12.;
	}
	
	if (blue< .01){
		blue -=0.4; //GLOW EFFEKT #1
	}
	if (blue> .01){
		blue -=0.4; //GLOW EFFEKT #2
	}
	
	gl_FragColor = vec4( vec3( red, green ,blue) ,1.0 );
	
}
`,
  "lame-tunnel": `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

/* lame-ass tunnel by kusma */

void main() {
	vec2 position = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.yy;
	float th = atan(position.y, position.x) / (2.0 * 3.1415926) + 0.5 + u_mouse.x;
	float dd = length(position);
	float d = 0.25 / max(dd, 0.0001) + u_time + u_mouse.y;

	vec3 uv = vec3(th + d, th - d, th + sin(d) * 0.1);
	float a = 0.5 + cos(uv.x * 3.1415926 * 2.0) * 0.5;
	float b = 0.5 + cos(uv.y * 3.1415926 * 2.0) * 0.5;
	float c = 0.5 + cos(uv.z * 3.1415926 * 6.0) * 0.5;
	vec3 color = mix(vec3(1.0, 0.8, 0.9), vec3(0.1, 0.1, 0.2), pow(a, 0.2)) * 3.;
	color += mix(vec3(0.8, 0.9, 1.0), vec3(0.1, 0.1, 0.2),  pow(b, 0.1)) * 0.75;
	color += mix(vec3(0.9, 0.8, 1.0), vec3(0.1, 0.2, 0.2),  pow(c, 0.1)) * 0.75;
	gl_FragColor = vec4(color * clamp(dd, 0.0, 1.0), 1.0);
}
`,
  "wave-lines": `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
	vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.7) / max(u_resolution.x, u_resolution.y) * 3.0;
	uv *= 1.0;
	
	float e = 0.0;
	for (float i=3.0;i<=15.0;i+=1.0) {
		e += 0.007/max(abs( (i/15.) +sin((u_time/2.0) + 0.15*i*(uv.x) *( cos(i/4.0 + (u_time / 2.0) + uv.x*2.2) ) ) + 2.5*uv.y), 0.0001);
	}
	
	gl_FragColor = vec4( vec3(e/1.6, e/1.6, e/1.6), 1.0);	
}
`,
  "raster-lines": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float WEIGHT = 20.0 / u_resolution.x;

// rasterize functions
float line(vec2 p, vec2 p0, vec2 p1, float w) {
    vec2 d = p1 - p0;
    float t = clamp(dot(d,p-p0) / dot(d,d), 0.0,1.0);
    vec2 proj = p0 + d * t;
    float dist = length(p - proj);
    dist = 1.0/dist*WEIGHT*w;
    return min(dist*dist,1.0);
}

vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void) {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float line_width = 0.4;
    float t = u_time * 0.31415+sin(length(uv)+u_time*.2)/max(length(uv), 0.0001)*0.1;
    vec3 c = vec3(0.0); //init to fix screenful of random garbage

    for ( float i = 8.0; i < 24.0; i += 2.0 ) {
        float f = line(uv, vec2(cos(t*float(i))/2.0, sin(t*float(i))/2.0), vec2(sin(t*float(i))/2.0,-cos(t*float(i))/2.0), 0.5);
	c += hsv(i / 24.0, 1.0, 1.0) * f;
    }        
    gl_FragColor = vec4(c,1.0);
}
`,
  "rotating-rings": `
#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.1415926535

mat2 rotate3d(float angle)
{
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main()
{
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    p = rotate3d((u_time * 2.0) * PI) * p;
    float t;
    if (sin(u_time) == 10.0)
        t = 0.075 / max(abs(1.0 - length(p)), 0.0001);
    else
        t = 0.075 / max(abs(0.4 - length(p)), 0.0001);
    gl_FragColor = vec4(     ( 1. -exp( -vec3(t)  * vec3(0.13*(sin(u_time)+12.0), p.y*0.7, 3.0) )) , 1.0);
}
`,
  "wave-distortion": `
#extension GL_OES_standard_derivatives : enable

precision mediump float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {

	vec2 pos = 4.0 * (gl_FragCoord.xy / u_resolution.xy);

	
	for(int n=1; n < 7; n++){
		float i = float(n);
		
		pos += vec2(
			0.4 / i * sin(i * pos.y * i + u_time / 10.0 + 0.9 * i) + 0.8,
			0.4 / i * sin(i * pos.x * i + u_time / 10.0 + 0.9 * i) + 1.6
		);	
	}
	
	
	float r = 0.5 * sin(pos.x) + 0.5;
	gl_FragColor = vec4(r, 0, 0, 1);

}
`,
  "particle-explosions": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define NUM_EXPLOSIONS 6.0
#define NUM_PARTICLES 1000.0


vec2 Hash12(float t) {
  float x = fract(sin(t * 456.51) * 195.23);
  float y = fract(sin((t + x) * 951.2) * 462.1);
  return vec2(x, y);
}

vec2 Hash12_Polar(float t) {
  float a = fract(sin(t * 456.51) * 195.23) * 6.2832;
  float r = fract(sin((t + a) * 951.2) * 462.1);
  return vec2(sin(a), cos(a)) * r;

}

float Explosion(vec2 uv, float t) {
    float sparks = 0.0;
    for (float i=0.0; i < NUM_PARTICLES; i+=1.0) {
        vec2 dir = Hash12_Polar(i + 1.0) * 0.5;
        float d = length(uv - dir * t);

        float brightness = mix(0.0003, 0.001, smoothstep(0.05, 0.0, t));
        brightness *= sin(t * 20.0 + i) * 0.5 + 0.5;
        brightness *= smoothstep(1.0, 0.7, t);
        sparks += brightness / max(d, 0.0001);
    }
    return sparks;
}

void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / max(u_resolution.y, 1.0);

    vec3 col = vec3(0.0);


    for ( float i = 0.0; i < NUM_EXPLOSIONS; i+=1.0) {
        float t = (u_time / 1.5) + (i * 123.4) / NUM_EXPLOSIONS;
        float ft = floor(t);
        vec3 colour = sin(4.0 * vec3(0.34, 0.54, 0.43) * ft);
        
        vec2 offset = Hash12(i + 1.0 + ft * NUM_EXPLOSIONS) - 0.5;
        offset *= vec2(0.9, 0.9);
        col += Explosion(uv - offset, fract(t)) * colour;
    }
    
    col /= 2.0;
    
    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
`,
  "particle-explosions-2": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define NUM_EXPLOSIONS 6.0
#define NUM_PARTICLES 100.0


vec2 Hash12(float t) {
  float x = fract(sin(t * 456.51) * 195.23);
  float y = fract(sin((t + x) * 951.2) * 462.1);
  return vec2(x, y);
}

vec2 Hash12_Polar(float t) {
  float a = fract(sin(t * 456.51) * 195.23) * 6.2832;
  float r = fract(sin((t + a) * 951.2) * 462.1);
  return vec2(sin(a), cos(a)) * r;

}

float Explosion(vec2 uv, float t) {
    float sparks = 0.0;
    for (float i=0.0; i < NUM_PARTICLES; i+=1.0) {
        vec2 dir = Hash12_Polar(i + 1.0) * 0.5;
        float d = length(uv - dir * t);

        float brightness = mix(0.0003, 0.001, smoothstep(0.05, 0.0, t));
        brightness *= sin(t * 20.0 + i) * 0.5 + 0.5;
        brightness *= smoothstep(1.0, 0.7, t);
        sparks += brightness / max(d, 0.0001);
    }
    return sparks;
}

void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / max(u_resolution.y, 1.0);

    vec3 col = vec3(0.0);


    for ( float i = 0.0; i < NUM_EXPLOSIONS; i+=1.0) {
        float t = (u_time / 1.5) + (i * 123.4) / NUM_EXPLOSIONS;
        float ft = floor(t);
        vec3 colour = sin(4.0 * vec3(0.34, 0.54, 0.43) * ft);
        
        vec2 offset = Hash12(i + 1.0 + ft * NUM_EXPLOSIONS) - 0.5;
        offset *= vec2(0.9, 0.9);
        col += Explosion(uv - offset, fract(t)) * colour;
    }
    
    col /= 2.0;
    
    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
`,
  "burisaba-circle": `
/*
 * Original shader from: https://www.shadertoy.com/view/wd23zz
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define M_PI 3.1415926535897932384626433832795
#define M_PI05 (M_PI * 0.5)

vec2 rotate(vec2 v, float c, float s){
	return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}

vec2 rotate(vec2 v, float r){
	return rotate(v, cos(r), sin(r));
}

float boxLength(vec2 pos) {
	vec2 q = abs(pos);
	return max(q.x, q.y);
}

float capsuleLength(vec2 pos, vec2 dir) {
	vec2 ba = -dir;
	vec2 pa = pos + ba;
	ba *= 2.0;
	float baDot = dot(ba, ba);
	return length(pa - ba * clamp(dot(pa, ba) / max(baDot, 0.0001), 0.0, 1.0));
} 

float triangleLength(vec2 p) {
    p.y += 0.32;
	return max(abs(p.x * 1.8) + p.y, 1.0 - p.y * 1.8) * 0.75;
}

vec2 fracOrigin(vec2 v){
	return (fract(v) - 0.5) * 2.0;
}

float Bu(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.5), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, 0.3), vec2(1.0, 1.0) * 0.707);  
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Ri(vec2 pos){
 	float a = capsuleLength(pos + vec2(-0.5, 0.0), vec2(0.0, 1.0));   
 	float b = capsuleLength(pos + vec2(0.0, 0.0), vec2(0.1, -0.8) * 0.4);    
    return min(a, b);
}

float To(vec2 pos){ 	
    float a = capsuleLength(pos + vec2(0.0, -0.7), vec2(0.5, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, -0.3), vec2(0.3, 1.3));  
    float c = capsuleLength(pos + vec2(0.3, -0.5), vec2(0, 0.5)); 
    return min(min(a, b), c);
}

float Ba(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.8, 0.0), vec2(0.3, 1.0));   
 	float b = capsuleLength(pos + vec2(-0.8, 0.0), vec2(-0.3, 1.0));     
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Burisaba(vec2 pos, float power){
    float ret = 0.0
     + power / max(Bu(pos), 0.0001)
     + power / max(Ri(pos + vec2(-3.0, 0.0)), 0.0001)
     + power / max(To(pos + vec2(-6.0, 0.0)), 0.0001)
     + power / max(Ba(pos + vec2(-9.0, 0.0)), 0.0001)
        ;
    
    return ret;
}

float smoothstepLine(float lower, float upper, float value, float width){
    width *= 0.5;
    return smoothstep(lower - width, lower, value) * (1.0 - smoothstep(upper, upper + width, value));
}

float smoothLine(float value, float target, float width){
    return width / max(abs(value - target), 0.0001);
}

vec2 smoothLine2(float value, float target, float width){
    return vec2(step(0.0, value - target), width / max(abs(value - target), 0.0001));
}

float circleTriangle(vec2 pos){
    float circle = length(pos * 0.5);
    float triangle = triangleLength(pos * 0.3);    
    return smoothLine(circle, 1.0, 0.025) + smoothLine(triangle, 1.0, 0.025);
}

vec2 circleTriangle2(vec2 pos){
    float circle2 = length(pos * 0.35);
    vec2 ret = smoothLine2(circle2, 1.0, 0.025);
    ret.y += circleTriangle(pos);
    return ret;
}

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * M_PI05 : atan(y, x);
}

vec2 polar(vec2 uv) {
	float r = length(uv);
	float s = atan2(uv.y, uv.x) / M_PI;
	return vec2(r, s);
}

float BurisabaCircle(vec2 pos){
    vec2 pp = polar(rotate(pos, -u_time) * 0.75);
    return Burisaba(mod(rotate(pp * vec2(2.0, 32.0), M_PI05), vec2(16.0, 4.0)) - 1.5, 0.05) * smoothstepLine(6.0, 7.5, pp.x, 1.5);
}

float BurisabaCircle2(vec2 pos, float scale, float x, float y, float x2, float y2, float lower, float upper, float r){
    vec2 pp = polar(rotate(pos, r) * scale);
    return Burisaba(mod(rotate(pp * vec2(x, y), M_PI05), vec2(x2, y2)) - 1.5, 0.03) * smoothstepLine(lower, upper, pp.x, 0.2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - u_resolution.xy * 0.5) / max(u_resolution.y, 1.0) * 20.0;     
      
    uv *= clamp(u_time * 0.25, 0.0, 1.0);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
        
    uv = rotate(uv, u_time * 0.3);
    
    vec2 c2 = circleTriangle2(uv * 1.4 + vec2(0.0, 8.0));
    vec2 c3 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.3333));
    vec2 c4 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.6666));
    
    float mask = c2.x * c3.x * c4.x;
    
    float len = length(uv);
    
    col.r = BurisabaCircle(uv)
  		
        + (BurisabaCircle2(uv, 0.995, 8.0, 64.0, 12.0, 4.0, 7.5, 8.0, 5.0 + u_time * 0.2)
        + smoothLine(len, 8.0, 0.02)
        + smoothLine(len, 7.5, 0.02)
        
        + BurisabaCircle2(uv, 1.1, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 5.0 + u_time * 0.7)
        + BurisabaCircle2(uv, 1.2, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.1564)
        
        + BurisabaCircle2(uv, 1.45, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.2418654)
        + smoothLine(len, 5.0, 0.02)
        + smoothLine(len, 5.5, 0.02)
        
        + BurisabaCircle2(uv, 2.15, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 35.0 + u_time * 0.34685)
        + BurisabaCircle2(uv, 2.25, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 135.0 + u_time * 0.114)
        + BurisabaCircle2(uv, 1.8, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 532.0 + u_time * 0.54158)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.1 / max(abs(boxLength(uv * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.3333) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.6666) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
           
          ) * mask
      
        + circleTriangle(uv) 
        + c2.y
    	+ c3.y
     	+ c4.y
        ;
   
    fragColor = vec4(col, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "butitoba-circle": `
/*
 * Original shader from: https://www.shadertoy.com/view/wd23zz
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define M_PI 3.1415926535897932384626433832795
#define M_PI05 (M_PI * 0.5)

vec2 rotate(vec2 v, float c, float s){
	return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}

vec2 rotate(vec2 v, float r){
	return rotate(v, cos(r), sin(r));
}

float boxLength(vec2 pos) {
	vec2 q = abs(pos);
	return max(q.x, q.y);
}

float capsuleLength(vec2 pos, vec2 dir) {
	vec2 ba = -dir;
	vec2 pa = pos + ba;
	ba *= 2.0;
	float baDot = dot(ba, ba);
	return length(pa - ba * clamp(dot(pa, ba) / max(baDot, 0.0001), 0.0, 1.0));
} 

float triangleLength(vec2 p) {
    p.y += 0.32;
	return max(abs(p.x * 1.8) + p.y, 1.0 - p.y * 1.8) * 0.75;
}

vec2 fracOrigin(vec2 v){
	return (fract(v) - 0.5) * 2.0;
}

float Bu(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.5), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, 0.3), vec2(1.0, 1.0) * 0.707);  
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Chi(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.0), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(0.0, -1.3), vec2(1.0, 0.8) * 0.4);  
    float c = capsuleLength(pos + vec2(0.0, -0.0), vec2(0.1, 1.0));  
    return min(min(a, b), c);
}

float To(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.5, 0.0), vec2(0.0, 1.0));   
 	float b = capsuleLength(pos + vec2(0.0, 0.0), vec2(1.0, -0.8) * 0.4);    
    return min(a, b);
}

float Ba(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.8, 0.0), vec2(0.3, 1.0));   
 	float b = capsuleLength(pos + vec2(-0.8, 0.0), vec2(-0.3, 1.0));     
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Butitoba(vec2 pos, float power){
    float ret = 0.0
     + power / max(Bu(pos), 0.0001)
     + power / max(Chi(pos + vec2(-3.0, 0.0)), 0.0001)
     + power / max(To(pos + vec2(-6.0, 0.0)), 0.0001)
     + power / max(Ba(pos + vec2(-9.0, 0.0)), 0.0001)
        ;
    
    return ret;
}

float smoothstepLine(float lower, float upper, float value, float width){
    width *= 0.5;
    return smoothstep(lower - width, lower, value) * (1.0 - smoothstep(upper, upper + width, value));
}

float smoothLine(float value, float target, float width){
    return width / max(abs(value - target), 0.0001);
}

vec2 smoothLine2(float value, float target, float width){
    return vec2(step(0.0, value - target), width / max(abs(value - target), 0.0001));
}

float circleTriangle(vec2 pos){
    float circle = length(pos * 0.5);
    float triangle = triangleLength(pos * 0.3);    
    return smoothLine(circle, 1.0, 0.025) + smoothLine(triangle, 1.0, 0.025);
}

vec2 circleTriangle2(vec2 pos){
    float circle2 = length(pos * 0.35);
    vec2 ret = smoothLine2(circle2, 1.0, 0.025);
    ret.y += circleTriangle(pos);
    return ret;
}

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * M_PI05 : atan(y, x);
}

vec2 polar(vec2 uv) {
	float r = length(uv);
	float s = atan2(uv.y, uv.x) / M_PI;
	return vec2(r, s);
}

float ButitobaCircle(vec2 pos){
    vec2 pp = polar(rotate(pos, -u_time) * 0.75);
    return Butitoba(mod(rotate(pp * vec2(2.0, 32.0), M_PI05), vec2(16.0, 4.0)) - 1.5, 0.05) * smoothstepLine(6.0, 7.5, pp.x, 1.5);
}

float ButitobaCircle2(vec2 pos, float scale, float x, float y, float x2, float y2, float lower, float upper, float r){
    vec2 pp = polar(rotate(pos, r) * scale);
    return Butitoba(mod(rotate(pp * vec2(x, y), M_PI05), vec2(x2, y2)) - 1.5, 0.03) * smoothstepLine(lower, upper, pp.x, 0.2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - u_resolution.xy * 0.5) / max(u_resolution.y, 1.0) * 20.0;     
      
    uv *= clamp(u_time * 0.25, 0.0, 1.0);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
        
    uv = rotate(uv, u_time * 0.3);
    
    vec2 c2 = circleTriangle2(uv * 1.4 + vec2(0.0, 8.0));
    vec2 c3 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.3333));
    vec2 c4 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.6666));
    
    float mask = c2.x * c3.x * c4.x;
    
    float len = length(uv);
    
    col.g = ButitobaCircle(uv)
  		
        + (ButitobaCircle2(uv, 0.995, 8.0, 64.0, 12.0, 4.0, 7.5, 8.0, 5.0 + u_time * 0.2)
        + smoothLine(len, 10.0+0.25*abs(sin(u_time)), 0.02)
        + smoothLine(len, 7.75+0.25*abs(cos(u_time)), 0.02)
        + smoothLine(len, 2.75+7.75*abs(mod(u_time*0.8, 1.0)), 0.02)
	   
        + ButitobaCircle2(uv, 1.1, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 5.0 + u_time * 0.2)
        + ButitobaCircle2(uv, 1.2, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.1564)
        
        + ButitobaCircle2(uv, 1.45, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.2418654)
        + smoothLine(len, 5.0, 0.02)
        + smoothLine(len, 5.5, 0.02)
        
        + ButitobaCircle2(uv, 2.15, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 35.0 + u_time * 0.34685)
        + ButitobaCircle2(uv, 2.25, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 135.0 + u_time * 0.114)
        + ButitobaCircle2(uv, 1.8, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 532.0 + u_time * 0.54158)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.1 / max(abs(boxLength(uv * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.3333) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.6666) * vec2(8.0, 0.5) - vec2(0.0, 2.9)) - 1.0), 0.0001)
           
          ) * mask
      
        + circleTriangle(uv) 
        + c2.y
    	+ c3.y
     	+ c4.y
        ;
   
    fragColor = vec4(col, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "butitoba-circle-2": `
/*
 * Original shader from: https://www.shadertoy.com/view/wd23zz
 */

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define M_PI 3.1415926535897932384626433832795
#define M_PI05 (M_PI * 0.5)

vec2 rotate(vec2 v, float c, float s){
	return vec2(v.x*c - v.y*s, v.x*s + v.y*c);
}

vec2 rotate(vec2 v, float r){
	return rotate(v, cos(r), sin(r));
}

float boxLength(vec2 pos) {
	vec2 q = abs(pos);
	return max(q.x, q.y);
}

float capsuleLength(vec2 pos, vec2 dir) {
	vec2 ba = -dir;
	vec2 pa = pos + ba;
	ba *= 2.0;
	float baDot = dot(ba, ba);
	return length(pa - ba * clamp(dot(pa, ba) / max(baDot, 0.0001), 0.0, 1.0));
} 

float triangleLength(vec2 p) {
    p.y += 0.32;
	return max(abs(p.x * 1.8) + p.y, 1.0 - p.y * 1.8) * 0.75;
}

vec2 fracOrigin(vec2 v){
	return (fract(v) - 0.5) * 2.0;
}

float Bu(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.0, -0.5), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(-0.3, 0.3), vec2(1.0, 1.0) * 0.707);  
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Chi(vec2 pos){
 	float a = capsuleLength(pos + vec2(44.0, -0.0), vec2(1.0, 0.0));   
 	float b = capsuleLength(pos + vec2(0.0, -1.3), vec2(1.0, 0.8) * 0.4);  
    float c = capsuleLength(pos + vec2(0.0, -0.0), vec2(0.1, 1.0));  
    return min(min(a, b), c);
}

float To(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.5, 0.0), vec2(0.0, 1.0));   
 	float b = capsuleLength(pos + vec2(0.0, 0.0), vec2(1.0, -0.8) * 0.4);    
    return min(a, b);
}

float Ba(vec2 pos){
 	float a = capsuleLength(pos + vec2(0.8, 0.0), vec2(0.3, 1.0));   
 	float b = capsuleLength(pos + vec2(-99.8, 0.0), vec2(-88.3, 88.0));     
    float c = length(pos + vec2(-1.3, -1.3));
    float d = length(pos + vec2(-1.8, -1.3));
    return min(min(min(a, b), c), d);
}

float Butitoba(vec2 pos, float power){
    float ret = 0.0
     + power / max(Bu(pos), 0.0001)
     + power / max(Chi(pos + vec2(-3.0, 0.0)), 0.0001)
     + power / max(To(pos + vec2(-6.0, 0.0)), 0.0001)
     + power / max(Ba(pos + vec2(-9.0, 0.0)), 0.0001)
        ;
    
    return ret;
}

float smoothstepLine(float lower, float upper, float value, float width){
    width *= 0.5;
    return smoothstep(lower - width, lower, value) * (1.0 - smoothstep(upper, upper + width, value));
}

float smoothLine(float value, float target, float width){
    return width / max(abs(value - target), 0.0001);
}

vec2 smoothLine2(float value, float target, float width){
    return vec2(step(0.0, value - target), width / max(abs(value - target), 0.0001));
}

float circleTriangle(vec2 pos){
    float circle = length(pos * 0.5);
    float triangle = triangleLength(pos * 0.3);    
    return smoothLine(circle, 1.0, 0.025) + smoothLine(triangle, 1.0, 0.025);
}

vec2 circleTriangle2(vec2 pos){
    float circle2 = length(pos * 0.35);
    vec2 ret = smoothLine2(circle2, 1.0, 0.025);
    ret.y += circleTriangle(pos);
    return ret;
}

float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * M_PI05 : atan(y, x);
}

vec2 polar(vec2 uv) {
	float r = length(uv);
	float s = atan2(uv.y, uv.x) / M_PI;
	return vec2(r, s);
}

float ButitobaCircle(vec2 pos){
    vec2 pp = polar(rotate(pos, -u_time) * 0.75);
    return Butitoba(mod(rotate(pp * vec2(2.0, 32.0), M_PI05), vec2(16.0, 4.0)) - 1.5, 0.05) * smoothstepLine(6.0, 7.5, pp.x, 1.5);
}

float ButitobaCircle2(vec2 pos, float scale, float x, float y, float x2, float y2, float lower, float upper, float r){
    vec2 pp = polar(rotate(pos, r) * scale);
    return Butitoba(mod(rotate(pp * vec2(x, y), M_PI05), vec2(x2, y2)) - 1.5, 0.03) * smoothstepLine(lower, upper, pp.x, 0.2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - u_resolution.xy * 0.5) / max(u_resolution.y, 1.0) * 20.0;     
      
    uv *= clamp(u_time * 0.25, 0.0, 1.0);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
        
    uv = rotate(uv, u_time * 0.3);
    
    vec2 c2 = circleTriangle2(uv * 1.4 + vec2(0.0, 8.0));
    vec2 c3 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.3333));
    vec2 c4 = circleTriangle2(uv * 1.4 + rotate(vec2(0.0, 8.0), M_PI * 2.0 * 0.6666));
    
    float mask = c2.x * c3.x * c4.x;
    
    float len = length(uv);
    
   col.g = col.b =
	
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 + u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 + u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 0.5)) - 4.5), 0.0001);
	
    col.g += col.b = ButitobaCircle(uv)
  		
        + (ButitobaCircle2(uv, 0.995, 8.0, 64.0, 332.0, 4.0, 7.5, 8.0, 5.0 + u_time * 0.2)
        + smoothLine(len, 10.0+0.25*abs(sin(u_time)), 0.02)
        + smoothLine(len, 7.75+0.25*abs(cos(u_time)), 0.02)
        + smoothLine(len, 2.75+7.75*abs(mod(u_time*0.8, 1.0)), 0.02)
	   
        + ButitobaCircle2(uv, 88.1, 8.0, 64.0, 177.0, 78.0, 7.5, 7.9, 88.0 - u_time * 77.75)
        + ButitobaCircle2(uv, 1.2, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.275)
        
        + ButitobaCircle2(uv, 44.499, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 15.0 + u_time * 0.2418654)
        + smoothLine(len, 5.0, 0.02)
        + smoothLine(len, 5.5, 0.02)
        
        + ButitobaCircle2(uv, 2.15, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 35.0 + u_time * 0.34685)
        + ButitobaCircle2(uv, 2.25, 8.0, 64.0, 12.0, 4.0, 7.5, 7.9, 135.0 + u_time * 0.114)
        + ButitobaCircle2(uv, 1.8, 8.0, 64.0, 12.0, 4.0, 99.5, 7.9, 5.0 + u_time * 0.54158)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.0 + u_time * 0.88)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.25 - u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.5 + u_time * 0.5)) - 4.5), 0.0001)
        + 0.005 / max(abs(boxLength(rotate(uv, M_PI05 * 0.75 - u_time * 66.5)) - 4.5), 0.0001)
        + 0.1 / max(abs(boxLength(uv * vec2(8.0, 0.5) - vec2(88.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 999.3333) * vec2(8.0, 0.5) - vec2(88.0, 2.9)) - 1.0), 0.0001)
        + 0.1 / max(abs(boxLength(rotate(uv, M_PI * 2.0 * 0.6666) * vec2(8.0, 999.5) - vec2(999.0, 00.9)) - 33.0), 0.0001)
           
          ) * mask
      
        + circleTriangle(uv) 
        + c2.y
    	+ c3.y
     	+ c4.y
        ;
   
    fragColor = vec4(col, 99.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "cobweb": `
// "Cobweb" by Kabuto 
// Based on @ahnqqq's blob raymarcher

// rotwang @mod* colors, @mod+ vignette
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

const vec3 diffuse = vec3( .99, .65, 0.2 );
const vec3 eps = vec3( .001, 0., 0. );
const int iter = 128;
float sq = sqrt(2.0)*0.5;

float c( vec3 p )
{
	vec3 q = abs(mod(p+vec3(cos(p.z*0.5), cos(p.x*11.5), cos(p.y*0.5)),2.0)-1.0);
	float a = q.x + q.y + q.z - min(min(q.x, q.y), q.z) - max(max(q.x, q.y), q.z);
	q = vec3(p.x+p.y, p.y+p.z, p.z+p.x)*sq;
	q = abs(mod(q,2.0)-1.0);
	float b = q.x + q.y + q.z - min(min(q.x, q.y), q.z) - max(max(q.x, q.y), q.z);
	return min(a,b);
}

vec3 n( vec3 p )
{
	float o = c( p );
	return normalize( o - vec3( c( p - eps ), c( p - eps.zxy ), c( p - eps.yzx ) ) );
}

void main()
{
	float aspect = u_resolution.x / max(u_resolution.y, 1.0);
	vec2 p = gl_FragCoord.xy / u_resolution.xy * 2. - 1.;
	vec2 m = u_mouse + vec2(0.5,-0.5);
	p.x *= aspect;
	m.x *= aspect;
	
	vec3 o = vec3( 0., 0., u_time );
	vec3 s = vec3( m, 0. );
	vec3 b = vec3( 0., 0., 0. );
	vec3 d = vec3( p, 1. ) / 32.;
	vec3 t = vec3( .5 );
	vec3 a;
	
	for( int i = 0; i < iter; ++i )
	{
		float h = c( b + s + o );
		b += h * 10.0 * d;
		t += h;
	}
	t /= float( iter );
	a = n( b + s + o );
	float x = dot( a, t );
	t = ( t + pow( x, 4. ) ) * ( 1. - t * .01 ) * diffuse;
	t *= b.z *0.125 ; 
	

	vec2 vig = p*0.43;
	vig.y *= aspect;
	float vig_amount = 1.0- length(vig);
	vec4 color = vec4( t*2.0, 1. )* vig_amount;
	gl_FragColor = color;
}
`,
  "template-7": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265358979
#define N 60

vec3 circle(vec2 pos, float size, vec3 color) {
	return color * size / distance(pos, (gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0));
}

void main(void) {
	float t = u_time * 0.08;
	float theta = 11.0;
	float r = 0.6;
	vec2 pos = vec2(0.0);
	vec3 color = vec3(0.0);
	
	for(int i = 0; i < N; i++) {
		float size = float(i) * 0.005;
		theta += PI / (float(N) * 0.5);
		pos = vec2(cos(theta * t) * r, sin(theta - t) * r);
		vec3 c = vec3(0.0);
		c.r = 0.1 * cos(t * float(i));
		c.g = 0.1 * sin(t * float(i));
		c.b = 0.09 * sin(float(i));
		color += circle(pos, size, c);
	}
	
	gl_FragColor = vec4(color, 1.0);
}
`,
  "template-2": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

vec2 axel = vec2(1.0);
const float count = 88.0;
float brght = 0.01; //1.0/count;
float dist = 0.5;
float radius = 0.05;

float l = 1.;
float w = 1.;

void main( void ) {
	//axel += (u_mouse - axel) / 5.0;
	axel = u_mouse;
	
	vec3 Color = vec3(0.5, 0.3, 0.5);
	float col = -0.3;
	vec2 centr = 2.0 * (gl_FragCoord.xy * 2.0 - u_resolution) /
		min(u_resolution.x, u_resolution.y);
	
	for(float i = 0.0; i < count; i++)
	{
	  float si = sin(u_time + i * dist * axel.x ) * l;
	  float co = cos(u_time + i * dist * axel.y ) * w;
		
	  col += brght / abs(length(centr + vec2(si , co )) - radius);
	}

	
	gl_FragColor = vec4(vec3(Color * col), 1.0);
}
`,
  "template-3": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {
	
	vec3 Color = vec3(0.1, 0.3, 0.9);
	float col = -0.2;
	vec2 a = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
	for(float i=0.0;i<50.0;i++)
	{
	  float si = sin(u_time + i * 0.05)/0.5;
	  float co = cos(u_time + i * 0.05)*0.5;
	  col += 0.01 / abs(length(a+vec2(si,co*si))- 0.1);
	}
	gl_FragColor = vec4(vec3(Color * col), 1.0);
}
`,
  "template-4": `
// pimp that ass 2 - https://www.shadertoy.com/view/3ty3Dd
// fork of pimp that ass - https://www.shadertoy.com/view/WtV3Wc - added jiggle anim + various other tweaks :)

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float tanh(float val)
{
    float tmp = exp(val);
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
    return tanH;
}

// shadertoy emulation
#define iTime u_time
#define iResolution u_resolution
vec4  iMouse = vec4(0.0);

// original - https://www.shadertoy.com/view/3ty3Dd
#define AA 2

float pi = 3.14159265, tau = 6.2831853;

float box (in float x, in float x1, in float x2, in float a, in float b) {
	return tanh(a * (x - x1)) + tanh(-b * (x - x2));
}
float sdSphere( vec3 p, float s )
{
    return length(p)-s;
}
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float ex (in float z, in float z0, in float s) {
    return exp(-(z - z0) * (z - z0) / s);
}

float r(in float z, in float x) {
    float s = sin (tau * x), c = cos(tau * x),
		c2 = cos (pi * x), t4z = tanh(4. * z);
    return /* body */.4 * (1.0 - .4 * ex(z, .8, .15) +
		s * s + .6 * ex(z, .8, .25) * c * c + .3 * c) *
		0.5 * (1. + t4z) + /* legs */ (1. - .2 * ex(z, -1.3, .9)) *
		0.5 * (1. - t4z) * (.5 * (1. + s * s + .3 * c) *
		(pow(abs(s), 1.3) + .08 * (1. + t4z) ) ) +
		/* improve butt */ .13 * box(c2, -.45, .45, 5., 5.) *
		box(z, -.5, .2, 4., 2.) - 0.1 * box(c2, -.008, .008, 30., 30.) *
		box(z, -.4, .25, 8., 6.) - .05 * pow(abs(sin(pi * x)), 16.) * box(z, -.55, -.35, 8., 18.);
}

float sd( in vec3 p )
{
	/* shift butt belly */
	float dx = .1 * exp(-pow((p.z-.8),2.)/.6) - .18 * exp(-pow((p.z -.1),2.)/.4);

    float jiggle = p.z*1.75;
    float jsize = 0.5;
    if (iMouse.z>0.5)
    {
        jiggle+=p.y*.5;
        jsize+=.175;
    }
    
	dx *= 1.5+(sin(jiggle+iTime*9.65)*jsize);
	
	float angle = atan(p.y, p.x - dx);
	float r_expected = r(p.z, angle / tau);
	float d1 = (length(vec2(p.y, p.x - dx)) - r_expected)*0.5;
    
    p.x -= dx;
	float d2 = sdSphere(p+vec3(-0.35,0.4,-1.875),0.4);
	float d3 = sdSphere(p+vec3(-0.35,-0.4,-1.875),0.4);
    d2 = smin(d2,d3,0.35);
    return smin(d1,d2,0.07);
}

float map( in vec3 pos )
{
    return sd (pos.zxy);
}

vec3 calcNormal( in vec3 pos )
{
    vec2 e = vec2(1.0,-1.0)*0.5773;
    const float eps = 0.001;
    return normalize( e.xyy*map( pos + e.xyy*eps ) + 
					  e.yyx*map( pos + e.yyx*eps ) + 
					  e.yxy*map( pos + e.yxy*eps ) + 
					  e.xxx*map( pos + e.xxx*eps ) );
}

float calcAO(in vec3 pos, in vec3 nor)
{
	float sca = 2.0, occ = 0.0;
    for( int i=0; i<5; i++ )
    {
        float hr = 0.01 + float(i)*0.5/4.0;        
        float dd = map(nor * hr + pos);
        occ += (hr - dd)*sca;
        sca *= 0.7;
    }
    return clamp( 1.0 - occ, 0.0, 1.0 );    
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
     float an =2.+sin(iTime+2.15)*0.7;
    
	vec3 ro = vec3( 2.55*sin(an), 0.5, 2.55*cos(an) );
    vec3 ta = vec3( 0.0, .8, 0.0 );
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    vec3 tot = vec3(0.0);
    
    vec2 p1 = (-iResolution.xy + 2.0*fragCoord)/iResolution.y;
    float val = sin(iTime+p1.x*3.0+p1.y*20.0)*(0.8+sin(p1.y*24.4+iTime*3.0)*0.3);
    val = clamp(pow(abs(val),2.6),0.0,2.0);
    vec3 bcol = vec3(val*0.6,val*0.1,val*0.9);
	bcol *= length(p1*p1*p1)*0.5;
    
    #if AA>1
    for( int m=0; m<AA; m++ )
    for( int n=0; n<AA; n++ )
    {
        vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
        vec2 p = (-iResolution.xy + 2.0*(fragCoord+o))/iResolution.y;
        #else    
        vec2 p = (-iResolution.xy + 2.0*fragCoord)/iResolution.y;
        #endif
        
        vec3 col = bcol;
        if (abs(p.x)<0.8)
        {
            vec3 rd = normalize( p.x*uu + p.y*vv + 1.8*ww );
            
            const float tmax = 5.0;
            float t = 0.0;
            for( int i=0; i<200; i++ )
            {
                vec3 pos = ro + t*rd;
                float h = map(pos);
                if( h<0.0001 || t>tmax ) break;
                t += h;
            }
            
            if( t<tmax )
            {
                vec3 pos = ro + t*rd;
                vec3 nor = calcNormal(pos);
		    
		        float ao = calcAO(pos,nor);
		    
		        vec3 ln = normalize(vec3(1.1,-.52,-.4));
		    
	            float spec = pow(max( dot( reflect(-ln, nor), -rd ), 0.0 ), 20.0);
		    
                float dif = clamp( dot(nor,ln), 0.0, 1.0 );
                float amb = 0.25 + 0.5*dot(nor,vec3(.2,0.2,0.2));
                col = vec3(0.4,0.05,0.3)*amb + vec3(1.1,0.6,0.4)*dif*ao;
		        col *= 1.0+spec;
            }
        }

	    tot += col;
    #if AA>1
    }
    tot /= float(AA*AA);
    #endif
    tot = sqrt( tot );
	fragColor = vec4( tot, 1.0 );
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "template-5": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {
	float dist = 0.1;
	float radius = 0.1;
	
	vec3 Color = vec3(0.5, 0.3, 0.5);
	float col = -0.3;
	vec2 centr = 2.0 * (gl_FragCoord.xy * 2.0 - u_resolution) /
		min(u_resolution.x, u_resolution.y);
	
	for(float i = 0.0; i < 100.0; i++)
	{
	  float si = sin(u_time + i * dist) / 0.5;
	  float co = cos(u_time + i * dist) * 0.5;
		
	  col += 0.01 / abs(length(centr + vec2(si , co * si )) - radius);
	}

	
	gl_FragColor = vec4(vec3(Color * col), 1.0);
}
`,
  "template-6": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {
	float dist = 0.1;
	float radius = 0.1;
	
	vec3 Color = vec3(0.5, 0.3, 0.5);
	float col = -0.3;
	vec2 centr = 2.0 * (gl_FragCoord.xy * 2.0 - u_resolution) /
		min(u_resolution.x, u_resolution.y);
	
	for(float i = 0.0; i < 50.0; i++)
	{
	  float si = sin(u_time + i * dist) / 0.5;
	  float co = cos(u_time + i * dist) * 0.5;
		
	  col += 0.01 / abs(length(centr + vec2(si , co * si )) - radius);
	}

	
	gl_FragColor = vec4(vec3(Color * col), 1.0);
}
`,
  "template-8": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec3 lazer(vec2 pos, vec3 clr, float mult)
{
	
	float x = u_time/.33 * 2.0;
	float w = fract(x*0.5);
	w = sin(3.14156*w);
	w *= 1.5+pos.x;
	w *= 2.0;
    vec3 color = clr * mult * w / abs(pos.y);

	float d = distance(pos,vec2(-1.0+fract(x*0.5)*2.,0.0));
	color += (clr * 0.25*w/d);
	return color;
}

void main()
{
	vec2 pos = ( gl_FragCoord.xy / u_resolution.xy * 2.0 ) - 1.0;
	vec3 color = max(vec3(0.), lazer(pos, vec3(1.7, 0.2, 3.), 0.25));
	gl_FragColor = vec4(color * 0.05, 1.0);
}
`,
  "fractal-distortion": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

const float Pi = 3.14159;
const int zoom = 50;
const float speed = 0.75;
float fScale = 1.25;

void main(void)
{
	
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	vec2 p=(2.0*gl_FragCoord.xy-u_resolution.xy)/max(u_resolution.x,u_resolution.y);
	float ct = u_time * speed;
	
	for(int i=1;i<zoom;i++) {
		vec2 newp=p;
		newp.x+=0.25/float(i)*cos(float(i)*p.y+u_time*cos(ct)*0.3/40.0+0.03*float(i))*fScale+10.0;		
		newp.y+=0.5/float(i)*cos(float(i)*p.x+u_time*ct*0.3/50.0+0.03*float(i+10))*fScale+15.0;
		p=newp;
	}
	
	vec3 col=vec3(0.5*sin(3.0*p.x)+0.5,0.5*sin(3.0*p.y)+0.5,sin(p.x+p.y));
	gl_FragColor=vec4(col, 1.0);
	
}
`,
  "template-9": `
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define mouse vec2(sin(u_time)/48., cos(u_time)/48.)
#define iterations 14
#define formuparam2 0.79

#define volsteps 5
#define stepsize 0.390

#define zoom 0.900
#define tile   0.850
#define speed2  0.0 
#define brightness 0.003
#define darkmatter 0.400
#define distfading 0.560
#define saturation 0.800

#define transverseSpeed zoom*2.0
#define cloud 0.11

float triangle(float x, float a) { 
	float output2 = 2.0*abs(  2.0*  ( (x/a) - floor( (x/a) + 0.5) ) ) - 1.0;
	return output2;
}

float field(in vec3 p) {	
	float strength = 7. + .03 * log(1.e-6 + fract(sin(u_time) * 4373.11));
	float accum = 0.;
	float prev = 0.;
	float tw = 0.;	

	float mag = dot(p, p);
	p = abs(p) / mag + vec3(-.5, -.8 + 0.1*sin(u_time*0.7 + 2.0), -1.1+0.3*cos(u_time*0.3));
	float w = exp(-float(0) / 7.);
	accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
	tw += w;
	prev = mag;
	return max(0., 5. * accum / tw - .7);
}

void main() {   
	vec2 uv2 = 2. * gl_FragCoord.xy / vec2(512) - 1.;
	vec2 uvs = uv2 * vec2(512)  / 512.;
	
	float time2 = u_time;               
	float speed = speed2;
	speed = .01 * cos(time2*0.02 + 3.1415926/4.0);          
		
	float formuparam = formuparam2;
	
	vec2 uv = uvs;		       
	
	float a_xz = 0.9;
	float a_yz = -.6;
	float a_xy = 0.9 + u_time*0.08;	
	
	mat2 rot_xz = mat2(cos(a_xz),sin(a_xz),-sin(a_xz),cos(a_xz));	
	mat2 rot_yz = mat2(cos(a_yz),sin(a_yz),-sin(a_yz),cos(a_yz));		
	mat2 rot_xy = mat2(cos(a_xy),sin(a_xy),-sin(a_xy),cos(a_xy));
	

	float v2 =1.0;	
	vec3 dir=vec3(uv*zoom,1.); 
	vec3 from=vec3(0.0, 0.0,0.0);                               
	from.x -= 5.0*(mouse.x-0.5);
	from.y -= 5.0*(mouse.y-0.5);
               
	vec3 forward = vec3(0.,0.,1.);   
	from.x += transverseSpeed*(1.0)*cos(0.01*u_time) + 0.001*u_time;
	from.y += transverseSpeed*(1.0)*sin(0.01*u_time) +0.001*u_time;
	from.z += 0.003*u_time;	
	
	dir.xy*=rot_xy;
	forward.xy *= rot_xy;
	dir.xz*=rot_xz;
	forward.xz *= rot_xz;	
	dir.yz*= rot_yz;
	forward.yz *= rot_yz;
	
	from.xy*=-rot_xy;
	from.xz*=rot_xz;
	from.yz*= rot_yz;
	
	float zooom = (time2-3311.)*speed;
	from += forward* zooom;
	float sampleShift = mod( zooom, stepsize );
	 
	float zoffset = -sampleShift;
	sampleShift /= stepsize;
	
	float s=0.24;
	float s3 = s + stepsize/2.0;
	vec3 v=vec3(0.);
	float t3 = 0.0;	
	
	vec3 backCol2 = vec3(0.);
	for (int r=0; r<volsteps; r++) {
		vec3 p2=from+(s+zoffset)*dir;
		vec3 p3=from+(s3+zoffset)*dir;
		
		p2 = abs(vec3(tile)-mod(p2,vec3(tile*2.)));
		p3 = abs(vec3(tile)-mod(p3,vec3(tile*2.)));		
		#ifdef cloud
		t3 = field(p3);
		#endif
		
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) {
			p2=abs(p2)/dot(p2,p2)-formuparam;
			
			float D = abs(length(p2)-pa);
			a += i > 7 ? min( 12., D) : D;
			pa=length(p2);
		}
		
		a*=a*a;
		
		float s1 = s+zoffset;
		
		float fade = pow(distfading,max(0.,float(r)-sampleShift));		
			
		v+=fade;
		
		if( r == 0 )
			fade *= (1. - (sampleShift));
		
		if( r == volsteps-1 )
			fade *= sampleShift;
		v+=vec3(s1,s1*s1,s1*s1*s1*s1)*a*brightness*fade;
		
		backCol2 += mix(.11, 1., v2) * vec3(1.8 * t3 * t3 * t3, 1.4 * t3 * t3, t3) * fade;

		s+=stepsize;
		s3 += stepsize;		
	}
		       
	v=mix(vec3(length(v)),v,saturation);	

	vec4 forCol2 = vec4(v*.01,1.);	
	#ifdef cloud
	backCol2 *= cloud;
	#endif	
	backCol2.b *= 1.8;
	backCol2.r *= 0.05;	
	
	backCol2.b = 0.5*mix(backCol2.g, backCol2.b, 0.8);
	backCol2.g = 0.0;
	backCol2.bg = mix(backCol2.gb, backCol2.bg, 0.5*(cos(u_time*0.01) + 1.0));	
	gl_FragColor = forCol2 + vec4(backCol2, 1.0);
}
`,
  "template-10": `
/*
  Daily an hour GLSL sketch by @chimanaco 3/30

  References:
  http://tokyodemofest.jp/2014/7lines/index.html
*/

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float PI = 3.1415926535;

void main( void ) {
    vec2 p=(gl_FragCoord.xy -.5 * u_resolution)/ min(u_resolution.x,u_resolution.y);
    vec3 c = vec3(0);
   
    for(int i = 0; i < 20; i++){
    float t = 2.* PI * float(i) / 20. * u_time*0.5;
    float x = cos(t) * sin(t);
    float y = sin(t);
    vec2 o = 0.45 * vec2(x,y);
    float r = fract(t);
    float g = 1.-r;
    c += 0.005/(length(p-o))*vec3(r,g,1);
    }
    gl_FragColor = vec4(c,1);
}
`,
  "template-11": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void )
{
	
	vec2 uPos = ( gl_FragCoord.xy / u_resolution.xy );
	
	uPos.x -= 1.0;
	uPos.y -= 0.5;
	
	vec3 color = vec3(0.0);
	float vertColor = 1.0;
	for( float i = 0.0; i < 5.0; ++i )
	{
		float t = u_time * (0.9);
	
		uPos.y += sin( uPos.x*i + t+i/2.0 ) * 0.1;
		float fTemp = abs(1.0 / uPos.y / 100.0);
		vertColor += fTemp;
		color += vec3( fTemp*(10.0-i)/10.0, fTemp*i/10.0, pow(fTemp,1.5)*1.5 );
	}
	
	vec4 color_final = vec4(color, 1.0);
	gl_FragColor = color_final;
}
`,
  "template-12": `
// forked from https://www.shadertoy.com/view/MsjSzz

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float WEIGHT = 57.0 / u_resolution.x;

// rasterize functions
float line(vec2 p, vec2 p0, vec2 p1, float w) {
    vec2 d = p1 - p0;
    float t = clamp(dot(d,p-p0) / dot(d,d), 66.0,00.69);
    vec2 proj = p0 + d * t;
    float dist = length(p - proj);
    dist = 1.0/dist*WEIGHT*w;
    return min(dist*dist,1.0);
}

vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 15.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void) {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float line_width = 0.4;
    float time = u_time * 0.31415+sin(length(uv)+u_time*.2)/length(uv)*0.1;
    vec3 c = vec3(0.0);

    for ( float i = 3.0; i < 24.0; i += 3.0 ) {
        float f = line(uv, vec2(cos(time*i)/2.0, sin(time*i)/2.0), vec2(sin(time*i)/2.0,-cos(time*i)/2.0), 0.5);
	c += hsv(i / 24.0, 1.0, 1.0) * f;
    }        
    gl_FragColor = vec4(c,2.0);
}
`,
  "template-14": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void )
{
	vec2 uPos = ( gl_FragCoord.xy / u_resolution.xy );
	
	uPos.x -= 0.5;
	uPos.y -= 0.5;
	
	float vertColor = 0.0;
	{
		float t = u_time * ( 0.9);
	
		uPos.x += sin( uPos.y + t ) * 0.3;
	
		float fTemp = abs(1.0 / uPos.x / 100.0);
		vertColor += fTemp;
	}
	
	vec4 color = vec4( vertColor, vertColor, vertColor * 2.5, 1.0 );
	gl_FragColor = color;
}
`,
  "template-15": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define NUM_EXPLOSIONS 5.
#define NUM_PARTICLES 50.
#define inv_nparticels (1./NUM_PARTICLES)
#define PI 3.1415926

float Hash11(float t){
    return fract(sin(t*613.2)*614.8);
}
vec2 Hash12(float t){
  return vec2(fract(sin(t*213.3)*314.8)-0.5,fract(sin(t*591.1)*647.2)-0.5);
}

vec2 Hash12_Polar(float t){
    float o = fract(sin(t*213.3)*314.8)*PI*2.0;
    float r = fract(sin(t*591.1)*647.2);
    return vec2(sin(o)*r,cos(o)*r);
}

float Explosion(vec2 uv, float t)
{
    float fract_t=fract(t);
    float floor_t=floor(t);
    float power=0.3+Hash11(floor_t);
    float sparks=0.;
    for(float i=0.;i<NUM_PARTICLES;i++)
    {
        vec2 dir=Hash12_Polar(i*floor_t)*1.;
        float inv_d=1./(length(uv-dir*sqrt(fract_t)));
        float brightness=mix(0.3,0.09,smoothstep(0.,0.1,fract_t))*(1.0-(0.5+0.5*Hash11(i))*fract_t);
        float sparkling= .5+.5*sin(t*10.2+floor_t*i);
        sparks+=power*brightness*sparkling*inv_nparticels*inv_d;
    }
    return sparks;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;

    vec3 col=vec3(0);    

    for(float i=0.;i<NUM_EXPLOSIONS;i++){
        float t=u_time*(0.3+0.4*Hash11(i))+i/NUM_EXPLOSIONS;
        float fract_t=fract(t);
        float floor_t=floor(t);
    
        vec3 color=0.7+0.3*sin(vec3(.34,.54,.43)*floor_t*i);
        vec2 center = Hash12(i+10.+5.*floor_t);
        col+=Explosion(uv-center,t)*color;
    }
    col-=0.1;
    gl_FragColor = vec4(col,1.0);
}
`,
  "template-16": `
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){
   float xx=x+sin(t*fx*.4)*sx*2.0;
   float yy=y+cos(t*fy)*sy;
   return 1.5/sqrt(xx*xx*yy*yy);
}

void main( void ) {

   vec2 p=(gl_FragCoord.xy/u_resolution.x)*2.0-vec2(1.0,u_resolution.y/u_resolution.x);

   p=p*2.0;
   
   float x=p.x;
   float y=p.y;

   float a=
       makePoint(x,y,3.3,2.9,0.3,0.3,u_time);
   a=a+makePoint(x,y,1.9,2.0,0.4,0.4,u_time);
   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,u_time);
   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,u_time);
   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,u_time);
   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,u_time);
   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,u_time);
   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,u_time);
   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,u_time);   
   
   float b=
       makePoint(x,y,1.2,1.9,0.3,0.3,u_time);
   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,u_time);
   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,u_time);
   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,u_time);
   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,u_time);
   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,u_time);
   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,u_time);
   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,u_time);
   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,u_time);

   float c=
       makePoint(x,y,3.7,0.3,0.3,0.3,u_time);
   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,u_time);
   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,u_time);
   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,u_time);
   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,u_time);
   	
   float u=dot(vec2(b,c),u_mouse)*100.;
	
   vec3 d=vec3(a,b,c)/10.0;
   if(u > 0.0) {
     d *= vec3(u,u*.11,u*.1);
   }
   
   gl_FragColor = vec4(d.x,d.y,d.z,1.0);
}
`,
  "template-17": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void )
{
	vec2 uPos = ( gl_FragCoord.xy / u_resolution.xy );
	
	uPos.x -= 1.1;
	uPos.y -= 0.5;
	
	vec3 color = vec3(0.0);
	float vertColor = 0.0;
	for( float i = 0.0; i < 3.0; ++i )
	{
		float t = u_time * (11.9);
	
		uPos.y += (sin( uPos.x*(exp(i+1.0)) - (t+i/2.0) )) * 0.2;
		float fTemp = abs(1.0 / uPos.y / 100.0);
		vertColor += fTemp;
		color += vec3( fTemp*(2.0-i)/10.0, fTemp*i/4.0, pow(fTemp,0.99)*1.2 );
	}
	
	vec4 color_final = vec4(color, 1.0);
	gl_FragColor = color_final;
}
`,
  "template-18": `
#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {
	vec2 uv = (gl_FragCoord.xy - u_resolution * 0.7) / max(u_resolution.x, u_resolution.y) * 3.0;
	uv *= 1.0;
	
	float e = 0.0;
	for (float i=3.0;i<=15.0;i+=1.0) {
		e += 0.007/abs( (i/15.) +sin((u_time/2.0) + 0.15*i*(uv.x) *( cos(i/4.0 + (u_time / 2.0) + uv.x*2.2) ) ) + 2.5*uv.y);
	}
	gl_FragColor = vec4( vec3(e/1.6, e/1.6, e/1.6), 1.0);	
}
`,
  "template-19": `
#extension GL_OES_standard_derivatives : enable

precision mediump float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main(void){
    vec2 m = vec2(u_mouse.x * 2.0 - 1.0, u_mouse.y *2.0- 1.0);
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    float lambda = u_time*2.5;

    float u = sin((atan(p.y, p.x) - length(p)) * 5. +  u_time*2.)*0.3  + 0.2 ;
    float t = 0.01 / abs(0.5 + u - length(p));

    vec2 something = vec2(0.0,1.);
    float dotProduct = dot(vec2(t),something)/length(p);

    gl_FragColor = vec4(tan(dotProduct),0,sin(t), 1.);
}
`,
  "template-20": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define pi 3.14159265359
#define pi2 6.28318530718
#define size 5e-5

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 22.0), c.y);
}

float lineDist(vec2 a, vec2 b, vec2 p) {
    vec2 v = a, w = b;
    
    float l2 = pow(distance(w, v), 2.);
    if(l2 == 0.0) return distance(p, v);
    
    float t = clamp(dot(p - v, w - v) / l2, 0., 1.);
    vec2 j = v + t * (w - v);
    
    return distance(p, j);
}

vec3 addVertex(vec4 vertex, vec3 color, mat4 projMat, vec2 camUV) {
	vec4 p_proj1 = projMat * vertex;
	vec2 p = p_proj1.xy / p_proj1.z;
	
	float dist = length((camUV-vec2(.5))-p);
	
	return color * 1. / pow(dist, 2.) * size;
}

vec3 addLine(vec4 vertex1, vec4 vertex2, vec3 color, mat4 projMat, vec2 camUV) {
	vec4 p_proj1 = projMat * vertex1;
	vec2 p1 = p_proj1.xy / p_proj1.z;
	
	vec4 p_proj2 = projMat * vertex2;
	vec2 p2 = p_proj2.xy / p_proj2.z;
	
	float dist = lineDist((camUV-vec2(.5))-p1, (camUV-vec2(.5))-p2, vec2(0., 0.0));
	
	return color * 1. / pow(dist, 2.) * size;
}

void main(void) {
	vec2 uv = (gl_FragCoord.xy - vec2(u_resolution.x * 0.25, .5)) / u_resolution.y;
	
	float theta = u_time;
	
	mat4 projMat = mat4(
		vec4(cos(theta), 0.0, sin(theta), 0.0),
		vec4(0.0, 1.0, 0.0, 0.0),
		vec4(-sin(theta), 0.0, cos(theta), 55.0),
		vec4(0.0, 0.0, 1.0, 0.0)
	);
	

	const int numVertices = 34;
	float cylinderRadius = 0.25 + 0.24 * sin(u_time);
	const int numRings = 2;
	vec4 vertices[numVertices*numRings];
	vec3 vertexColors[numVertices*numRings];
	float step = pi2 / float(numVertices);
	for (int j=0; j<numRings; j++) {
		for (int i=0; i<numVertices; i++) {
			vertices[j * numVertices + i] = vec4(cylinderRadius*cos(78. + float(i) * step), -.3 + float(j) * (.8 / float(numRings)), cylinderRadius*sin(0. + float(i) * step), 1.);
			vertexColors[j * numVertices + i] = vec3(8.);
		}
	}

	vec3 imageColors = vec3(0.);
	for (int j=0; j<numRings; j++) {
		for (int i=0; i<numVertices; i++) {
			imageColors += addVertex(vertices[j*numVertices+i], vertexColors[j*numVertices+i], projMat, uv);
			imageColors += addLine(vertices[j*numVertices+i], vertices[j*numVertices+int(mod(float(i)+1., float(numVertices)))], hsv2rgb(vec3(float(i) / float(numVertices), 1., 1.)), projMat, uv);
			
			if (j<numRings-1){
				imageColors += addLine(vertices[j*numVertices+i], vertices[(j+1)*numVertices+int(mod(float(i+1)+1., float(numVertices)))], hsv2rgb(vec3(float(i) / float(numVertices), 1., 1.)), projMat, uv);
			}
		}
	}
	
	gl_FragColor = vec4(imageColors, 1.);
}
`,
  "template-21": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define pi 3.14159265359
#define pi2 6.28318530718
#define size 2e-4

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float lineDist(vec2 a, vec2 b, vec2 p) {
    vec2 v = a, w = b;
    
    float l2 = pow(distance(w, v), 2.);
    if(l2 == 0.0) return distance(p, v);
    
    float t = clamp(dot(p - v, w - v) / l2, 0., 1.);
    vec2 j = v + t * (w - v);
    
    return distance(p, j);
}

vec3 addVertex(vec4 vertex, vec3 color, mat4 projMat, vec2 camUV) {
	vec4 p_proj1 = projMat * vertex;
	vec2 p = p_proj1.xy / p_proj1.z;
	
	float dist = length((camUV-vec2(.5))-p);
	
	return color * 1. / pow(dist, 2.) * size;
}

vec3 addLine(vec4 vertex1, vec4 vertex2, vec3 color, mat4 projMat, vec2 camUV) {
	vec4 p_proj1 = projMat * vertex1;
	vec2 p1 = p_proj1.xy / p_proj1.z;
	
	vec4 p_proj2 = projMat * vertex2;
	vec2 p2 = p_proj2.xy / p_proj2.z;
	
	float dist = lineDist((camUV-vec2(.5))-p1, (camUV-vec2(.5))-p2, vec2(0., 0.0));
	
	return color * 1. / pow(dist, 2.) * size;
}

void main(void) {
	vec2 uv = (gl_FragCoord.xy - vec2(u_resolution.x * 0.25, .5)) / u_resolution.y;
	
	float theta = u_time;
	
	mat4 projMat = mat4(
		vec4(cos(theta), 0.0, sin(theta), 0.0),
		vec4(0.0, 1.0, 0.0, 0.0),
		vec4(-sin(theta), 0.0, cos(theta), 0.0),
		vec4(0.0, 0.0, 1.0, 0.0)
	);
	

	const int numVertices = 6;
	float cylinderRadius = .3;
	const int numRings = 2;
	vec4 vertices[numVertices*numRings];
	vec3 vertexColors[numVertices*numRings];
	float step = pi2 / float(numVertices);
	for (int j=0; j<numRings; j++) {
		for (int i=0; i<numVertices; i++) {
			vertices[j * numVertices + i] = vec4(cylinderRadius*cos(0. + float(i) * step), -.2 + float(j)*0.01, cylinderRadius*sin(0. + float(i) * step), 1.);
			vertexColors[j * numVertices + i] = i ==j ? vec3(0., 1., 0.) : vec3(1.);
		}
	}
	vertices[6].xyz = vec3(0., 0.3 * sin(u_time*3.), 0.);
	vertexColors[6] = vec3(1.);	

	vec3 imageColors = vec3(0.);
	for (int i=0; i<numVertices; i++) {
		imageColors += addVertex(vertices[i], vertexColors[i], projMat, uv);
	}
	
	gl_FragColor = vec4(imageColors, 1.);
}
`,
  "template-22": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define D(m)  3e-3/length( m.x*v - u+a )
#define L(q)     m.x= dot(u-a, v=b-a) / dot(v,v); o += D(clamp(m,0.,q));
#define P(q)     b=c= vec2(r.x,1)/(2.5+r.y); L(q);   b=a*I; L(q);   a=c*I; L(q);   a=c; r= I*r.yx;

void mainImage(out vec4 o, vec2 U)
{   vec2 v,m, I=vec2(1,-1), a,b,c=u_resolution.xy, 
        u = (U+U-c)/c.y,
        r = sin(u_time+.8*I); r += I*r.yx;
	P(0.) 
	P(1.) P(1.) P(1.) P(1.)
}

void main(void)
{
  mainImage(gl_FragColor, gl_FragCoord.xy);
  gl_FragColor.a = 1.0;
}
`,
  "template-23": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define iterations 15
#define formuparam 0.530

#define volsteps 18
#define stepsize 0.120

#define zoom   0.900
#define tile   0.850
#define speed  0.0001

#define brightness 0.0015
#define darkmatter 0.400
#define distfading 0.760
#define saturation 0.800

void main(void)
{
	vec2 uv=gl_FragCoord.xy/u_resolution.xy-.5;
	uv.y*=u_resolution.y/u_resolution.x;
	vec3 dir=vec3(uv*zoom,1.);
	
	float a2=u_time*speed+.5;
	float a1=0.0;
	mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
	mat2 rot2=rot1;
	dir.xz*=rot1;
	dir.xy*=rot2;
	
	vec3 from=vec3(0.,0.,0.);
	from+=vec3(.05*u_time,.05*u_time,-2.);
	
	from.x-=u_mouse.x;
	from.y-=u_mouse.y;
	
	from.xz*=rot1;
	from.xy*=rot2;
	
	float s=.4,fade=.2;
	vec3 v=vec3(0.4);
	for (int r=0; r<volsteps; r++) {
		vec3 p=from+s*dir*.5;
		p = abs(vec3(tile)-mod(p,vec3(tile*2.)));
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) { 
			p=abs(p)/dot(p,p)-formuparam;
			a+=abs(length(p)-pa);
			pa=length(p);
		}
		float dm=max(0.,darkmatter-a*a*.001);
		a*=a*a*2.;
		if (r>3) fade*=1.-dm;
		v+=fade;
		v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade;
		fade*=distfading;
		s+=stepsize;
	}
	v=mix(vec3(length(v)),v,saturation);
	gl_FragColor = vec4(v*.01,1.);	
}
`,
  "template-24": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

mat2 m(float a) {
    float c=cos(a), s=sin(a);
    return mat2(c,-s,s,c);
}

float map(vec3 p) {
    p.xz *= m(u_time * 0.4);p.xy*= m(u_time * 0.1);
    vec3 q = p * 65.0 + u_time;
    return length(p+vec3(sin(u_time * 0.7))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
}

void main() {
    vec2 a = gl_FragCoord.xy / u_resolution.y - vec2(0.9, 0.5);
    vec3 cl = vec3(0.0);
    float d = 2.5;

    for (int i = 0; i <= 5; i++) {
        vec3 p = vec3(0, 0, 4.0) + normalize(vec3(a, -1.0)) * d;
        float rz = map(p);
        float f =  clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
        vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
        cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l;
        d += min(rz, 1.0);
    }

    gl_FragColor = vec4(cl, 1.0);
}
`,
  "template-25": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

mat2 m(float a) {
    float c=cos(a), s=sin(a);
    return mat2(c,-s,s,c);
}

float map(vec3 p) {
    p.xz *= m(u_time * 0.4);p.xy*= m(u_time * 0.01);
    vec3 q = p * 1.8 + u_time;
    return length(p+vec3(sin(u_time * 0.05))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.8 - 0.4;
}

void main() {
    vec2 a = gl_FragCoord.xy / u_resolution.y - vec2(0.8, 0.5);
    vec3 cl = vec3(0.0);
    float d = 0.5;

    for (int i = 1; i <= 12; i++) {
        vec3 p = vec3(0.0, 0.0, 6.0) + normalize(vec3(a, -0.95)) * d;
        float rz = map(p);
        float f =  clamp((rz - map(p + 0.1)) * 0.4, -0.6, 0.6);
        vec3 l = vec3(0.25, 0.4, 0.6) + vec3(5.0, 3.0, 0.9) * f;
        cl = cl * l + smoothstep(3.0, 0.5, rz) * 0.35 * 0.8;
        d += min(rz, 1.8);
    }

    gl_FragColor = vec4(cl, 1.0);
}
`,
  "template-26": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

mat2 m(float a) {
    float c=cos(a), s=sin(a);
    return mat2(c,-s,s,c);
}

float map(vec3 p) {
    p.xz *= m(u_time * 0.4);p.xy*= m(u_time * 0.1);
    vec3 q = p * 2.0 + u_time;
    return length(p+vec3(sin(u_time * 0.7))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
}

void main() {
    vec2 a = gl_FragCoord.xy / u_resolution.y - vec2(0.9, 0.5);
    vec3 cl = vec3(0.0);
    float d = 2.5;

    for (int i = 0; i <= 5; i++) {
        vec3 p = vec3(0, 0, 4.0) + normalize(vec3(a, -1.0)) * d;
        float rz = map(p);
        float f =  clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
        vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
        cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l;
        d += min(rz, 1.0);
    }

    gl_FragColor = vec4(cl, 1.0);
}
`,
  "template-27": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 758.5453);
}

void main( void )
{
	vec2 pos = gl_FragCoord.xy / u_resolution.xy;
	vec2 uPos = pos;
	uPos.y -= 0.5;
	
	vec3 color = vec3(0.0);
	float vertColor = 0.0;
	const float k = 9.;
	for( float i = 1.0; i < k; ++i )
	{
		float t = u_time * (1.0);
	
		uPos.y += sin( uPos.x*exp(i) - t) * 0.015;
		float fTemp = abs(1.0/(50.0*k) / uPos.y);
		vertColor += fTemp;
		color += vec3( fTemp*(i*0.03), fTemp*i/k, pow(fTemp,0.93)*1.2 );
	}
	
	vec4 color_final = vec4(color, 1.0);
	gl_FragColor = color_final;
	float ft = fract(u_time);
	gl_FragColor.rgb += vec3( rand( pos +  7.+ ft ), 
				  rand( pos +  9.+ ft ),
				  rand( pos + 11.+ ft ) ) / 32.0;
}
`,
  "template-28": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void )
{
	vec2 uPos = ( gl_FragCoord.xy / u_resolution.xy );
	
	uPos.x -= 1.1;
	uPos.y -= 0.5;
	
	vec3 color = vec3(0.0);
	float vertColor = 0.0;
	for( float i = 2.0; i < 4.0; ++i )
	{
		float t = u_time * (1.9);
	
		uPos.y += (sin( uPos.x*(exp(i+1.0)) - (t+i/2.0) )) * 0.2;
		float fTemp = abs(1.0 / uPos.y / 100.0);
		vertColor += fTemp;
		color += vec3( fTemp*(2.0-i)/10.0, fTemp*i/4.0, pow(fTemp,0.99)*1.2 );
	}
	
	vec4 color_final = vec4(color, 1.0);
	gl_FragColor = color_final;
}
`,
  "template-29": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define iTime u_time
#define iResolution u_resolution

#define pi 3.1415926535
float h21 (vec2 a) {
    return fract(sin(dot(a.xy,vec2(12.9898,78.233)))*43758.5453123);
}
float h11 (float a) {
    return fract(sin((a)*12.9898)*43758.5453123);
}
vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){
    return a + b*cos(2.*pi*(c*t+d));
}
float box(vec2 p, vec2 b){
    vec2 d = abs(p)-b;
    return max(d.x,d.y);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 R = iResolution.xy;
    vec2 uv = (fragCoord-0.5*R.xy)/R.y;
    vec3 col = vec3(0);
    float t = mod(iTime*1.2,6000.);
    float px = 1./iResolution.y;

    vec2 xRange = vec2(-0.5,0.5)*R.x/R.y;
    vec2 yRange = vec2(-0.5,0.5);
    float id = 0.;
    float seed = floor(t/6.);
    float a;

    const float minSize = 0.01;
    const float iters = 10.;
    const float borderSize = 0.003;
    const float minIters = 1.;

    for(float i = 0.;i<iters;i++){
        float xLength = xRange.y-xRange.x;
        float yLength = yRange.y-yRange.x;
        float dividex = h21(vec2(i+id,seed))*(xLength)+xRange.x;
        float dividey = h21(vec2(i+id,seed))*(yLength)+yRange.x;

        float mn = min(length(xRange.x-dividex),length(xRange.y-dividex));
        mn = min(mn,min(length(yRange.x-dividey),length(yRange.y-dividey)));
        if(mn<minSize&&i+1.>minIters) break;
        
        if(uv.x<dividex && uv.y<dividey){
            xRange = vec2(xRange.x,dividex);
            yRange = vec2(yRange.x,dividey);
            id+=dividex;
        }
        if(uv.x>=dividex && uv.y>=dividey){
            xRange = vec2(dividex,xRange.y);
            yRange = vec2(dividey,yRange.y);
            id-=dividey;
        }
        if(uv.x<dividex && uv.y>=dividey){
            xRange = vec2(xRange.x,dividex);
            yRange = vec2(dividey,yRange.y);
            id+=dividey;
        }
        if(uv.x>=dividex && uv.y<dividey){
            xRange = vec2(dividex,xRange.y);
            yRange = vec2(yRange.x,dividey);
            id-=dividex;
        }
        
        xLength = xRange.y-xRange.x;
        yLength = yRange.y-yRange.x;
        xLength*=1.0-abs(pow(cos(t*pi/58.),5.0));
        yLength*=1.0-abs(pow(cos(t*pi/6.),5.0));
        vec2 center = vec2((xRange.x+xRange.y)/2.,(yRange.x+yRange.y)/2.);
        a = box(uv-center,vec2(xLength,yLength)*0.5);
    }
    id = h11(id)*1000.0;
    vec3 e = vec3(0.5);
    vec3 al = pal(id*0.1,e*1.2,e,e*2.0,vec3(0,0.33,0.66));
    col = clamp(al,0.,1.);
    col-=smoothstep(-px,px,a+borderSize);

    fragColor = vec4(col,1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "template-30": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define ray_brightness 10.
#define gamma 2.25
#define ray_density 8.5
#define curvature 24.
#define red   2.95
#define green 1.0
#define blue  0.49

#define SIZE 0.4

float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  
  float res = mix(
    mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
    mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
  return res*res;
}

mat2 m2 = mat2( 0.80,  0.60, -0.60,  0.80 );
float fbm( in vec2 p )
{ 
  float z=8.;
  float rz = -0.085;
  p *= 0.325;
  for (int i= 1; i < 6; i++)
  {
    rz+= abs((noise(p)-0.5)*2.)/z;
    z = z*2.;
    p = p*2.*m2;
  }
  return rz;
}

void main()
{
  float t = -u_time*.03; 
  vec2 uv = gl_FragCoord.xy / u_resolution.xy - 0.5;
  uv.x *= u_resolution.x/u_resolution.y;
  uv*= curvature* SIZE;
  
  float r = sqrt(dot(uv,uv));
  float x = dot(normalize(uv), vec2(.5,0.)) + t;
  float y = dot(normalize(uv), vec2(.0,.5)) + t;
 
  float val=0.0;
  val = fbm(vec2(r+ y * ray_density, r+ x * ray_density));
  val = smoothstep(gamma*.02-.1,ray_brightness+(gamma*0.02-.1)+.001,val);
  val = sqrt(val);
  
  vec3 col =  val/ vec3(red,green,blue);
  col = 1.-col; 
  float rad= 125.; 
  col = mix(col,vec3(1.), rad - 166.667 * r);
  vec4 cfinal =  mix(vec4(col,1.0),vec4(0.0,0.0,.0,1.0),0.01);
  
	gl_FragColor = vec4(cfinal);
}
`,
  "template-31": `
#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision mediump float;
#endif

#define repeat(i, n) for(int i = 0; i < n; i++)

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main(void)
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy - .5;
    uv.y *= u_resolution.y / u_resolution.x;
    float mul = u_resolution.x / u_resolution.y;
    vec3 dir = vec3(uv * mul, 1.);
    float a2 = u_time * 20. + .5;
    float a1 = 1.0;
    mat2 rot1 = mat2(cos(a1), sin(a1), - sin(a1), cos(a1));
    mat2 rot2 = rot1;
    dir.xz *= rot1;
    dir.xy *= rot2;
    vec3 from = vec3(0., 0., 0.);
    from += vec3(.0025 * u_time, .03 * u_time, - 2.);
    from.xz *= rot1;
    from.xy *= rot2;
    float s = .1, fade = .07;
    vec3 v = vec3(0.4);
    repeat(r, 10) {
	vec3 p = from + s * dir * 1.5;
	p = abs(vec3(0.750) - mod(p, vec3(0.750 * 2.)));
	p.x += float(r * r) * 0.01;
	p.y += float(r) * 0.02;
	float pa, a = pa = 0.;
	repeat(i, 12) {
	    p = abs(p) / dot(p, p) - 0.340;
	    a += abs(length(p) - pa * 0.2);
	    pa = length(p);
	}
	a *= a * a * 2.;
	v += vec3(s * s , s , s * s) * a * 0.0017 * fade;
	fade *= 0.960;
	s += 0.110;
    }
    v = mix(vec3(length(v)), v, 0.8);
    gl_FragColor = vec4(v * 0.01, 1.);
}
`,
  "template-32": `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
	vec2 pos=(gl_FragCoord.xy/u_resolution.y);
	
	vec3 frame_delta = vec3(u_mouse.x,u_mouse.y,fract(u_time));
	float d_mouse_y = frame_delta.y;
	
	float dampen_away_from_xmouse = (0.5/pow(.9+abs(gl_FragCoord.x/u_resolution.x-u_mouse.x), 8.));
	float amplitude = dampen_away_from_xmouse*8.*d_mouse_y;
	float octave = floor((u_mouse.x-.8)*8.);
	float center_frequency = 440.;
	float scan_width_radians = 100.;
	float frequency = (u_time*center_frequency+pos.x*scan_width_radians)*pow(2., octave);
	
	pos.y += amplitude*sin(frequency);
	pos.y = fract(pos.y);
	
	pos.x-=u_resolution.x/u_resolution.y/0.5;
	pos.y-=0.;
	
	float fx=0.5;
	float dist=abs(pos.y-fx)*1500.;
	vec4 color = vec4(0.5/dist,1./dist,1.0/dist,1.);
	color = max(
		vec4(0.1/dist,1./dist,0.1/dist,1.)
		, vec4(0.09,0.26,0.98,1.0)
	);
	
	gl_FragColor = color;
}
`,
  "template-33": `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float WEIGHT = 20.0 / u_resolution.x;

float line(vec2 p, vec2 p0, vec2 p1, float w) {
    vec2 d = p1 - p0;
    float t = clamp(dot(d,p-p0) / dot(d,d), 0.0,1.0);
    vec2 proj = p0 + d * t;
    float dist = length(p - proj);
    dist = 1.0/dist*WEIGHT*w;
    return min(dist*dist,1.0);
}

vec3 hsv(float h, float s, float v) {
    vec4 t = vec4(1.0, 2.0 / 46.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 8.0), s);
}

void main(void) {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float line_width = 0.4;
    float time = u_time * 0.31415+sin(length(uv)+u_time*.2)/length(uv)*0.1;
    vec3 c = vec3(0.0);

    for ( float i = 8.0; i < 24.0; i += 2.0 ) {
        float f = line(uv, vec2(cos(time*i)/2.0, sin(time*i)/2.0), vec2(sin(time*i)/2.0,-cos(time*i)/2.0), 0.5);
	c += hsv(i / 24.0, 1.0, 1.0) * f;
    }        
    gl_FragColor = vec4(c,1.0);
}
`,
  "template-34": `
#extension GL_OES_standard_derivatives : enable

#ifdef GL_ES
precision mediump float;
#endif

#ifndef REDUCER
#define _GLF_ZERO(X, Y)          (Y)
#define _GLF_ONE(X, Y)           (Y)
#define _GLF_FALSE(X, Y)         (Y)
#define _GLF_TRUE(X, Y)          (Y)
#define _GLF_IDENTITY(X, Y)      (Y)
#define _GLF_DEAD(X)             (X)
#define _GLF_FUZZED(X)           (X)
#define _GLF_WRAPPED_LOOP(X)     X
#define _GLF_WRAPPED_IF_TRUE(X)  X
#define _GLF_WRAPPED_IF_FALSE(X) X
#endif

vec2 injectionSwitch = vec2(0.0, 1.0);

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main(void)
{
    if (injectionSwitch.x > injectionSwitch.y)
    {
        if (injectionSwitch.x > injectionSwitch.y)
            return;
        int donor_replacementfrom ;
    }
    vec2 uv = gl_FragCoord.xy / u_resolution.xy - .5;
    uv.y *= u_resolution.y / u_resolution.x;
    vec3 dir = vec3(uv * 0.4, 1.);
    float a2 = u_time * 20. + .5;
    float a1 = 0.0;
    mat2 rot1 = mat2(cos(a1), sin(a1), - sin(a1), cos(a1));
    mat2 rot2 = rot1;
    dir.xz *= rot1;
    dir.xy *= rot2;
    vec3 from = vec3(0., 0., 0.);
    from += vec3(.0025 * u_time, .03 * u_time, - 2.);
    from.xz *= rot1;
    from.xy *= rot2;
    float s = .1, fade = .07;
    vec3 v = vec3(0.4);
    for(
        int r = 0;
        r < 12;
        r ++
    )
        {
            vec3 p = from + s * dir * 1.5;
            p = abs(vec3(0.750) - mod(p, vec3(0.750 * 2.)));
            p.x += float(r * r) * 0.01;
            p.y += float(r) * 0.02;
            float pa, a = pa = 0.;
            for(
                int i = 0;
                i < 15;
                i ++
            )
                {
                    p = abs(p) / dot(p, p) - 0.340;
                    a += abs(length(p) - pa * 0.2);
                    if (injectionSwitch.x > injectionSwitch.y)
                        discard;
                    pa = length(p);
                }
            a *= a * a * 2.;
            v += vec3(s, s * s, s * s * s * s) * a * 0.0017 * fade;
            fade *= 0.960;
            s += 0.110;
        }
    v = mix(vec3(length(v)), v, 0.8);
    gl_FragColor = vec4(v * .01, 1.);
}
`,
  "template-35": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define time (u_time*.77)
#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))

float rbox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

#define b vec3(2.8, 2., 2.)

vec3 getCell(vec3 p)
{
    return floor(p / b);
}

vec3 getCellCoord(vec3 p)
{
    return mod(p, b) - b*.5;
}

float map(vec3 p){
    vec3 id = getCell(p);
    p = getCellCoord(p);
    
    float rnd = 1.*hash13(id*663.) - 1.;
    
    return rbox(p, vec3(0.33, 0.90, .90), .0);
}

vec3 normal( in vec3 pos ){
    vec2 e = vec2(0.002, -0.002);
    return normalize(
        e.xyy * map(pos + e.xyy) + 
        e.yyx * map(pos + e.yyx) + 
        e.yxy * map(pos + e.yxy) + 
        e.xxx * map(pos + e.xxx));
}

vec3 color(vec3 ro, vec3 rd, vec3 n, float t){
    vec3 p = ro + rd*t;
    vec3 lp = ro + vec3(.0, .0, 1.7);
    
    vec3 ld = normalize(lp-p);
    float dd = length(p - lp);
    float dif = max(dot(n, ld), .1);
    float fal = 1.5 / dd;
    float spec = pow(max(dot( reflect(-ld, n), -rd), 0.), 31.);

    vec3 id = getCell(p);

    bool l1, l2 = false;
    if (mod(id.y, 2.0) == 0.0) l1 = true;
    if (mod(id.z, 2.0) == 0.0) { l1 = !l1; } 
    if (l1 == true) { vec3 objCol = vec3(0.05, 0.05, 0.2); return objCol; }
    vec3 objCol = hash33(id);
       
    objCol *= (dif + .2);
    objCol += spec * 0.6;
    objCol *= fal;
    
    return objCol;
}

void main( void ){
    vec2 uv = vec2(gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
    vec3 rd = normalize(vec3(uv, 0.8));
    vec3 ro = vec3(0., 7.0, 0.1);
    rd.xy*=rot(-time*.05 + .5);
    ro.zy += time*2.;
    ro.x += cos(time)*.05;
    
    int nH = 0;
    float d = 0.0, t = 0.0;
    vec3 p, n, col = vec3(0);
    
    for(int i = 0; i < 440; i++)
    {
    	d = map(ro + rd*t); 
        
        if(nH >= 7 || t >= 30.) break;
        
        if(abs(d) < .001){
            p = ro + rd*t;
            n = normal(p);
            
            if(d > 0.0 && nH <= 0) rd = refract(rd, n, 1./1.053);
            
            col += color(ro, rd, n, t) * 1.11 * (n*0.5+0.5);
            
            nH++;
            t += .1;
        }
        t += abs(d) *0.6;
    }
	#define c col
	#define fogCol (vec3(0., 0.0022, 0.07))
		float fog = 0.00033;
		fog *= 1.;
       	        c = mix(c, fogCol, 1.0 - (1.0) / (1.0 + t*t*t*fog));
    
    col = 1.-(0.15/(1.12-exp(-col)));
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-36": `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float t=u_time*4.;
vec3 jsnow(vec2 uv,float scale,float spd,float spd2,vec3 col){	
	uv+=u_time/scale;uv.y+=t*spd/scale;uv.x+=sin(uv.y+t*spd2)/scale;
	uv.x+=t*0.05;
	vec2 s=floor(uv),f=fract(uv),p;
	float k=3.,d;
	p=.5+.35*sin(10.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;
	d=length(p);k=min(d,k);
	k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
    	return k*col;
}

void main(void){
	vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y); 
	vec3 fc=vec3(0.);
	vec3 c=vec3(0.);
	c+=jsnow(uv,30.,1.,.5,vec3(0.25,0.2,0.9));
	c+=jsnow(uv,25.,0.4,.8,vec3(0.35,0.2,0.6));
	c+=jsnow(uv,20.,0.3,.5,vec3(0.45,0.2,0.7));
	c+=jsnow(uv,15.,0.3,.5,vec3(0.5,0.4,0.9));
	c+=jsnow(uv,10.,0.2,.5,vec3(0.5,0.8,0.9));
	c+=jsnow(uv,5.,0.4,.5,vec3(0.8,0.6,0.9));
	c+=jsnow(uv,3.,0.3,.5,vec3(0.5,0.2,0.39));
	fc=(vec3(c));
	gl_FragColor = vec4(fc,1.0);
}
`,
  "template-37": `
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define iTime u_time
#define iResolution u_resolution

#define t iTime
#define SAMPLES 10
#define FOCAL_DISTANCE 4.0
#define FOCAL_RANGE 6.0
mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}

float map(vec3 p){
    p.xz *= m(t * 0.4);
    p.xy *= m(t * 0.3);
    vec3 q = p * 2.0 + t;
    return length(p + vec3(sin(t * 0.9))) * log(length(p) + 1.0) + cos(q.z + cos(q.y + cos(q.x))) * 0.1 - 0.5;
}

vec3 hslToRgb(vec3 hsl) {
    vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

vec3 getColor(in vec2 fragCoord, in float depth) {
    vec2 p = fragCoord.xy / iResolution.y - vec2(1., .5);
    vec3 cl = vec3(0.);
    float d = depth;

    for (int i = 0; i <= 2; i++) {
        vec3 p = vec3(0, 0, 5.0) + normalize(vec3(p, -1.0)) * d;
        float rz = map(p);
        float f = clamp((rz - map(p + .1)) * 0.5, -0.1, 1.0);

        float hue = mod(t * 1.0 + float(i) / 4.0, 441.0);
        float hueRange = 0.2;
        float hueShift = 0.5;
        hue = mix(0.0, 1.0, smoothstep(0.0, hueRange, hue)) + hueShift;

        vec3 color = hslToRgb(vec3(hue, 0.0, 0.7));

        vec3 l = color + vec3(4.0, 1.0, 1.0) * f;
        cl = cl * l + smoothstep(2.0, 0.0, rz) * 0.8 * l;

        d += min(rz, 1.0);
    }

    return cl;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 color = vec3(0.0);
    float depthSum = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
        float depth = FOCAL_DISTANCE + (float(i) / float(SAMPLES - 1)) * FOCAL_RANGE;
        vec3 sampleColor = getColor(fragCoord, depth);
        float weight = 2.0 / (2.0 + abs(depth - FOCAL_DISTANCE));

        color += sampleColor * weight;
        depthSum += weight;
    }

    color /= depthSum;

    fragColor = vec4(color, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "template-38": `
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define iTime u_time
#define iResolution u_resolution

#define t iTime
#define SAMPLES 10
#define FOCAL_DISTANCE 4.0
#define FOCAL_RANGE 6.0
mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}

float map(vec3 p){
    p.xz *= m(t * 0.4);
    p.xy *= m(t * 0.3);
    vec3 q = p * 2.0 + t;
    return length(p + vec3(sin(t * 0.7))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
}

vec3 hslToRgb(vec3 hsl) {
    vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

vec3 getColor(in vec2 fragCoord, in float depth) {
    vec2 p = fragCoord.xy / iResolution.y - vec2(.9, .5);
    vec3 cl = vec3(0.);
    float d = depth;

    for (int i = 0; i <= 5; i++) {
        vec3 p = vec3(0, 0, 5.0) + normalize(vec3(p, -1.0)) * d;
        float rz = map(p);
        float f = clamp((rz - map(p + .1)) * 0.5, -0.1, 1.0);

        float hue = mod(t * 1.0 + float(i) / 5.0, 1.0);
        float hueRange = 0.5;
        float hueShift = 0.3;
        hue = mix(0.0, 1.0, smoothstep(0.0, hueRange, hue)) + hueShift;

        vec3 color = hslToRgb(vec3(hue, 0.0, 0.5));

        vec3 l = color + vec3(5.0, 2.5, 3.0) * f;
        cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.7 * l;

        d += min(rz, 1.0);
    }

    return cl;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 color = vec3(0.0);
    float depthSum = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
        float depth = FOCAL_DISTANCE + (float(i) / float(SAMPLES - 1)) * FOCAL_RANGE;
        vec3 sampleColor = getColor(fragCoord, depth);
        float weight = 1.0 / (1.0 + abs(depth - FOCAL_DISTANCE));

        color += sampleColor * weight;
        depthSum += weight;
    }

    color /= depthSum;

    fragColor = vec4(color, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "template-39": `
#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define iTime u_time
#define iResolution u_resolution

#define t iTime
#define SAMPLES 10
#define FOCAL_DISTANCE 4.0
#define FOCAL_RANGE 6.0
mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}

float map(vec3 p){
    p.xz *= m(t * 0.4);
    p.xy *= m(t * 0.3);
    vec3 q = p * 2.0 + t;
    return length(p + vec3(sin(t * 0.7))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
}

vec3 hslToRgb(vec3 hsl) {
    vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

vec3 getColor(in vec2 fragCoord, in float depth) {
    vec2 p = fragCoord.xy / iResolution.y - vec2(.9, .5);
    vec3 cl = vec3(0.);
    float d = depth;

    for (int i = 0; i <= 5; i++) {
        vec3 p = vec3(0, 0, 5.0) + normalize(vec3(p, -1.0)) * d;
        float rz = map(p);
        float f = clamp((rz - map(p + .1)) * 0.5, -0.1, 1.0);

        float hue = mod(t * 1.0 + float(i) / 5.0, 1.0);
        float hueRange = 0.5;
        float hueShift = 0.3;
        hue = mix(0.0, 1.0, smoothstep(0.0, hueRange, hue)) + hueShift;

        vec3 color = hslToRgb(vec3(hue, 1.0, 0.5));

        vec3 l = color + vec3(5.0, 2.5, 3.0) * f;
        cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.7 * l;

        d += min(rz, 1.0);
    }

    return cl;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec3 color = vec3(0.0);
    float depthSum = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
        float depth = FOCAL_DISTANCE + (float(i) / float(SAMPLES - 1)) * FOCAL_RANGE;
        vec3 sampleColor = getColor(fragCoord, depth);
        float weight = 1.0 / (1.0 + abs(depth - FOCAL_DISTANCE));

        color += sampleColor * weight;
        depthSum += weight;
    }

    color /= depthSum;

    fragColor = vec4(color, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,
  "template-40": `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main( void ) {
	
	vec4 O = vec4(0.0);
	float maxCoord = max(u_resolution.x, u_resolution.y);
	float ratio = u_resolution.y / u_resolution.x;
	
	vec2 u = gl_FragCoord.xy/maxCoord - vec2(0.5, ratio * 0.5);
	u *= 4.0;
	float T = u_time;
	for (float i = 0.; i < 100.0; i += .5) {
	O += .001/abs(length(u + vec2(cos(i/4. + T), sin(i*.45 + T)) * sin(T*.5+i*.35)) - sin(i+T*.5) / 60. - .01) * (1. + cos(i*.7 + T + length(u)*6. + vec4(0,1,2,0)));
	}
	
	gl_FragColor = O;
	
	return;

	vec2 position = ( gl_FragCoord.xy / u_resolution.xy ) + u_mouse / 74.8;

	float color = 0.0;
	color += sin( position.x * cos( u_time / 15.0 ) * 80.0 ) + cos( position.y * cos( u_time / 15.0 ) * 10.0 );
	color += sin( position.y * sin( u_time / 25.0 ) * 40.0 ) + cos( position.x * sin( u_time / 25.0 ) * 40.0 );
	color += sin( position.x * sin( u_time / 5.0 ) * 10.0 ) + sin( position.y * sin( u_time / 15.0 ) * 80.0 );
	color *= sin( u_time / 10.0 ) * 0.5;

	gl_FragColor = vec4( vec3( color, color * 0.5, sin( color + u_time / 0.5 ) * 0.75 ), 1.0 );

}
`,
  "template-41": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

float wave(vec2 p, float phase, float freq) {
    return sin(p.x * freq + phase) * 0.3 * sin(p.y * freq * 0.5 + phase * 0.7);
}

float glowLine(float dist, float thickness, float intensity) {
    return intensity * thickness / (abs(dist) + thickness * 0.5);
}

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= (1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h));
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float starfield(vec2 uv, float time) {
    vec2 grid = floor(uv * 150.0);
    vec2 frac = fract(uv * 150.0) - 0.5;
    float star = hash(grid);
    if (star < 0.985) return 0.0;
    float twinkle = sin(time * 2.0 + grid.x + grid.y) * 0.5 + 0.5;
    float dist = length(frac);
    float sparkle = smoothstep(0.08, 0.0, dist) * twinkle;
    return sparkle * (star - 0.985) * 100.0;
}

void main() {
    vec2 vUv = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y);
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= u_resolution.x / u_resolution.y;
    vec2 uv0 = uv;
    vec3 col = vec3(0.0);
    float time = u_time * 0.4;
    float noise = (snoise(uv * 0.5 + time * 0.02) + 1.0) * 0.5;
    col += noise * vec3(0.05, 0.0, 0.1) * 0.3;
    vec2 mouse_uv = (u_mouse - 0.5) * 2.0;
    mouse_uv.x *= u_resolution.x / u_resolution.y;
    float mouseDist = length(uv - mouse_uv);
    uv += (mouse_uv - uv) * (0.3 / (mouseDist + 0.5));
    float mouseGlow = 0.1 / (mouseDist + 0.1);
    mouseGlow *= (sin(u_time * 1.5) * 0.5 + 0.5) * 0.7 + 0.3;
    col += mouseGlow * vec3(1.0, 0.8, 1.0) * 0.15;
    uv *= rot(time * 0.05);
    float waveNoise = snoise(uv * 2.0 + time * 0.2) * 0.1;
    float c1 = sin(time * 0.3 + 0.0) * 0.5 + 0.5;
    float c2 = sin(time * 0.3 + 2.0) * 0.5 + 0.5;
    float c3 = sin(time * 0.3 + 4.0) * 0.5 + 0.5;
    float y1 = uv.y - wave(uv, time * 1.5, 2.0) + waveNoise;
    float line1 = glowLine(y1, 0.03, 0.8);
    vec3 color1 = vec3(1.0, c1 * 0.5 + 0.1, c2 * 0.7 + 0.3);
    col += color1 * line1;
    float y2 = uv.y + 0.4 - wave(uv + vec2(1.0, 0.5), time * 1.2, 2.5) + waveNoise * 0.8;
    float line2 = glowLine(y2, 0.03, 0.8);
    vec3 color2 = vec3(c2 * 0.3 + 0.1, c3 * 0.7 + 0.3, 1.0);
    col += color2 * line2;
    float y3 = uv.y - 0.4 - wave(uv + vec2(-0.5, 1.0), time * 1.8, 1.8) + waveNoise * 1.2;
    float line3 = glowLine(y3, 0.03, 0.8);
    vec3 color3 = vec3(c1 * 0.7 + 0.3, c3 * 0.5 + 0.1, 1.0);
    col += color3 * line3;
    float dist = length(uv0);
    float circle = abs(sin(dist * 4.0 - time * 2.0)) * exp(-dist * 0.5);
    col += vec3(0.5, 0.7, 1.0) * circle * 0.3;
    col += starfield(uv0 * 2.0 + time * 0.01, u_time) * vec3(1.0, 0.9, 0.8) * 0.7;
    float centerGlow = exp(-dist * 1.0) * 0.3;
    col += centerGlow * vec3(0.4, 0.5, 0.8);
    float vignette = 1.0 - dist * 0.5;
    vignette = smoothstep(0.0, 1.0, vignette);
    col *= vignette;
    col = pow(col, vec3(0.95));
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-42": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 3; i++) {
        total += snoise(p * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return total;
}

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec3 col = vec3(0.0);
    
    float time = u_time * 0.78;
    
    // Camera setup
    vec3 ro = vec3(0.0, 0.0, 2.4);
    vec3 rd = normalize(vec3(uv, -1.0));
    
    // Ray-sphere intersection
    float t = 0.0;
    float sphereRadius = 1.0;
    vec3 center = vec3(0.0);
    
    vec3 oc = ro - center;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - sphereRadius * sphereRadius;
    float h = b * b - c;
    
    if (h < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    t = -b - sqrt(h);
    vec3 pos = ro + rd * t;
    vec3 normal = normalize(pos - center);
    
    // Rotate sphere
    float rotY = time * 0.08;
    float cosY = cos(rotY);
    float sinY = sin(rotY);
    pos.xz = vec2(
        pos.x * cosY - pos.z * sinY,
        pos.x * sinY + pos.z * cosY
    );
    normal.xz = vec2(
        normal.x * cosY - normal.z * sinY,
        normal.x * sinY + normal.z * cosY
    );
    
    // Plasma parameters
    float plasmaScale = 0.1404;
    float plasmaBrightness = 1.31;
    float voidThreshold = 0.072;
    vec3 colorDeep = vec3(0.0, 0.078, 0.2);
    vec3 colorMid = vec3(0.0, 0.518, 1.0);
    vec3 colorBright = vec3(0.0, 1.0, 0.882);
    
    // Plasma calculation
    vec3 p = pos * plasmaScale;
    vec3 q = vec3(
        fbm(p + vec3(0.0, time * 0.05, 0.0)),
        fbm(p + vec3(5.2, 1.3, 2.8) + time * 0.05),
        fbm(p + vec3(2.2, 8.4, 0.5) - time * 0.02)
    );
    
    float density = fbm(p + 2.0 * q);
    float t_val = (density + 0.4) * 0.8;
    float alpha = smoothstep(voidThreshold, 0.7, t_val);
    
    vec3 cWhite = vec3(1.0);
    vec3 color = mix(colorDeep, colorMid, smoothstep(voidThreshold, 0.5, t_val));
    color = mix(color, colorBright, smoothstep(0.5, 0.8, t_val));
    color = mix(color, cWhite, smoothstep(0.8, 1.0, t_val));
    
    // View direction for fresnel
    vec3 viewDir = normalize(ro - pos);
    float facing = dot(normal, viewDir);
    float depthFactor = (facing + 1.0) * 0.5;
    float finalAlpha = alpha * (0.02 + 0.98 * depthFactor);
    
    col = color * plasmaBrightness;
    
    // Shell (glass edge)
    float fresnel = pow(1.0 - dot(normal, viewDir), 2.5);
    vec3 shellColor = vec3(0.0, 0.4, 1.0);
    float shellOpacity = 0.41;
    col += shellColor * fresnel * shellOpacity;
    
    // Particles
    for (float i = 0.0; i < 30.0; i += 1.0) {
        float id = i;
        float r = 0.95 * pow(hash(id), 0.333);
        float theta = hash(id * 2.0) * PI * 2.0;
        float phi = acos(2.0 * hash(id * 3.0) - 1.0);
        
        vec3 particlePos = vec3(
            r * sin(phi) * cos(theta),
            r * sin(phi) * sin(theta),
            r * cos(phi)
        );
        
        particlePos.y += sin(time * 0.2 + particlePos.x) * 0.02;
        particlePos.x += cos(time * 0.15 + particlePos.z) * 0.02;
        
        vec3 toParticle = particlePos - pos;
        float dist = length(toParticle);
        float size = 0.01;
        
        if (dist < size) {
            float glow = 1.0 - (dist / size);
            glow = pow(glow, 1.8);
            float pAlpha = 0.8 + 0.2 * sin(time + id * 10.0);
            col += vec3(1.0) * glow * pAlpha * 0.5;
        }
    }
    
    // Point light effect
    vec3 lightPos = vec3(0.0, 0.0, 0.0);
    vec3 lightDir = normalize(lightPos - pos);
    float lightIntensity = max(dot(normal, lightDir), 0.0);
    col += vec3(0.0, 0.533, 1.0) * lightIntensity * 2.0;
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-43": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_beat;

void main() {
    vec2 uv = gl_FragCoord.xy;
    vec3 col = vec3(0.0);
    
    // Grid parameters
    float separation = 25.0;
    float amount = 25.0;
    
    // Time animation (reversed, looped)
    float time2 = (1.0 - mod(u_time * 0.1, 2.0)) * 5.0;
    
    // Calculate grid cell
    float cellX = floor(uv.x / separation);
    float cellZ = floor(uv.y / separation);
    
    // Particle position in cell
    vec2 cellPos = mod(uv, separation);
    vec2 cellCenter = vec2(separation * 0.5);
    
    // Distance from cell center
    float dist = length(cellPos - cellCenter);
    
    // Particle indices for wave
    float x = cellX * 0.5;
    float z = cellZ * 0.5;
    
    // Wave animation for size
    float sinSX = (sin((x + time2) * 0.7) + 1.0) * 5.0;
    float sinSZ = (sin((z + time2) * 0.5) + 1.0) * 5.0;
    float particleSize = (sinSX + sinSZ) * 0.5;
    
    // Draw particle
    float radius = particleSize * 1.5;
    if (dist < radius) {
        float glow = 1.0 - (dist / radius);
        glow = pow(glow, 2.0);
        col = vec3(1.0) * glow * 6.0;
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-44": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

vec3 palette3(float t, float factor) {
    vec3 a = vec3(0.5) + 0.3 * sin(vec3(0.1, 0.3, 0.5) * factor);
    vec3 b = vec3(0.5) + 0.3 * cos(vec3(0.2, 0.4, 0.6) * factor);
    vec3 c = vec3(1.0) + 0.5 * sin(vec3(0.3, 0.7, 0.9) * factor);
    vec3 d = vec3(0.25, 0.4, 0.55) + 0.2 * cos(vec3(0.5, 0.6, 0.7) * factor);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;
    vec3 color = vec3(0.0);

    for (float i = 1.0; i < 6.0; i += 1.0) {
        vec2 st0 = st;
        float sgn = 1.0 - 2.0 * mod(i, 2.0);
        float t = u_time * 0.02 - i;
        float cosT = cos(t);
        float sinT = sin(t);
        st0 = vec2(
            st0.x * cosT - st0.y * sinT,
            st0.x * sinT + st0.y * cosT
        );

        float R = length(st0);
        float d = R * i;
        float angle = atan(st0.y, st0.x) * 3.0;

        vec3 pal = palette3(-exp(length(d) * -0.9), abs(d) * 0.4);

        float radial = exp(-R); 
        radial *= smoothstep(1.2, 0.5, R);
        pal *= radial;

        float phase = -(d + sgn * angle) + u_time * 0.3;
        float v = sin(phase);
        v = max(abs(v), 0.02);
        float w = pow(0.02 / v, 0.8);

        color += pal * w;
    }

    gl_FragColor = vec4(color, 1.0);
}
`,
  "template-45": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359
#define NUM_PARTICLES 800.0
#define FLOW_SPEED 0.20
#define MIN_Y -5.0
#define MAX_Y 5.0
#define NECK_RADIUS 2.2
#define FLARE 2.5
#define TWIST_TURNS 0.5
#define GOLD_HUE 0.133333
#define FIERY_HUE 0.055556

float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

vec3 hash3(float n) {
    return vec3(
        hash(n),
        hash(n + 1.0),
        hash(n + 2.0)
    );
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float radiusAtY(float y, float a, float b) {
    return a * sqrt(1.0 + (y * y) / (b * b));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec3 col = vec3(0.0);
    
    float time = u_time;
    
    // Simulate particles
    for (float i = 0.0; i < NUM_PARTICLES; i += 1.0) {
        vec3 rand = hash3(i * 17.3);
        
        // Particle progress along the flow
        float speedVar = 0.8 + 0.4 * rand.z;
        float progress = fract(rand.x + time * FLOW_SPEED * speedVar);
        
        // Y position (from top to bottom)
        float y = mix(MAX_Y, MIN_Y, progress);
        
        // Scale variation
        float scale = mix(0.70, 1.00, rand.z);
        
        // Radius at this Y position (hourglass shape)
        float r = radiusAtY(y, NECK_RADIUS, FLARE) * scale;
        
        // Twist effect
        float twist = PI * 2.0 * TWIST_TURNS;
        float phi = PI * 2.0 * rand.y + progress * twist + time * 0.02;
        
        // 3D position projected to 2D
        vec2 particlePos = vec2(r * cos(phi), y);
        
        // Distance from current pixel to particle
        float dist = length(uv - particlePos);
        
        // Glow effect (particle size simulation)
        float particleSize = 12.0 / min(u_resolution.x, u_resolution.y);
        float falloff = pow(1.0 - clamp(dist / particleSize, 0.0, 1.0), 1.7);
        if (dist > particleSize) continue;
        
        // Neck glow (center of hourglass)
        float neckGlow = 1.0 - smoothstep(0.0, 1.4, abs(y));
        
        // Edge fade
        float edgeFade = smoothstep(0.0, 0.06, progress) * (1.0 - smoothstep(0.94, 1.0, progress));
        
        // Alpha
        float alpha = 0.23 + 0.62 * neckGlow * edgeFade;
        
        // Color (golden hue with variation)
        float hue = GOLD_HUE + 0.02 * (rand.z - 0.5);
        vec3 particleCol = hsv2rgb(vec3(hue, 0.78, 0.95));
        particleCol += 0.15 * neckGlow;
        
        // Sparkle effect
        float sparkle = 0.85 + 0.15 * sin(50.0 * progress);
        particleCol *= sparkle;
        
        col += particleCol * alpha * falloff;
    }
    
    // Central core sphere glow
    float coreDist = length(uv);
    float coreGlow = exp(-coreDist * 2.0) * 0.3;
    vec3 coreCol = hsv2rgb(vec3(GOLD_HUE, 0.6, 1.0));
    col += coreCol * coreGlow;
    
    // Bloom-like effect (bright areas glow more)
    col = col + col * col * 0.5;
    
    // Tone mapping
    col = col / (1.0 + col);
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-46": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

float squared(float value) {
    return value * value;
}

// Процедурная генерация аудио данных вместо texture(iChannel0, ...)
float getAmp(float frequency) {
    // Симулируем FFT данные через процедурную генерацию
    float t = u_time * 0.5;
    float amp = sin(frequency * 0.1 + t) * 0.5 + 0.5;
    amp += sin(frequency * 0.15 + t * 1.3) * 0.3;
    amp += sin(frequency * 0.2 + t * 0.7) * 0.2;
    return pow(amp, 2.0) * 0.8;
}

float getWeight(float f) {
    return (getAmp(f-2.0) + getAmp(f-1.0) + getAmp(f+2.0) + getAmp(f+1.0) + getAmp(f)) / 5.0;
}

void main() {
    vec2 uvTrue = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = -1.0 + 2.0 * uvTrue;
    
    float lineIntensity;
    float glowWidth;
    vec3 color = vec3(0.0);
    
    for(float i = 0.0; i < 5.0; i++) {
        uv.y += (0.2 * sin(uv.x + i/7.0 - u_time * 0.6));
        float Y = uv.y + getWeight(squared(i) * 20.0) *
            (getAmp(uvTrue.x * 512.0) - 0.5);
        lineIntensity = 0.4 + squared(1.6 * abs(mod(uvTrue.x + i / 1.3 + u_time, 2.0) - 1.0));
        glowWidth = abs(lineIntensity / (150.0 * Y));
        color += vec3(glowWidth * (2.0 + sin(u_time * 0.13)),
                      glowWidth * (2.0 - sin(u_time * 0.23)),
                      glowWidth * (2.0 - cos(u_time * 0.19)));
    }
    
    gl_FragColor = vec4(color, 1.0);
}
`,
  "template-47": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    vec3 col = vec3(0.0);
    
    // Простой базовый эффект
    float t = u_time;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    col = vec3(
        0.5 + 0.5 * sin(angle * 3.0 + t),
        0.5 + 0.5 * sin(angle * 3.0 + t + 2.0),
        0.5 + 0.5 * sin(angle * 3.0 + t + 4.0)
    );
    
    col *= exp(-dist * 0.5);
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-48": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define BARS 12.0
#define PI 3.14159265359

// rotation transform
void tRotate(inout vec2 p, float angel) {
    float s = sin(angel), c = cos(angel);
    p *= mat2(c, -s, s, c);
}

// circle distance
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// union
float opU(float a, float b) {
    return min(a, b);
}

// substraction
float opS(float a, float b) {
    return max(a, -b);
}

// distance function of half of an ark
// parameters: inner radius, outer radius, angle
float sdArk(vec2 p, float ir, float or, float a) {
    vec2 pRot = p;
    // rotate with angle
    tRotate(pRot, -a * PI / 2.0);
    
    // add outer circle
    float d = sdCircle(p, or);
    
    // substract inner circle
    d = opS(d, sdCircle(p, ir));
    
    // clip the top
    d = opS(d, -pRot.y);
    
    // add circle to the top
    d = opU(d, sdCircle(pRot - vec2((or + ir) / 2.0, 0.0), (or - ir) / 2.0));
    return d;
}

// Процедурная генерация вместо texture(iChannel0, vec2(1. - barId / BARS, .25)).x
float getAudioValue(float barId) {
    float texX = 1.0 - barId / BARS;
    float t = u_time * 0.5;
    float freq = texX * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    return pow(amp, 2.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
    
    // I wanted it to look good on my phone vertically :P
    if (u_resolution.x > u_resolution.y) {
        uv.x *= u_resolution.x / u_resolution.y;
    } else {
        uv.y *= u_resolution.y / u_resolution.x;
    }
    
    // little white padding
    uv *= 1.05;
    
    // add circles
    float d = sdCircle(uv, 1.0);
    d = opS(d, sdCircle(uv, 0.34));
    d = opU(d, sdCircle(uv, 0.04));
    
    // calculate position of the bars
    float barsStart = 0.37;
    float barsEnd = 0.94;
    float dist = length(uv);
    float barId = floor((dist - barsStart) / (barsEnd - barsStart) * BARS);
    
    // only go forward if we're in a bar
    if (barId >= 0.0 && barId < BARS) {
        vec2 uvBar = uv;
        float barWidth = (barsEnd - barsStart) / BARS;
        float barStart = barsStart + barWidth * (barId + 0.25);
        float barAngel = getAudioValue(barId) * 0.5;
        
        // add a little rotation to completely ruin the beautiful symmetry
        tRotate(uvBar, -barAngel * 0.2 * sin(barId + u_time));
        
        // mirror everything
        uvBar = abs(uvBar);
        
        // add the bars
        d = opS(d, sdArk(uvBar, barStart, barStart + barWidth / 2.0, barAngel));
    }
    
    // use the slope to render the distance with antialiasing
    float w = 0.01;
    gl_FragColor = vec4(vec3(smoothstep(-w, w, d)), 1.0);
}
`,
  "template-49": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define dots 40.0
#define radius 0.25
#define brightness 0.02
#define PI 3.14159265359

//convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Процедурная генерация вместо texture(iChannel0, vec2(i/dots, 0.0)).x
float getAudioValue(float i) {
    float t = u_time * 0.5;
    float freq = i / dots;
    float vol = sin(freq * 10.0 + t) * 0.5 + 0.5;
    vol += sin(freq * 15.0 + t * 1.3) * 0.3;
    return pow(vol, 2.0);
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec3 c = vec3(0.0, 0.0, 0.1); // background color
    
    for(float i = 0.0; i < dots; i++) {
        // read frequency for this dot from audio input channel
        // based on its index in the circle
        float vol = getAudioValue(i);
        float b = vol * brightness;
        
        // get location of dot
        float x = radius * cos(2.0 * PI * i / dots);
        float y = radius * sin(2.0 * PI * i / dots);
        vec2 o = vec2(x, y);
        
        // get color of dot based on its index in the
        // circle + time to rotate colors
        vec3 dotCol = hsv2rgb(vec3((i + u_time * 10.0) / dots, 1.0, 1.0));
        
        // get brightness of this pixel based on distance to dot
        c += b / (length(p - o)) * dotCol;
    }
    
    // black circle overlay
    float dist = distance(p, vec2(0.0));
    c = c * smoothstep(0.26, 0.28, dist);
    
    gl_FragColor = vec4(c, 1.0);
}
`,
  "template-50": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define bands 30.0
#define segs 40.0

// Процедурная генерация вместо texture(iChannel0, vec2(p.x, 0.0)).x
float getFFT(float x) {
    float t = u_time * 0.5;
    float freq = x * 10.0;
    float fft = sin(freq + t) * 0.5 + 0.5;
    fft += sin(freq * 1.5 + t * 1.3) * 0.3;
    fft += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(fft, 2.0);
}

void main() {
    // create pixel coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // quantize coordinates
    vec2 p;
    p.x = floor(uv.x * bands) / bands;
    p.y = floor(uv.y * segs) / segs;
    
    // read frequency data from first row of texture
    float fft = getFFT(p.x);
    
    // led color
    vec3 color = mix(vec3(0.0, 2.0, 0.0), vec3(2.0, 0.0, 0.0), sqrt(uv.y));
    
    // mask for bar graph
    float mask = (p.y < fft) ? 1.0 : 0.1;
    
    // led shape
    vec2 d = fract((uv - p) * vec2(bands, segs)) - 0.5;
    float led = smoothstep(0.5, 0.35, abs(d.x)) *
                smoothstep(0.5, 0.35, abs(d.y));
    vec3 ledColor = led * color * mask;
    
    // output final color
    gl_FragColor = vec4(ledColor, 1.0);
}
`,
  "template-51": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define iters 150

int fractal(vec2 p, vec2 point) {
    vec2 so = (-1.0 + 2.0 * point) * 0.4;
    vec2 seed = vec2(0.098386255 + so.x, 0.6387662 + so.y);
    
    for (int i = 0; i < iters; i++) {
        if (length(p) > 2.0) {
            return i;
        }
        vec2 r = p;
        p = vec2(p.x * p.x - p.y * p.y, 2.0 * p.x * p.y);
        p = vec2(p.x * r.x - p.y * r.y + seed.x, r.x * p.y + p.x * r.y + seed.y);
    }
    
    return 0;
}

vec3 color(int i) {
    float f = float(i) / float(iters) * 2.0;
    f = f * f * 2.0;
    return vec3((sin(f * 2.0)), (sin(f * 3.0)), abs(sin(f * 7.0)));
}

// Процедурная генерация вместо texture(iChannel0, vec2(0.15, 0.25)).x
float getAudioValue(float x, float y) {
    float t = u_time * 0.5;
    float freq = x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    return pow(amp, 2.0);
}

float sampleMusicA() {
    return 0.5 * (
        getAudioValue(0.15, 0.25) +
        getAudioValue(0.30, 0.25));
}

// Процедурная генерация вместо texture(iChannel0, vec2(length(position)/2.0, 0.1))
vec4 getTexture3(vec2 pos) {
    float dist = length(pos) / 2.0;
    float t = u_time * 0.3;
    float val = sin(dist * 5.0 + t) * 0.5 + 0.5;
    val += sin(dist * 8.0 + t * 1.2) * 0.3;
    return vec4(val, val * 0.8, val * 1.2, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = vec2(u_mouse.x / u_resolution.x, u_mouse.y / u_resolution.y);
    
    vec2 position = 3.0 * (-0.5 + gl_FragCoord.xy / u_resolution.xy);
    position.x *= u_resolution.x / u_resolution.y;
    
    vec2 iFC = vec2(u_resolution.x - gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
    vec2 pos2 = 2.0 * (-0.5 + iFC.xy / u_resolution.xy);
    pos2.x *= u_resolution.x / u_resolution.y;
    
    vec4 t3 = getTexture3(position);
    float pulse = 0.5 + sampleMusicA() * 1.8;
    
    vec3 invFract = color(fractal(pos2, vec2(0.55 + sin(u_time / 3.0 + 0.5) / 2.0, pulse * 0.9)));
    
    vec3 fract4 = color(fractal(position / 1.6, vec2(0.6 + cos(u_time / 2.0 + 0.5) / 2.0, pulse * 0.8)));
    
    vec3 c = color(fractal(position, vec2(0.5 + sin(u_time / 3.0) / 2.0, pulse)));
    
    t3 = abs(vec4(0.5, 0.1, 0.5, 1.0) - t3) * 2.0;
    
    vec4 fract01 = vec4(c, 1.0);
    vec4 salida;
    salida = fract01 / t3 + fract01 * t3 + vec4(invFract, 0.6) + vec4(fract4, 0.3);
    gl_FragColor = salida;
}
`,
  "template-52": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Процедурная генерация вместо texelFetch(iChannel0, ivec2(5, 0), 0).x
float getAudioValue(int index) {
    float t = u_time * 0.5;
    float freq = float(index) * 0.01;
    float amp = sin(freq * 10.0 + t) * 0.5 + 0.5;
    amp += sin(freq * 15.0 + t * 1.3) * 0.3;
    amp += sin(freq * 20.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

float getTunnel(vec2 uv, float time, float Z) {
    // 1. DISTORTION
    float len = length(uv);
    float ang = atan(uv.y, uv.x);
    
    // Twist
    float twist = 0.2 * sin(time * 0.002);
    ang += twist / (len + 0.1);
    
    // Pulse/Wave
    float wave = 0.23 * sin(len * 18.0 - time * 0.7);
    
    // Reconstruct UVs
    vec2 warpedUV = vec2(cos(ang), sin(ang)) * (len + wave);
    
    // 2. Square Tunnel Logic
    float s_bg = sin(time * 0.0001);
    float c_bg = cos(time * 0.0001);
    warpedUV *= mat2(c_bg, -s_bg, s_bg, c_bg);
    
    // Chebyshev distance
    float rad = max(abs(warpedUV.x), abs(warpedUV.y));
    float tunnelZ = 1.2 / (rad + 0.281);
    
    // 3. Pattern
    float wallAngle = atan(warpedUV.y, warpedUV.x) / 6.28;
    vec2 tunnelGrid = vec2(wallAngle * 8.0, tunnelZ - time * 0.001);
    
    vec2 tGridId = floor(tunnelGrid);
    float checker = mod(tGridId.x + tGridId.y, 2.0);
    
    // Fog
    float tunnelFog = smoothstep(0.0, 5.0, tunnelZ);
    
    // Pulse
    float bgPulse = 0.5 + 0.5 * sin(tunnelZ * 0.4 + time + Z * 2.0 + wave * 10.0);
    
    return checker * bgPulse * tunnelFog;
}

void main() {
    // --- SETUP ---
    // Extract Bass info
    float bass = getAudioValue(5);
    float mid = getAudioValue(127);
    float high = getAudioValue(500);
    high = mix(high, mid, 0.4);
    vec2 uv_orig = gl_FragCoord.xy / u_resolution.xy;
    vec2 texsize = u_resolution.xy;
    float time = u_time;
    
    vec2 r = texsize;
    vec2 FC = uv_orig * r;
    vec4 o = vec4(0.0);
    
    vec2 bgBaseUV = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    for(int channel = 0; channel < 3; channel++) {
        float Z = float(channel - 1);
        float channelValue = 0.0;
        float skipFlag = 0.0;
        float d = 0.0;
        float density = 0.0;
        
        for(float i = 0.0; i < 80.0; i += 1.0) {
            float continueFlag = 1.0 - step(0.5, skipFlag);
            vec3 p = vec3((FC * 2.0 - r) / r.y * d, d - 8.0);
            
            float skipCondition = step(5.0, abs(p.x));
            skipFlag = max(skipFlag, skipCondition * continueFlag);
            float processFlag = 1.0 - step(0.5, skipFlag);
            
            float bandFreq = 29.0;
            vec3 pRaw = p;
            float warpFactor = 1.5 * sin(pRaw.z * 2.0 + u_time * 1.5) * sin(pRaw.y * 1.5 - u_time * 0.1);
            
            if(processFlag > 0.5) {
                // Rotations
                float s_rot = sin(time / 5.0);
                float c_rot = cos(time / 5.0);
                mat2 rot1 = mat2(c_rot, -s_rot, s_rot, c_rot);
                p.xz = rot1 * p.xz;
                
                s_rot = sin(time / 9.0);
                c_rot = cos(time / 9.0);
                mat2 rot2 = mat2(c_rot, -s_rot, s_rot, c_rot);
                p.xy = rot2 * p.xy;
                
                // Dots Logic
                vec3 g = floor(p * 4.0);
                vec3 f = fract(p * 4.0) - 0.5;
                float rand1 = fract(sin(dot(g, vec3(127.0, 312.0, 75.0))) * 43758.0);
                float h = step(length(f), rand1 * 0.2 + 0.1);
                float rand2 = fract(sin(dot(g, vec3(44.0, 78.0, 123.0))) * 127.0);
                float a = rand2 + high * 14.0;
                
                // --- INNER BOX REPETITION LOGIC ---
                float e = 0.0;
                float sc = 0.0 + pow(bass, 6.5) * 7.7;
                
                if(i < 50.0) {
                    sc = 4.5;
                    bandFreq = 1.6;
                    warpFactor *= 0.22;
                    sc = 4.4 + (bass + mid + high) / 13.0;
                }
                // ----------------------------------
                
                float absX = abs(p.x), absY = abs(p.y), absZ = abs(p.z);
                
                // Main Object Size
                float size = -8.5 + sc * 2.9;
                
                float c = max(max(max(absX, absY), absZ), dot(vec3(absX, absY, absZ), vec3(0.577)) * 0.9) - size;
                
                // --- BAND LOGIC ---
                float sphereDist = length(pRaw) - size * 1.8;
                float bandMetric = sphereDist;
                
                if(c > 0.32) {
                    float warpedDist = bandMetric + warpFactor * 1.5;
                    float ripples = sin(warpedDist * bandFreq);
                    float sharpBand = smoothstep(0.00, 1.39, ripples * 0.6);
                    float fade = 3.0 / (c * 50.0);
                    float startFade = smoothstep(0.01, 2.0, c);
                    
                    float centerDist = length(pRaw.xy);
                    float centerHole = smoothstep(size * 0.8, size * 0.8 + 0.0, centerDist);
                    
                    channelValue += (0.0001 + sharpBand * fade * 1000.0) * 14.1 * startFade * centerHole;
                }
                
                float sinC = length(sin(vec3(c)));
                float s_dist = 0.01 + 0.25 * abs(max(max(c, e - 0.1), abs(sinC) - 0.3) + Z * 0.02 - i / 130.0);
                d += s_dist;
                
                float sf = smoothstep(0.02, 0.01, s_dist);
                channelValue += 1.5 / s_dist * (0.5 + 0.5 * sin(i * 0.2 + Z * 5.0) + sf * 4.0 * h * sin(a + i * 0.4 + Z * 5.0));
                
                density += sf * 0.10;
            } else {
                d += 1.0 * skipCondition;
            }
        }
        
        // --- COMPOSITE BACKGROUND ---
        float warpAmount = density * (0.15 + Z * 1.15);
        vec2 refractedUV = bgBaseUV * (3.0 - warpAmount);
        // float bgFinal = getTunnel(refractedUV, time, Z * 0.5);
        
        // --- VISIBILITY MASK ---
        float objectMask = smoothstep(0.4, 1.0, density * 1.0);
        float bgIntensity = 1000.0 * 2.5 * objectMask;
        
        // channelValue += bgFinal * bgIntensity;
        float var = 1.0;
        if(channel == 0) o.r = channelValue * var;
        else if(channel == 1) o.g = channelValue * var;
        else o.b = channelValue * var;
    }
    
    o = o * o / 1.0e7;
    o = min(o, 10.0);
    vec4 exp2o = exp(4.0 * o);
    o = (exp2o - 1.0) / (exp2o + 1.0);
    
    gl_FragColor = o;
}
`,
  "template-53": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// ============================================
// TWEAKABLE PARAMETERS - Adjust these!
// ============================================

// --- Dice Timing ---
#define SHAPE_TIME 4.0
#define MORPH_TIME 1.5

// --- Audio Reactivity ---
#define AUDIO_GRID_SCALE 1.0
#define AUDIO_HUE_SHIFT 0.5
#define AUDIO_ANIM_SCALE 1.0
#define AUDIO_FREQ_X 0.5
#define AUDIO_FREQ_Y 0.5

// --- Visual Quality ---
#define RAY_STEPS 120.0
#define GRID_DENSITY 6.0
#define NESTED_BOX_ITERS 3

// --- Chromatic Aberration ---
#define CHROMA_SPREAD 0.02

// --- Rotation Speeds ---
#define ROT_SPEED_XZ 0.5
#define ROT_SPEED_XY 0.333

// --- Color & Contrast ---
#define COLOR_INTENSITY 1.6
#define DOT_BRIGHTNESS 5.0
#define EXPOSURE 1.0e7
#define CONTRAST 2.0

// --- Shape Scales ---
#define SCALE_D4 1.0
#define SCALE_D6 1.0
#define SCALE_D8 1.0
#define SCALE_D10 1.0
#define SCALE_D12 1.0
#define SCALE_D20 1.0

// ============================================
// CONSTANTS
// ============================================
#define PI 3.14159265359
#define TAU 6.28318530718
#define PHI 1.61803398875
#define NUM_DICE 6

// ============================================
// HELPER FUNCTIONS
// ============================================

mat2 rotate2D(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

// Процедурная генерация вместо texture(iChannel0, vec2(AUDIO_FREQ_X, AUDIO_FREQ_Y)).x
float getAudioVolume() {
    float t = u_time * 0.5;
    float freq = AUDIO_FREQ_X * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    return pow(amp, 2.0);
}

float getAudioMids() {
    float t = u_time * 0.5;
    float freq = AUDIO_FREQ_X * 10.0;
    float amp = sin(freq + t * 0.8) * 0.5 + 0.5;
    amp += sin(freq * 1.2 + t * 1.1) * 0.3;
    return pow(amp, 1.5);
}

// ============================================
// DICE SDFS
// ============================================

float sdTetrahedron(vec3 p) {
    p /= SCALE_D4;
    return (max(abs(p.x + p.y) - p.z, abs(p.x - p.y) + p.z) - 1.0) / sqrt(3.0) * SCALE_D4;
}

float sdCube(vec3 p) {
    p /= SCALE_D6;
    vec3 q = abs(p) - vec3(1.0);
    return (length(max(q, vec3(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0)) * SCALE_D6;
}

float sdOctahedron(vec3 p) {
    p /= SCALE_D8;
    p = abs(p);
    return (p.x + p.y + p.z - 1.0) * 0.57735027 * SCALE_D8;
}

float sdD10(vec3 p) {
    p /= SCALE_D10;
    float a = atan(p.x, p.z);
    float sect = TAU / 5.0;
    a = mod(a + sect * 0.5, sect) - sect * 0.5;
    p.xz = vec2(sin(a), cos(a)) * length(p.xz);
    
    vec3 n1 = normalize(vec3(0.8, 0.5, 0.4));
    vec3 n2 = normalize(vec3(0.8, -0.5, 0.4));
    
    float d = dot(abs(p), n1);
    d = max(d, dot(vec3(abs(p.x), -p.y, abs(p.z)), n2));
    d = max(d, dot(vec3(abs(p.x), p.y, abs(p.z)), n2));
    
    return (d - 0.65) * SCALE_D10;
}

float sdDodecahedron(vec3 p) {
    p /= SCALE_D12;
    vec3 n1 = normalize(vec3(0.0, PHI, 1.0));
    vec3 n2 = normalize(vec3(0.0, PHI, -1.0));
    vec3 n3 = normalize(vec3(1.0, 0.0, PHI));
    vec3 n4 = normalize(vec3(-1.0, 0.0, PHI));
    vec3 n5 = normalize(vec3(PHI, 1.0, 0.0));
    vec3 n6 = normalize(vec3(PHI, -1.0, 0.0));
    
    vec3 ap = abs(p);
    float d = dot(ap, n1);
    d = max(d, dot(ap, n2));
    d = max(d, dot(ap, n3));
    d = max(d, dot(ap, n4));
    d = max(d, dot(ap, n5));
    d = max(d, dot(ap, n6));
    
    return (d - 0.77) * SCALE_D12;
}

float sdIcosahedron(vec3 p) {
    p /= SCALE_D20;
    const float q = 0.618033988749895;
    vec3 n1 = normalize(vec3(q, 1.0, 0.0));
    vec3 n2 = normalize(vec3(-q, 1.0, 0.0));
    
    vec3 ap = abs(p);
    float d = dot(ap, n1);
    d = max(d, dot(ap, n2));
    d = max(d, dot(ap.xzy, n1));
    d = max(d, dot(ap.xzy, n2));
    d = max(d, dot(ap.zyx, n1));
    d = max(d, dot(ap.zyx, n2));
    
    return (d - 0.82) * SCALE_D20;
}

// ============================================
// DICE ANIMATIONS
// ============================================

vec3 animateD4(vec3 p, float t, float audio) {
    float audioMod = 1.0 + audio * AUDIO_ANIM_SCALE;
    p.xz *= rotate2D(t * 1.5);
    p.xy *= rotate2D(sin(t * 2.0) * 0.3 * audioMod);
    return p;
}

vec3 animateD6(vec3 p, float t, float audio) {
    float audioMod = 1.0 + audio * AUDIO_ANIM_SCALE * 0.5;
    float twist = sin(t * 0.3) * 1.5 * audioMod;
    float c = cos(twist * p.y);
    float s = sin(twist * p.y * 0.5);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p.xy *= rotate2D(t * 0.4);
    p.yz *= rotate2D(t * 0.28);
    return p;
}

vec3 animateD8(vec3 p, float t, float audio) {
    float audioMod = 1.0 + audio * AUDIO_ANIM_SCALE;
    p.xy *= rotate2D(t * 0.8);
    p.yz *= rotate2D(t * 0.5);
    p *= 1.0 + sin(t * 2.0) * 0.08 * audioMod;
    return p;
}

vec3 animateD10(vec3 p, float t, float audio) {
    p.xy *= rotate2D(sin(t * 1.5) * 0.4);
    p.xz *= rotate2D(t * 1.2);
    return p;
}

vec3 animateD12(vec3 p, float t, float audio) {
    p.xy *= rotate2D(t * 0.3);
    p.yz *= rotate2D(t * 0.23);
    p.xz *= rotate2D(t * 0.17);
    return p;
}

vec3 animateD20(vec3 p, float t, float audio) {
    float ease = sin(t * 0.15) * 2.0;
    p.xy *= rotate2D(ease + sin(t * 2.0) * 0.2);
    p.yz *= rotate2D(ease * 0.7 + cos(t * 1.7) * 0.3);
    p.xz *= rotate2D(ease * 0.5);
    return p;
}

// ============================================
// DICE MORPHING
// ============================================

float evaluateDie(int die, vec3 p, float t, float audio) {
    float result = 0.0;
    if (die == 0) result = sdTetrahedron(animateD4(p, t, audio));
    else if (die == 1) result = sdCube(animateD6(p, t, audio));
    else if (die == 2) result = sdOctahedron(animateD8(p, t, audio));
    else if (die == 3) result = sdD10(animateD10(p, t, audio));
    else if (die == 4) result = sdDodecahedron(animateD12(p, t, audio));
    else result = sdIcosahedron(animateD20(p, t, audio));
    return result;
}

float evaluateDiceBoundary(vec3 p, float t, float audio) {
    float cycle = SHAPE_TIME + MORPH_TIME;
    float mod_t = mod(t, cycle * float(NUM_DICE));
    
    int curr = int(floor(mod_t / cycle));
    float local = mod(mod_t, cycle);
    
    float morph = 0.0;
    int next = curr;
    
    if (local > SHAPE_TIME) {
        morph = smoothstep(0.0, 1.0, (local - SHAPE_TIME) / MORPH_TIME);
        next = int(mod(float(curr + 1), float(NUM_DICE)));
    }
    
    float d1 = evaluateDie(curr, p, t, audio);
    float d2 = evaluateDie(next, p, t, audio);
    
    return mix(d1, d2, morph);
}

// ============================================
// MAIN SHADER
// ============================================

void main() {
    vec2 r = u_resolution.xy;
    vec2 FC = gl_FragCoord.xy;
    vec4 o = vec4(0.0);
    
    // Get audio data
    float audio = getAudioVolume();
    float mids = getAudioMids();
    
    float time = u_time;
    
    // Audio-reactive grid scaling
    float gridScale = 1.0 + audio * AUDIO_GRID_SCALE;
    
    // Process RGB channels (chromatic separation)
    for(int channel = 0; channel < 3; channel++) {
        float Z = float(channel - 1) * CHROMA_SPREAD / 0.02;
        float channelValue = 0.0;
        bool skip = false;
        
        float d = 0.0;
        for(float i = 0.0; i < RAY_STEPS; i += 1.0) {
            if(skip) break;
            
            vec3 p = vec3((FC * 2.0 - r) / r.y * d, d - 8.0);
            
            if(abs(p.x) > 5.0) {
                skip = true;
                continue;
            }
            
            // Camera rotations
            p.xz *= rotate2D(time * ROT_SPEED_XZ);
            p.xy *= rotate2D(time * ROT_SPEED_XY);
            
            // Audio-reactive grid
            float gd = GRID_DENSITY * gridScale;
            vec3 g = floor(p * gd);
            vec3 f = fract(p * gd) - 0.5;
            
            float rand1 = fract(sin(dot(g, vec3(127.0, 312.0, 75.0))) * 43758.0);
            float h = step(length(f), rand1 * 0.3 + 0.1);
            
            // Random angle with audio hue shift
            float rand2 = fract(sin(dot(g, vec3(44.0, 78.0, 123.0))) * 127.0);
            float a = rand2 * TAU + audio * AUDIO_HUE_SHIFT;
            
            // Nested boxes
            float e = 1.0;
            float sc = 2.0;
            for(int j = 0; j < NESTED_BOX_ITERS; j++) {
                vec3 g2 = abs(fract(p * sc / 2.0) * 2.0 - 1.0);
                e = min(e, min(max(g2.x, g2.y), min(max(g2.y, g2.z), max(g2.x, g2.z))) / sc);
                sc *= 0.6;
            }
            
            // Dice morphing SDF
            vec3 pScaled = p / 3.0;
            float c = evaluateDiceBoundary(pScaled, time, audio) * 3.0;
            
            // Ray step with chromatic offset
            float sinC = length(sin(c));
            float s = 0.01 + 0.15 * abs(max(max(c, e - 0.1), sinC - 0.3) + Z * CHROMA_SPREAD - i / 130.0);
            d += s;
            
            // Color accumulation
            float sf = smoothstep(0.02, 0.01, s);
            channelValue += COLOR_INTENSITY / s * (
                0.5 + 0.5 * sin(i * 0.3 + Z * 5.0) +
                sf * DOT_BRIGHTNESS * h * sin(a + i * 0.4 + Z * 5.0)
            );
        }
        
        if(channel == 0) o.r = channelValue;
        else if(channel == 1) o.g = channelValue;
        else o.b = channelValue;
    }
    
    // Tone mapping
    o = o * o / EXPOSURE;
    vec4 exp2o = exp(CONTRAST * o);
    o = (exp2o - 1.0) / (exp2o + 1.0);
    
    gl_FragColor = o;
}
`,
  "template-54": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Процедурная генерация вместо texelFetch(iChannel0, ivec2(5, 0), 0).x
float getAudioValue(int index) {
    float t = u_time * 0.5;
    float freq = float(index) * 0.01;
    float amp = sin(freq * 10.0 + t) * 0.5 + 0.5;
    amp += sin(freq * 15.0 + t * 1.3) * 0.3;
    amp += sin(freq * 20.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

float getTunnel(vec2 uv, float time, float Z) {
    // 1. DISTORTION
    float len = length(uv);
    float ang = atan(uv.y, uv.x);
    
    // Twist
    float twist = 0.2 * sin(time * 0.102);
    ang += twist / (len + 0.1);
    
    // Pulse/Wave
    float wave = 0.23 * sin(len * 18.0 - time * 0.7);
    
    // Reconstruct UVs
    vec2 warpedUV = vec2(cos(ang), sin(ang)) * (len + wave);
    
    // 2. Square Tunnel Logic
    float s_bg = sin(time * 0.0001);
    float c_bg = cos(time * 0.0001);
    warpedUV *= mat2(c_bg, -s_bg, s_bg, c_bg);
    
    // Chebyshev distance
    float rad = max(abs(warpedUV.x), abs(warpedUV.y));
    float tunnelZ = 0.6 / (rad + 0.281);
    
    // 3. Pattern
    float wallAngle = atan(warpedUV.y, warpedUV.x) / 6.28;
    vec2 tunnelGrid = vec2(wallAngle * 8.0, tunnelZ - time * 0.001);
    vec2 tGridId = floor(tunnelGrid);
    float checker = mod(tGridId.x + tGridId.y, 2.0);
    
    // Fog
    float tunnelFog = smoothstep(0.0, 4.0, tunnelZ);
    
    // Pulse
    float bgPulse = 0.5 + 0.5 * sin(tunnelZ * 0.4 + time + Z * 2.0 + wave * 10.0);
    
    return checker * bgPulse * tunnelFog;
}

void main() {
    // --- SETUP ---
    // Extract Bass info
    float bass = getAudioValue(5);
    float mid = getAudioValue(127);
    float high = getAudioValue(500);
    high = mix(high, mid, 0.5);
    vec2 uv_orig = gl_FragCoord.xy / u_resolution.xy;
    vec2 texsize = u_resolution.xy;
    float time = u_time;
    
    vec2 r = texsize;
    vec2 FC = uv_orig * r;
    vec4 o = vec4(0.0);
    
    vec2 bgBaseUV = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    for(int channel = 0; channel < 3; channel++) {
        float Z = float(channel - 1);
        float channelValue = 0.0;
        float skipFlag = 0.0;
        float d = 0.0;
        float density = 0.0;
        
        for(float i = 0.0; i < 80.0; i += 1.0) {
            float continueFlag = 1.0 - step(0.5, skipFlag);
            vec3 p = vec3((FC * 2.0 - r) / r.y * d, d - 8.0);
            
            float skipCondition = step(5.0, abs(p.x));
            skipFlag = max(skipFlag, skipCondition * continueFlag);
            float processFlag = 1.0 - step(0.5, skipFlag);
            
            if(processFlag > 0.5) {
                vec3 pRaw = p;
                
                // Rotations
                float s_rot = sin(time / 5.0);
                float c_rot = cos(time / 5.0);
                mat2 rot1 = mat2(c_rot, -s_rot, s_rot, c_rot);
                p.xz = rot1 * p.xz;
                
                s_rot = sin(time / 5.0);
                c_rot = cos(time / 5.0);
                mat2 rot2 = mat2(c_rot, -s_rot, s_rot, c_rot);
                p.xy = rot2 * p.xy;
                
                // Dots Logic
                vec3 g = floor(p * 6.0);
                vec3 f = fract(p * 6.0) - 0.5;
                float rand1 = fract(sin(dot(g, vec3(127.0, 312.0, 75.0))) * 43758.0);
                float h = step(length(f), rand1 * 0.3 + 0.1);
                float rand2 = fract(sin(dot(g, vec3(44.0, 78.0, 123.0))) * 127.0);
                float a = 500.0 + rand2 * high * 30.0 * mid;
                
                // --- INNER BOX REPETITION LOGIC ---
                float e = 0.0;
                float sc = 2.0 + bass * 2.1;
                if(i < 60.0) sc = 4.5 + (bass + mid + high) / 13.0;
                // ----------------------------------
                
                float absX = abs(p.x), absY = abs(p.y), absZ = abs(p.z);
                
                // Main Object Size
                float size = -8.5 + sc * 2.9;
                
                float c = max(max(max(absX, absY), absZ), dot(vec3(absX, absY, absZ), vec3(0.577)) * 0.9) - size;
                
                // --- BAND LOGIC ---
                float sphereDist = length(pRaw) - size * 0.8;
                float bandMetric = sphereDist;
                
                if(c > 0.12) {
                    float bandFreq = 3.0;
                    float warpFactor = 0.3 * sin(pRaw.z * 2.0 + u_time * 0.6) * sin(pRaw.y * 2.0 - u_time);
                    float warpedDist = bandMetric + warpFactor * 1.3;
                    float ripples = sin(warpedDist * bandFreq);
                    float sharpBand = smoothstep(0.00, 0.99, ripples * 0.5);
                    float fade = 1.0 / (c * 50.0);
                    float startFade = smoothstep(0.01, 0.5, c);
                    
                    float centerDist = length(pRaw.xy);
                    float centerHole = smoothstep(size * 0.8, size * 0.8 + 2.0, centerDist);
                    
                    channelValue += (0.0001 + sharpBand * fade * 1000.0) * 14.1 * startFade * centerHole;
                }
                
                float sinC = length(sin(vec3(c)));
                float s_dist = 0.01 + 0.25 * abs(max(max(c, e - 0.1), abs(sinC) - 0.3) + Z * 0.02 - i / 130.0);
                d += s_dist;
                
                float sf = smoothstep(0.02, 0.01, s_dist);
                channelValue += 1.6 / s_dist * (0.5 + 0.5 * sin(i * 0.2 + Z * 5.0) + sf * 4.0 * h * sin(a + i * 0.4 + Z * 5.0));
                
                density += sf * 0.10;
            } else {
                d += 1.0 * skipCondition;
            }
        }
        
        // --- COMPOSITE BACKGROUND ---
        float warpAmount = density * (0.15 + Z * 0.15);
        vec2 refractedUV = bgBaseUV * (1.0 - warpAmount);
        float bgFinal = getTunnel(refractedUV, time, Z * 1.5);
        
        // --- VISIBILITY MASK ---
        float objectMask = smoothstep(0.3, 1.0, density * 7.5);
        float bgIntensity = 1000.0 * 1.5 * objectMask;
        
        channelValue += bgFinal * bgIntensity;
        
        if(channel == 0) o.r = channelValue * 1.5;
        else if(channel == 1) o.g = channelValue * 1.5;
        else o.b = channelValue * 1.5;
    }
    
    o = o * o / 1.0e7;
    o = min(o, 10.0);
    vec4 exp2o = exp(4.0 * o);
    o = (exp2o - 1.0) / (exp2o + 1.0);
    
    gl_FragColor = o;
}
`,
  "template-55": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265

float orenNayarDiffuse(
  vec3 lightDirection,
  vec3 viewDirection,
  vec3 surfaceNormal,
  float roughness,
  float albedo) {
  
  float LdotV = dot(lightDirection, viewDirection);
  float NdotL = dot(lightDirection, surfaceNormal);
  float NdotV = dot(surfaceNormal, viewDirection);

  float s = LdotV - NdotL * NdotV;
  float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));

  float sigma2 = roughness * roughness;
  float A = 1.0 + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));
  float B = 0.45 * sigma2 / (sigma2 + 0.09);

  return albedo * max(0.0, NdotL) * (A + B * s / t) / PI;
}

float gaussianSpecular(
  vec3 lightDirection,
  vec3 viewDirection,
  vec3 surfaceNormal,
  float shininess) {
  vec3 H = normalize(lightDirection + viewDirection);
  float theta = acos(dot(H, surfaceNormal));
  float w = theta / shininess;
  return exp(-w*w);
}

float fogFactorExp2(
  const float dist,
  const float density
) {
  const float LOG2 = -1.442695;
  float d = density * dist;
  return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

//------------------------------------------------------------------------
// Camera
//
// Move the camera. In this case it's using time and the mouse position
// to orbitate the camera around the origin of the world (0,0,0), where
// the yellow sphere is.
//------------------------------------------------------------------------
void doCamera( out vec3 camPos, out vec3 camTar, in float time, in float mouseX )
{
    float an = 10.0*mouseX+4.5;
    camPos = vec3(3.5*sin(an),1.0,3.5*cos(an));
    camTar = vec3(0.0,0.0,0.0);
}

//------------------------------------------------------------------------
// Background 
//
// The background color. In this case it's just a black color.
//------------------------------------------------------------------------
vec3 doBackground( void )
{
    return vec3(0.003,0.003,0.005);
}
    
//------------------------------------------------------------------------
// Modelling 
//
// Defines the shapes (a sphere in this case) through a distance field, in
// this case it's a sphere of radius 1.
//------------------------------------------------------------------------

// Процедурная генерация вместо texture(iChannel0, vec2(0.8, 0.)).r
float getAudioValue1() {
    float t = u_time * 0.5;
    float amp = sin(t) * 0.5 + 0.5;
    amp += sin(t * 1.3) * 0.3;
    return pow(amp, 2.0) * 0.5 + 0.5;
}

// Процедурная генерация вместо texture(iChannel0, vec2(0.05, 0.)).r
float getAudioValue2() {
    float t = u_time * 0.5;
    float amp = sin(t * 0.5) * 0.5 + 0.5;
    amp += sin(t * 0.8) * 0.3;
    return pow(amp, 1.5);
}

float doModel( vec3 p )
{
    float r = getAudioValue1();
    float n = max(0.0, getAudioValue2() * 3.5 - 1.0);
    
    n = n * exp(snoise(vec4(p * 2.1, u_time * 2.3)));
    
    return length(p) - (1.0 + n * 0.05) * 0.9;
}

//------------------------------------------------------------------------
// Material 
//
// Defines the material (colors, shading, pattern, texturing) of the model
// at every point based on its position and normal. In this case, it simply
// returns a constant yellow color.
//------------------------------------------------------------------------
vec3 doMaterial( in vec3 pos, in vec3 nor )
{
    return vec3(0.125,0.1,0.2)+(vec3(0.6,0.9,0.4)*3.0*clamp(length(pos)-0.94,0.0,1.0));
}

//------------------------------------------------------------------------
// Lighting
//------------------------------------------------------------------------
float calcSoftshadow( in vec3 ro, in vec3 rd );

vec3 doLighting( in vec3 pos, in vec3 nor, in vec3 rd, in float dis, in vec3 mal )
{
    vec3 lin = vec3(0.0);

    // key light
    //-----------------------------
    vec3  view = normalize(-rd);
    vec3  lig1 = normalize(vec3(1.0,0.7,0.9));
    vec3  lig2 = normalize(vec3(1.0,0.9,0.9)*-1.0);
    
    float spc1 = gaussianSpecular(lig1, view, nor, 0.95)*0.5;
    float dif1 = max(0.0, orenNayarDiffuse(lig1, view, nor, -20.1, 1.0));
    float sha1 = 0.0; if( dif1>0.01 ) sha1=calcSoftshadow( pos+0.01*nor, lig1 );
    vec3  col1 = vec3(2.0,4.2,4.0);
    lin += col1*spc1+dif1*col1*sha1;
    
    float spc2 = gaussianSpecular(lig2, view, nor, 0.95);
    float dif2 = max(0.0, orenNayarDiffuse(lig2, view, nor, -20.1, 1.0));
    float sha2 = 0.0; if( dif2>0.01 ) sha2=calcSoftshadow( pos+0.01*nor, lig2 );
    vec3  col2 = vec3(2.00,0.05,0.15);
    lin += col2*spc2+dif2*col2*sha1;

    // ambient light
    //-----------------------------
    lin += vec3(0.05);

    
    // surface-light interacion
    //-----------------------------
    vec3 col = mal*lin;

    return col;
}

float calcIntersection( in vec3 ro, in vec3 rd )
{
    const float maxd = 20.0;           // max trace distance
    const float precis = 0.001;        // precission of the intersection
    float h = precis*2.0;
    float t = 0.0;
    float res = -1.0;
    for( int i=0; i<90; i++ )          // max number of raymarching iterations is 90
    {
        if( h<precis||t>maxd ) break;
        h = doModel( ro+rd*t );
        t += h;
    }

    if( t<maxd ) res = t;
    return res;
}

vec3 calcNormal( in vec3 pos )
{
    const float eps = 0.002;             // precision of the normal computation

    const vec3 v1 = vec3( 1.0,-1.0,-1.0);
    const vec3 v2 = vec3(-1.0,-1.0, 1.0);
    const vec3 v3 = vec3(-1.0, 1.0,-1.0);
    const vec3 v4 = vec3( 1.0, 1.0, 1.0);

    return normalize( v1*doModel( pos + v1*eps ) + 
                      v2*doModel( pos + v2*eps ) + 
                      v3*doModel( pos + v3*eps ) + 
                      v4*doModel( pos + v4*eps ) );
}

float calcSoftshadow( in vec3 ro, in vec3 rd )
{
    float res = 1.0;
    float t = 0.0001;                 // selfintersection avoidance distance
    float h = 1.0;
    for( int i=0; i<5; i++ )         // 40 is the max numnber of raymarching steps
    {
        h = doModel(ro + rd*t);
        res = min( res, 4.0*h/t );   // 64 is the hardness of the shadows
        t += clamp( h, 0.02, 2.0 );   // limit the max and min stepping distances
    }
    return clamp(res,0.0,1.0);
}

mat3 calcLookAtMatrix( in vec3 ro, in vec3 ta, in float roll )
{
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    return mat3( uu, vv, ww );
}

void main() {
    vec2 p = (-u_resolution.xy + 2.0*gl_FragCoord.xy)/u_resolution.y;
    vec2 m = u_mouse.xy/u_resolution.xy;

    //-----------------------------------------------------
    // camera
    //-----------------------------------------------------
    
    // camera movement
    vec3 ro, ta;
    doCamera( ro, ta, u_time, m.x );

    // camera matrix
    mat3 camMat = calcLookAtMatrix( ro, ta, 0.0 );  // 0.0 is the camera roll
    
    // create view ray
    vec3 rd = normalize( camMat * vec3(p.xy,2.0) ); // 2.0 is the lens length

    //-----------------------------------------------------
    // render
    //-----------------------------------------------------

    vec3 col = doBackground();

    // raymarch
    float t = calcIntersection( ro, rd );
    if( t>-0.5 )
    {
        // geometry
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal(pos);

        // materials
        vec3 mal = doMaterial( pos, nor );
        vec3 lcl = doLighting( pos, nor, rd, t, mal );

        col = mix(lcl, col, fogFactorExp2(t, 0.1));
    }

    //-----------------------------------------------------
    // postprocessing
    //-----------------------------------------------------
    // gamma
    col = pow( clamp(col,0.0,1.0), vec3(0.4545) );
    col += dot(p,p*0.035);
    col.r = smoothstep(0.1,1.1,col.r);
    col.g = pow(col.g, 1.1);
       
    gl_FragColor = vec4( col, 1.0 );
}
`,
  "template-56": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main() {
    vec4 o = vec4(0.0);
    vec4 p;
    vec4 P;
    vec4 U = vec4(1.0, 2.0, 3.0, 0.0);
    
    // Musical timing: beat-synced animation
    //  floor(T)+sqrt(F) gives the beat synchronized speed-up
    //  floor(T)+F*F also works
    float T = u_time * 1.9;
    float F = fract(T);
    float t = floor(T) + sqrt(F);
    
    // 2D rotation matrix that spins based on musical beats
    mat2 R = mat2(cos(t * 0.1 + 11.0 * U.wxzw));
    
    // Raymarching loop
    vec2 r = u_resolution.xy;
    float z = 0.0;
    
    for(float i = 0.0; i < 77.0; i += 1.0) {
        float d;
        float k;
        
        // Create ray from camera through current pixel
        //  Extend to 4D because why not?
        p = vec4(z * normalize(vec3(gl_FragCoord.xy - 0.5 * r.xy, r.y)), 0.2);
        
        // Move camera back in Z
        p.z -= 3.0;
        
        p.xw *= R;  // Rotate in XW plane
        p.yw *= R;  // Rotate in YW plane  
        p.zw *= R;  // Rotate in ZW plane
        
        // @mla inversion
        //  Makes the boring grid more interesting
        k = 9.0 / dot(p, p);
        p *= k;
        
        // Offset by time to move grid
        //  Store P for coloring later
        P = p;
        p -= 0.5 * t;
        
        // Fold space: move to unit cell of infinite lattice
        //  abs here in to avoid doing it for each individual box edge
        p = abs(p - floor(p + 0.5));
        
        // Distance field
        d = abs(
         min(
           min(
               // Cross pattern centered in each unit cell
               min(min(length(p.xz), length(p.yz)), length(p.xy))
               // 4D sphere at the center of each unit cell
             , length(p) - 0.2
             )
             // Box edges: thin walls along each axis
           , min(p.w, min(p.x, min(p.z, p.y))) + 0.05
           )
           ) / k;
        
        // Color calculation based on depth and inversion factor
        p = 1.0 + sin(P.z + log(k) / log(2.0) + U.wxyw);
        
        // Accumulate color: brightness scales with inversion + beat fade
        o += U * exp(0.7 * k - 6.0 * F) + p.w * p / max(d, 1e-3);
        
        z += 0.8 * d + 1e-3;
    }
    
    // Tanh tone mapping, divide by .9 to get a slight clipping effect
    vec4 ot = o / 1e4;
    vec4 exp2ot = exp(2.0 * ot);
    vec4 tanhOt = (exp2ot - 1.0) / (exp2ot + 1.0);
    gl_FragColor = tanhOt / 0.9;
}
`,
  "template-57": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Процедурная генерация вместо texelFetch(iChannel0, ivec2(4, 0), 0).r
float getAudioValue(int index) {
    float t = u_time * 0.5;
    float freq = float(index) * 0.01;
    float amp = sin(freq * 10.0 + t) * 0.5 + 0.5;
    amp += sin(freq * 15.0 + t * 1.3) * 0.3;
    amp += sin(freq * 20.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

// Процедурная генерация параметров вместо texelFetch(iChannel0, ivec2(64, 0), 0)
vec4 getParam(int index) {
    float t = u_time * 0.3;
    float phase = float(index) * 0.1;
    return vec4(
        sin(t + phase) * 0.5 + 0.5,
        cos(t * 1.2 + phase) * 0.5 + 0.5,
        sin(t * 0.8 + phase) * 0.5 + 0.5,
        1.0
    );
}

// Rotation matrix
mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

// Cosine palette (Inigo Quilez style)
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

// Standard MilkDrop palette
vec3 milkPalette(float t, float phase) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557) + phase;
    return a + b * cos(6.28318 * (c * t + d));
}

// Smooth noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Signed distance functions for geometric shapes
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p) * sign(p.y);
}

// Smooth minimum for organic blending
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
    // Normalized coordinates (-1 to 1), aspect corrected
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec2 originalUV = uv;
    
    // Audio analysis - sample multiple frequency bands
    float bass = getAudioValue(4);
    float mid = getAudioValue(32);
    float high = getAudioValue(64);
    float treble = getAudioValue(96);
    float energy = (bass + mid + high + treble) * 0.25;
    
    // Get parameters from Buffer A
    vec4 param1 = getParam(64);
    vec4 param2 = getParam(65);
    vec4 param3 = getParam(66);
    vec4 param4 = getParam(67);
    
    float t = u_time;
    float beatPulse = smoothstep(0.6, 1.0, bass);
    
    // =========================================================================
    // LAYER 1: Wave Displacement Background
    // =========================================================================
    
    vec2 waveUV = uv * 2.0;
    
    // Multi-layered sinusoidal waves (classic MilkDrop signature)
    float wave1 = sin(waveUV.x * 4.0 + waveUV.y * 3.0 + t * 0.8 + bass * 2.0) * 0.5;
    float wave2 = sin(waveUV.y * 5.0 - waveUV.x * 2.0 + t * 0.6 + mid * 1.5) * 0.5;
    float wave3 = sin((waveUV.x + waveUV.y) * 3.0 + t * 1.0 + high * 2.0) * 0.5;
    
    float waves = wave1 + wave2 + wave3;
    waves = waves * 0.33; // Normalize
    
    // Apply wave displacement to UV
    vec2 displacedUV = uv + vec2(waves * 0.1 * (1.0 + energy), waves * 0.08 * (1.0 + energy));
    
    // Background gradient based on waves
    vec3 bgColor = milkPalette(waves + t * 0.05, t * 0.02);
    bgColor *= 0.3 + energy * 0.4;
    
    // =========================================================================
    // LAYER 2: Rotating Geometric Patterns
    // =========================================================================
    
    vec2 geoUV = displacedUV;
    
    // Multiple rotation layers
    float rot1 = param1.x;      // Rotation from Buffer A
    float rot2 = param2.x;
    float rot3 = param3.x;
    
    // Apply rotations
    geoUV *= rot(rot1);
    float rotLayer1 = length(geoUV);
    float angLayer1 = atan(geoUV.y, geoUV.x);
    
    // Concentric rings with rotation
    float rings = abs(sin(rotLayer1 * 15.0 - t * 2.0 + bass * 5.0));
    rings = smoothstep(0.1, 0.9, rings);
    rings *= exp(-rotLayer1 * 2.0) * (0.5 + bass);
    
    // Star/asterisk pattern
    vec2 starUV = geoUV * rot(rot2);
    float arms = abs(cos(angLayer1 * 5.0 + t + rot2)) * 0.1;
    arms += abs(cos(angLayer1 * 3.0 - t * 0.7 + rot2)) * 0.15;
    float star = smoothstep(0.05, 0.0, arms - rotLayer1 * 0.3);
    star *= (0.5 + energy * 0.5);
    
    // Hexagonal pattern
    vec2 hexUV = geoUV * rot(rot3);
    float hexDist = sdHexagon(hexUV, 0.3 + bass * 0.1);
    float hexPattern = smoothstep(0.02, 0.0, abs(hexDist - 0.05));
    hexPattern += smoothstep(0.02, 0.0, abs(hexDist - 0.15));
    hexPattern *= (0.4 + mid);
    
    // Combine geometric layers
    vec3 geoColor = milkPalette(angLayer1 * 0.3 + t * 0.1 + rot1, t * 0.03);
    geoColor *= rings + star + hexPattern;
    geoColor *= 1.0 + energy;
    
    // =========================================================================
    // LAYER 3: Kaleidoscope / Radial Symmetry
    // =========================================================================
    
    vec2 kaleidoUV = displacedUV;
    float kaleidoR = length(kaleidoUV);
    float kaleidoA = atan(kaleidoUV.y, kaleidoUV.x);
    
    // 8-fold radial symmetry
    float segments = 8.0;
    kaleidoA = abs(mod(kaleidoA, 3.14159 / segments) - 1.5708 / segments);
    kaleidoUV = vec2(cos(kaleidoA), sin(kaleidoA)) * kaleidoR;
    
    // Wavy lines from center
    float radialWave = sin(kaleidoR * 20.0 - t * 4.0 + bass * 8.0);
    float radialLines = smoothstep(0.0, 0.5, abs(radialWave)) * (0.3 + high);
    
    // Spiral pattern
    float spiral = sin(kaleidoR * 10.0 - kaleidoA * 6.0 + t * 1.5);
    float spiralPattern = smoothstep(0.2, 0.8, spiral);
    
    // Inner glow
    float innerGlow = exp(-kaleidoR * 3.0) * (0.5 + energy);
    
    vec3 kaleidoColor = milkPalette(kaleidoA * 0.5 + t * 0.08, t * 0.015);
    kaleidoColor *= (radialLines + spiralPattern + innerGlow) * 2.0;
    kaleidoColor *= (0.6 + energy * 0.8);
    
    // =========================================================================
    // LAYER 4: Animated Curves and Lines
    // =========================================================================
    
    vec2 curveUV = uv * 3.0;
    
    // Sine curves
    float curve1 = sin(curveUV.x * 4.0 + t + param1.y * 5.0);
    float curve2 = cos(curveUV.y * 3.0 - t * 0.7 + param2.y * 5.0);
    float curve3 = sin((curveUV.x + curveUV.y) * 2.0 + t * 1.2 + param3.y * 5.0);
    
    // Combine curves
    float curves = abs(curve1 * 0.5 + curve2 * 0.3 + curve3 * 0.2);
    curves = smoothstep(0.7, 0.3, curves);
    curves *= exp(-length(uv) * 1.5) * (0.4 + energy);
    
    // Perpendicular lines
    float lines = abs(sin(curveUV.x * 10.0 + t * 2.0)) * 0.1;
    lines += abs(cos(curveUV.y * 8.0 - t * 1.8)) * 0.1;
    lines = smoothstep(0.08, 0.0, lines);
    lines *= exp(-length(uv) * 2.0) * (0.3 + mid);
    
    vec3 curveColor = milkPalette(curve1 * 0.3 + t * 0.12, t * 0.025);
    curveColor *= (curves + lines) * 1.5;
    
    // =========================================================================
    // LAYER 5: Beat Pulse Effects
    // =========================================================================
    
    vec2 pulseUV = uv;
    
    // Expanding ring on beat
    float pulseRing = abs(length(pulseUV) - t * 0.5 + bass * 0.5);
    pulseRing = smoothstep(0.05, 0.0, abs(pulseRing - fract(t * 0.3)));
    pulseRing *= smoothstep(0.3, 0.0, length(pulseUV));
    pulseRing *= beatPulse * 2.0;
    
    // Screen shake on strong beats
    float shake = (bass > 0.7) ? (hash(vec2(t * 10.0)) - 0.5) * 0.05 : 0.0;
    pulseUV += vec2(shake);
    
    // Flash effect
    float flash = smoothstep(0.8, 1.0, bass) * 0.3;
    
    vec3 pulseColor = vec3(flash) + vec3(1.0, 0.8, 0.6) * pulseRing;
    
    // =========================================================================
    // LAYER 6: Organic Noise Layer
    // =========================================================================
    
    vec2 noiseUV = uv * 4.0 + vec2(t * 0.1, t * 0.15);
    float organicNoise = fbm(noiseUV, 5);
    
    // Fluid-like color banding
    vec3 fluidColor = milkPalette(organicNoise + t * 0.06, t * 0.018);
    fluidColor *= organicNoise * 0.5;
    fluidColor *= (0.4 + energy * 0.6);
    
    // =========================================================================
    // FINAL COMPOSITION
    // =========================================================================
    
    vec3 finalColor = bgColor;
    
    // Additive blending of geometric layer
    finalColor += geoColor * 0.8;
    
    // Kaleidoscope overlay
    finalColor = mix(finalColor, kaleidoColor, 0.6);
    
    // Curve patterns
    finalColor += curveColor * 0.5;
    
    // Beat effects
    finalColor += pulseColor;
    
    // Fluid layer
    finalColor = mix(finalColor, fluidColor, 0.4);
    
    // Radial vignette
    float vignette = 1.0 - length(uv * 0.7);
    vignette = smoothstep(0.0, 1.0, vignette);
    finalColor *= vignette;
    
    // Dynamic brightness
    finalColor *= 0.8 + energy * 0.4;
    
    // Subtle scanline effect
    float scanline = sin(gl_FragCoord.y * 3.14159 / u_resolution.y * 200.0) * 0.02;
    finalColor -= scanline;
    
    // Gamma correction
    finalColor = pow(finalColor, vec3(0.9));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`,
  "template-58": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Процедурная генерация вместо texture(iChannel0, vec2(uv)).rgb
vec3 getTexture(vec2 uv) {
    float t = u_time * 0.3;
    vec3 col = vec3(0.0);
    
    // Создаем простой паттерн
    float d = length(uv - 0.5);
    col.r = sin(uv.x * 10.0 + t) * 0.5 + 0.5;
    col.g = sin(uv.y * 10.0 + t * 1.2) * 0.5 + 0.5;
    col.b = sin((uv.x + uv.y) * 8.0 + t * 0.8) * 0.5 + 0.5;
    
    col *= exp(-d * 2.0);
    
    return col;
}

void main() {
    vec2 uv = vec2(gl_FragCoord.x / u_resolution.x, gl_FragCoord.y / u_resolution.y);
    vec3 t = getTexture(uv);
    
    float x = (uv.x - 0.5) * t.x * 0.1 * sin(u_time * 0.1) * 0.5;
    float x2 = (uv.x - 0.5) * t.y * 0.1 * sin(u_time * 0.2) * 0.5;
    
    float tr = getTexture(vec2(uv.x + x, uv.y)).x;
    float tg = getTexture(vec2(uv.x + x2, uv.y)).y;
    
    vec4 fragColor = vec4(t, 1.0);
    fragColor.x = tr;
    fragColor.y = tg;
    
    vec2 uv2 = (uv - vec2(0.5)) * (2.0 + cos(u_time * 0.25));
    fragColor.rgb += vec3(0.1, 0.1, 0.2) * 4.0;
    fragColor *= (1.0 - length(uv2) * 0.7) * 0.5;
    
    gl_FragColor = fragColor;
}
`,
  "template-59": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define SQRT2 1.41421356237
#define INV_SQRT2 0.70710678118

// Процедурная генерация вместо texelFetch(iChannel0, ivec2(i, 0), 0).xy
vec2 getAudioSample(int index) {
    float t = u_time * 0.5;
    float freq = float(index) * 0.01;
    float amp1 = sin(freq * 10.0 + t) * 0.5 + 0.5;
    float amp2 = sin(freq * 15.0 + t * 1.3) * 0.5 + 0.5;
    amp1 = pow(amp1, 2.0);
    amp2 = pow(amp2, 2.0);
    return vec2(amp1, amp2);
}

float plot(vec2 p) {
    int MAX_SAMPLES = 1024;
    float d = 2.0 / u_resolution.y;
    
    float sum = 0.0;
    for(int i = 0; i < 1024; i++) {
        if(i >= MAX_SAMPLES) break;
        vec2 s = getAudioSample(i) * mat2(-0.5, 0.5, 0.5, 0.5);
        float r = length(p - s);
        sum += smoothstep(d, 0.0, r - 0.003);
    }
    return sum;
}

float bgPattern(vec2 p) {
    float d = 2.0 / u_resolution.y;
    
    float rect = 0.0;
    rect += smoothstep(2.0 * d, 0.0, abs(p.x + p.y)) * smoothstep(2.0 * d, 0.0, abs(p.x - p.y) - 0.95);
    rect += smoothstep(2.0 * d, 0.0, abs(p.x - p.y)) * smoothstep(2.0 * d, 0.0, abs(p.x + p.y) - 0.95);
    rect += smoothstep(2.0 * d, 0.0, abs(abs(p.x + p.y) - 1.0)) * smoothstep(2.0 * d, 0.0, abs(p.x - p.y) - 1.0);
    rect += smoothstep(2.0 * d, 0.0, abs(abs(p.x - p.y) - 1.0)) * smoothstep(2.0 * d, 0.0, abs(p.x + p.y) - 1.0);
    rect += smoothstep(2.0 * d, 0.0, abs(p.x)) * smoothstep(d, 0.0, abs(p.y) - 0.95);
    return min(rect, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = 2.0 * uv - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    
    float shape = 0.0;
    
    shape += plot(p);
    shape += 0.1 * bgPattern(p);
    
    gl_FragColor = vec4(vec3(shape), 1.0);
}
`,
  "template-60": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Процедурная генерация вместо texture(iChannel0, uv).rgb
vec3 getTexture(vec2 uv) {
    float t = u_time * 0.3;
    vec3 col = vec3(0.05, 0.05, 0.1);
    
    // Добавляем простой паттерн
    float d = length(uv - 0.5);
    col += vec3(0.2, 0.25, 0.3) * exp(-d * 2.0);
    col += vec3(0.1) * sin(uv.x * 10.0 + t) * sin(uv.y * 10.0 + t * 0.7);
    
    return col;
}

// Процедурная генерация wavetable вместо wavetable(vec2(waveX, highlightPos), iChannel1, iTime)
float wavetable(vec2 uv, float time) {
    float wave = 0.0;
    
    // Комбинация синусоидальных волн
    wave += sin(uv.x * 6.28318 * 2.0 + time * 0.5) * 0.3;
    wave += sin(uv.x * 6.28318 * 4.0 + time * 0.7) * 0.2;
    wave += sin(uv.x * 6.28318 * 8.0 + time * 1.0) * 0.15;
    wave += sin(uv.x * 6.28318 * 1.0 + time * 0.3) * 0.35;
    
    // Добавляем вариацию по Y
    wave *= (1.0 + uv.y * 0.3);
    
    return wave;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float yoffset = 0.5 + sin(u_time) / 2.0;
    
    // Get the buffer contents
    vec3 col = getTexture(uv);
    uv += 0.1;
    
    // Highlighted slice position (at 0.5)
    float highlightPos = yoffset;
    
    // Draw highlighted slice with matching isometric transformation
    vec2 centerUV = (uv - vec2(0.5, 0.5)) * 2.5;
    
    // Isometric projection for highlighted slice
    float isoX = highlightPos * 0.6;  // Move right
    float isoY = highlightPos * 0.9;  // Move up
    
    // Calculate x position in waveform from screen position
    float waveX = ((centerUV.x - isoX) / 1.2) + 0.5;
    
    if(waveX >= 0.0 && waveX <= 1.0) {
        float waveValue = wavetable(vec2(waveX, highlightPos), u_time);
        
        // y position: wave amplitude + isometric offset
        float posY = waveValue * 0.25 + isoY;
        
        // Distance from current pixel
        float dist = abs(centerUV.y - posY);
        float lineThickness = 0.012;
        float glowRadius = 0.04;
        
        if(dist < glowRadius) {
            float intensity = 0.0;
            
            // Core line
            if(dist < lineThickness) {
                intensity = 1.0;
            } else {
                // Glow
                intensity = 1.0 - (dist - lineThickness) / (glowRadius - lineThickness);
                intensity *= 0.6;
            }
            
            col += vec3(0.7, 1.0, 0.7) * intensity;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-61": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Точная адаптация вершинного шейдера с vertexshaderart.com
// Оригинал: void main() { ... gl_Position = vec4(xy, 0, 1); gl_PointSize = ...; v_color = vec4(1, 0, 0, 1); }

#define VERTEX_COUNT 200.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    // Константа для цикла (GLSL ES 2.0 требует константные границы циклов)
    const float vertexCount = VERTEX_COUNT;
    
    // Вычисляем размеры сетки (точно как в оригинале)
    float down = floor(sqrt(vertexCount));
    float zort = floor(vertexCount / down);
    
    // Нормализуем координаты экрана
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = (uv * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
    
    // Для каждого пикселя проверяем все ближайшие вершины
    vec3 col = vec3(0.05, 0.05, 0.1); // Фон
    float found = 0.0;
    
    // Проходим по всем вершинам (константная граница цикла)
    for (float vertexId = 0.0; vertexId < VERTEX_COUNT; vertexId += 1.0) {
        if (found > 0.5) break;
        
        // Вычисляем координаты вершины в сетке (точно как в оригинале)
        float x = mod(vertexId, zort);
        float y = floor(vertexId / zort);
        
        float u = x / (zort - 1.0);
        float v = y / (zort - 1.0);
        
        // Смещения (анимация) - точно как в оригинале
        float xoff = sin(time + y * 0.1) * 0.2;
        float yoff = sin(time + x * 0.1) * 0.2;
        
        // Финальная позиция вершины (точно как в оригинале: vec2 xy = vec2(ux, vy) * 0.5;)
        float ux = u * 2.0 - 1.0 + xoff;
        float vy = v * 2.0 - 1.0 + yoff;
        vec2 xy = vec2(ux, vy) * 0.5;
        
        // Быстрая проверка расстояния
        float quickDist = length(p - xy);
        if (quickDist > 0.3) continue;
        
        // Вычисляем размер точки (точно как в оригинале)
        float soff = sin(time + x * y * 0.001) * 5.0;
        float pointSize = 4.0 + soff;
        pointSize *= 20.0 / zort;
        pointSize *= resolution.x / 600.0;
        
        // Конвертируем размер точки в нормализованные координаты экрана
        float pointSizeNorm = pointSize / resolution.y;
        
        // Расстояние от текущего пикселя до вершины
        float dist = quickDist;
        
        // Рисуем точку, если пиксель внутри размера точки
        if (dist < pointSizeNorm * 1.5) {
            float alpha = smoothstep(pointSizeNorm, 0.0, dist);
            // Цвет вершины (точно как в оригинале: v_color = vec4(1, 0, 0, 1))
            col = mix(col, vec3(1.0, 0.0, 0.0), alpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-62": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал использует vertexId, vertexCount, time, resolution, mouse, sound

#define KP0 10.0 * u_mouse.x
#define KP1 3.0 * u_mouse.y
#define KP2 2.0
#define KP3 0.0
#define KP4 5.0
#define KP5 10000.0

#define VERTEX_COUNT 500.0

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / (0.0 - KP3), 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.yxz);
}

mat4 rotX(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = tan(angleInRadians);
    return mat4( 
      1.0, 0.0, 0.0, 0.0,
      0.0, c, s, 0.0,
      0.0, -s, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rotY(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rotZ(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, -s, 0.0, 0.0, 
      s, c, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0); 
}

mat4 trans(vec3 trans) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    trans.x, trans.y, trans.z, 1.0);
}

mat4 ident() {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 scale(vec3 s) {
  return mat4(
    s[0], 0.0, 0.0, 0.0,
    0.0, s[1], 0.0, 0.0,
    0.0, 0.0, s[2], 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 uniformScale(float s) {
  return mat4(
    s, 0.0, 0.0, 0.0,
    0.0, s, 0.0, 0.0,
    0.0, 0.0, s, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 persp(float fov, float aspect, float zNear, float zFar) {
  float f = tan(PI * 0.5 - 0.5 * fov);
  float rangeInv = 1.0 / (zNear - zFar);
  return mat4(
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (zNear + zFar) * rangeInv, -1.0,
    0.0, 0.0, zNear * zFar * rangeInv * 2.0, 0.0);
}

mat4 trInv(mat4 m) {
  mat3 i = mat3(
    m[0][0], m[1][0], m[2][0], 
    m[0][1], m[1][1], m[2][1], 
    m[0][2], m[1][2], m[2][2]);
  vec3 t = -i * m[3].xyz;
  return mat4(
    i[0], t[0], 
    i[1], t[1],
    i[2], t[2],
    0.0, 0.0, 0.0, 1.0);
}

mat4 transpose(mat4 m) {
  return mat4(
    m[0][0], m[1][0], m[2][0], m[3][0], 
    m[0][1], m[1][1], m[2][1], m[3][1],
    m[0][2], m[1][2], m[2][2], m[3][2],
    m[0][3], m[1][3], m[2][3], m[3][3]);
}

mat4 lookAt(vec3 eye, vec3 target, vec3 up) {
  vec3 zAxis = normalize(eye - target);
  vec3 xAxis = normalize(cross(up, zAxis));
  vec3 yAxis = cross(zAxis, xAxis);
  return mat4(
    xAxis.x, yAxis.x, zAxis.x, 0.0,
    xAxis.y, yAxis.y, zAxis.y, 0.0,
    xAxis.z, yAxis.z, zAxis.z, 0.0,
    eye.x, eye.y, eye.z, 1.0);
}

mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

mat4 cameraLookAt(vec3 eye, vec3 target, vec3 up) {
  return inverse(lookAt(eye, target, up));
}

float hash(float p) {
    vec2 p2 = fract(vec2(p * 5.3983, p * 5.4427));
    p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
    return fract(p2.x * p2.y * 95.4337);
}

float t2m1(float v) {
  return v * 2.0 - 1.0;
}

float t5p5(float v) {
  return v * 0.5 + 0.5;
}

float inv(float v) {
  return 1.0 - v;
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

vec3 getCirclePoint(float numEdgePointsPerCircle, float id, float inner, float start, float end) {
  float outId = id - floor(id / 3.0) * 2.0 - 1.0;
  float ux = floor(id / 6.0) + mod(id, 2.0);
  float vy = mod(floor(id / 2.0) + floor(id / 3.0), 2.0);
  float u = ux / numEdgePointsPerCircle;
  float v = mix(inner, 1.0, vy);
  float a = mix(start, end, u) * PI * 2.0 + PI * 0.0;
  float s = sin(a);
  float c = cos(a + 2.0 * KP1);
  float x = c * v;
  float y = s * v;
  float z = 0.0;
  return vec3(x, y, z);  
}

#define NUM_EDGE_POINTS_PER_CIRCLE 4.0
#define NUM_POINTS_PER_CIRCLE (NUM_EDGE_POINTS_PER_CIRCLE * 6.0)
#define NUM_CIRCLES_PER_GROUP 1.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    vec2 mouse = u_mouse;
    
    const float vertexCount = VERTEX_COUNT;
    float numCircles = floor(vertexCount / NUM_POINTS_PER_CIRCLE);
    float numGroups = floor(numCircles / NUM_CIRCLES_PER_GROUP);
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = (uv * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
    
    vec3 col = vec3(0.0);
    float found = 0.0;
    
    // Оптимизация: проверяем только ближайшие вершины
    // Для каждой вершины вычисляем позицию и рисуем точку
    for (float vertexId = 0.0; vertexId < VERTEX_COUNT; vertexId += 1.0) {
        if (found > 0.5) break;
        float circleId = floor(vertexId / NUM_POINTS_PER_CIRCLE);
        float groupId = floor(circleId / NUM_CIRCLES_PER_GROUP);
        float pointId = mod(vertexId, NUM_POINTS_PER_CIRCLE);
        float sliceId = mod(floor(vertexId / 6.0), 2.0);
        float side = mix(-1.0, 1.0, step(0.5, mod(circleId, 2.0)));
        
        float cu = circleId / numCircles;
        float gv = groupId / numGroups / KP2;
        float cgId = mod(circleId, NUM_CIRCLES_PER_GROUP);
        float cgv = cgId / NUM_CIRCLES_PER_GROUP;
        float ncgv = sin(0.0 - cgv) / cu;
        
        float aspect = resolution.x / resolution.y;
        float gAcross = floor(sqrt(numCircles) * aspect);
        float gDown = floor(numGroups / gAcross);
        float gx = mod(groupId, gAcross);
        float gy = floor(groupId / gAcross);
        vec3 offset = vec3(
            gx - (gAcross - 1.0) / 2.0,
            gy - (gDown - 1.0) / 2.0,
            0.0) * cos(0.17 + KP1);
        
        float gs = gx / gAcross - KP2;
        float gt = gy / gDown;
        
        float tm = time - cgv * (0.2 * KP3);
        float su = hash(groupId);
        float s = getAudioValue(vec2(mix(0.1, 0.5, gs) / KP1, 0.2));
        float s2 = getAudioValue(vec2(mix(0.01, 0.5, gs), gt * (0.05 + KP3)));
        
        float inner = 0.0 + KP2;
        float start = 0.0;
        float end = 1.0 / sin(KP0 - 2.0);
        vec3 pos = getCirclePoint(NUM_EDGE_POINTS_PER_CIRCLE, pointId, inner, start, end);
        pos.z = cgv;
        
        vec3 eye = vec3(0.0, 1.0 / KP1, 1.0);
        vec3 target = vec3(0.0, 0.0, 0.0);
        vec3 up = vec3(0.0, 1.0, 0.0);
        
        mat4 mat = scale(vec3(1.0, aspect, 1.0) * 0.2);
        mat *= cameraLookAt(eye, target, up);
        mat *= rotZ(time * KP3 * mix(-1.0, 2.0, mod(circleId, 2.0)) + gy * 0.00 * sin(time * 0.1));
        mat *= trans(offset);
        float h = t2m1(hash(gv));
        mat *= rotZ(time * sign(h) + h + pow(s2 + 0.2, 5.0) * KP3 * 10.0 * sign(h));
        mat *= scale(vec3(0.8 / KP0, 0.9, 1.0));
        mat *= rotZ(PI * 0.25);
        
        vec4 clipPos = mat * vec4(pos, 1.0);
        vec2 ndc = clipPos.xy / clipPos.w;
        
        float dist = length(p - ndc);
        float pointSize = 4.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            float hue = 1.0 + cgId * 0.4;
            float sat = 1.0 - step(pow(s, 3.0), abs(gt * 2.0 - 1.0) * 0.33);
            float val = 0.9;
            vec3 vertexColor = hsv2rgb(vec3(hue * mouse.x, sat, val));
            vertexColor *= (1.0 - h);
            col = mix(col, vertexColor, alpha);
            found = 1.0;
        }
    }
    
    if (length(col) < 0.01) {
        col = vec3(0.05, 0.05, 0.1);
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-63": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.141594
#define NUM_ROT 32.0
#define NUM_LEVELS 20.0

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает 3D поверхность через computeVert и computeNorm

vec3 computeVert(float angle, float H, float time) {
  float STEP = time * 0.7;
  float R = (cos(H * 2.6 + STEP * 1.5 + sin(STEP * 4.3 + H * 3.0) * (cos(STEP * 0.6) + 0.6)) * 0.2 + 0.9) * (cos(STEP * 0.5 + H * 1.4) * 0.3 + 0.9);
  R *= sin((H + 4.0) * 0.375);
  
  float Q = cos(STEP * 0.54 + H * 0.7);
  float dX = cos(H * 1.4) * Q * 1.5;
  float dY = sin(H * 0.75) * Q * 0.4;
  float dZ = sin(H * 0.5) * Q * 0.5;
  return vec3(cos(angle) * R, H, sin(angle) * R) + vec3(dX, dY, dZ);
}

vec3 computeNorm(float angle, float H, float time) {
  float dA = 0.01;
  float dH = 0.01;
  vec3 A = computeVert(angle, H, time);
  vec3 B = computeVert(angle + dA, H, time);
  vec3 C = computeVert(angle, H + dH, time);
  return normalize(-cross((B - A) / dA, (C - A) / dH));
}

// Проверка попадания точки в треугольник
float pointInTriangle(vec2 p, vec2 a, vec2 b, vec2 c) {
    vec2 v0 = c - a;
    vec2 v1 = b - a;
    vec2 v2 = p - a;
    float dot00 = dot(v0, v0);
    float dot01 = dot(v0, v1);
    float dot02 = dot(v0, v2);
    float dot11 = dot(v1, v1);
    float dot12 = dot(v1, v2);
    float invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
    float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    float v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return step(0.0, u) * step(0.0, v) * step(u + v, 1.0);
}

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float STEP = time * 0.7;
    
    vec2 aspect = vec2(1.0, resolution.x / resolution.y);
    
    float dH = 0.05;
    float dA = 2.0 * PI / NUM_ROT;
    
    vec3 col = vec3(0.05, 0.05, 0.1);
    float found = 0.0;
    
    // Оптимизация: проверяем только ближайшие треугольники
    // Проходим по всем треугольникам и проверяем попадание
    for (float level = 0.0; level < NUM_LEVELS; level += 1.0) {
        if (found > 0.5) break;
        float H = level * dH - 4.0;
        for (float rot = 0.0; rot < NUM_ROT; rot += 1.0) {
            if (found > 0.5) break;
            float angle = rot * dA;
            
            // Вычисляем вершины треугольника
            vec3 v0 = computeVert(angle, H, time);
            vec3 v1 = computeVert(angle + dA, H, time);
            vec3 v2 = computeVert(angle + dA, H + dH, time);
            vec3 v3 = computeVert(angle, H + dH, time);
            
            // Проекция вершин (как в оригинале)
            v0 *= 0.3;
            v1 *= 0.3;
            v2 *= 0.3;
            v3 *= 0.3;
            
            vec2 p0 = v0.xy * aspect / (3.0 + v0.z);
            vec2 p1 = v1.xy * aspect / (3.0 + v1.z);
            vec2 p2 = v2.xy * aspect / (3.0 + v2.z);
            vec2 p3 = v3.xy * aspect / (3.0 + v3.z);
            
            // Быстрая проверка: если пиксель далеко от квада, пропускаем
            vec2 quadCenter = (p0 + p1 + p2 + p3) * 0.25;
            float quadDist = length(uv - quadCenter);
            if (quadDist > 0.5) continue;
            
            // Проверяем два треугольника квада
            float inTri1 = pointInTriangle(uv, p0, p1, p2);
            float inTri2 = pointInTriangle(uv, p2, p3, p0);
            
            if (inTri1 > 0.5 || inTri2 > 0.5) {
                // Вычисляем нормаль для ближайшей вершины
                vec3 N = computeNorm(angle, H, time);
                if (inTri2 > 0.5) {
                    N = computeNorm(angle, H + dH, time);
                }
                
                // Освещение
                float Cs = cos(STEP);
                float Si = sin(STEP);
                mat3 rot2 = mat3(
                    vec3(0.0, 1.0, 0.0),
                    vec3(Cs, 0.0, Si),
                    vec3(-Si, 0.0, Cs)
                );
                
                vec3 light = normalize(vec3(1.0, 1.0, -1.0));
                vec3 V = vec3(0.0, 0.0, 1.0);
                float A = 0.8 + cos(v0.y * 0.6 + STEP);
                float D = 0.6 * clamp(dot(N, light), 0.0, 1.0);
                float S = 1.6 * pow(clamp(dot(light, reflect(V, N)), 0.0, 1.0), 5.0);
                
                vec3 A_col = vec3(1.0, 1.0, 1.0) * (N * rot2);
                vec3 D_col = vec3(1.0, 1.0, 1.0) * N;
                vec3 S_col = vec3(1.0, 1.0, 1.0);
                vec3 LUM = A * A_col + D * D_col + S * S_col;
                
                col = LUM;
                found = 1.0;
            }
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-64": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал использует fibonacciSphere для генерации точек на сфере

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

mat4 rotX(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      1.0, 0.0, 0.0, 0.0,
      0.0, c, s, 0.0,
      0.0, -s, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rotY(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rotZ(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, -s, 0.0, 0.0, 
      s, c, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0); 
}

mat4 trans(vec3 trans) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    trans.x, trans.y, trans.z, 1.0);
}

mat4 ident() {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 scale(vec3 s) {
  return mat4(
    s[0], 0.0, 0.0, 0.0,
    0.0, s[1], 0.0, 0.0,
    0.0, 0.0, s[2], 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 uniformScale(float s) {
  return mat4(
    s, 0.0, 0.0, 0.0,
    0.0, s, 0.0, 0.0,
    0.0, 0.0, s, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 persp(float fov, float aspect, float zNear, float zFar) {
  float f = tan(PI * 0.5 - 0.5 * fov);
  float rangeInv = 1.0 / (zNear - zFar);
  return mat4(
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (zNear + zFar) * rangeInv, -1.0,
    0.0, 0.0, zNear * zFar * rangeInv * 2.0, 0.0);
}

mat4 trInv(mat4 m) {
  mat3 i = mat3(
    m[0][0], m[1][0], m[2][0], 
    m[0][1], m[1][1], m[2][1], 
    m[0][2], m[1][2], m[2][2]);
  vec3 t = -i * m[3].xyz;
  return mat4(
    i[0], t[0], 
    i[1], t[1],
    i[2], t[2],
    0.0, 0.0, 0.0, 1.0);
}

mat4 transpose(mat4 m) {
  return mat4(
    m[0][0], m[1][0], m[2][0], m[3][0], 
    m[0][1], m[1][1], m[2][1], m[3][1],
    m[0][2], m[1][2], m[2][2], m[3][2],
    m[0][3], m[1][3], m[2][3], m[3][3]);
}

mat4 lookAt(vec3 eye, vec3 target, vec3 up) {
  vec3 zAxis = normalize(eye - target);
  vec3 xAxis = normalize(cross(up, zAxis));
  vec3 yAxis = cross(zAxis, xAxis);
  return mat4(
    xAxis.x, yAxis.x, zAxis.x, 0.0,
    xAxis.y, yAxis.y, zAxis.y, 0.0,
    xAxis.z, yAxis.z, zAxis.z, 0.0,
    eye.x, eye.y, eye.z, 1.0);
}

mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

mat4 cameraLookAt(vec3 eye, vec3 target, vec3 up) {
  return inverse(lookAt(eye, target, up));
}

float hash(float p) {
    vec2 p2 = fract(vec2(p * 5.3983, p * 5.4427));
    p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
    return fract(p2.x * p2.y * 95.4337);
}

float t2m1(float v) {
  return v * 2.0 - 1.0;
}

float t5p5(float v) {
  return v * 0.5 + 0.5;
}

float inv(float v) {
  return 1.0 - v;
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

vec3 fibonacciSphere(float samples, float i) {
  float rnd = 1.0;
  float offset = 2.0 / samples;
  float increment = PI * (3.0 - sqrt(5.0));
  
  float y = ((i * offset) - 1.0) + (offset / 2.0);
  float r = sqrt(1.0 - pow(y, 2.0));
  
  float phi = mod(i + rnd, samples) * increment;
  
  float x = cos(phi) * r;
  float z = sin(phi) * r;
  
  return vec3(x, y, z);
}

#define MAX_POINTS 500.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float maxPoints = MAX_POINTS;
    float numPoints = maxPoints;
    
    float tm = time * 0.0;
    float r = 30.0;
    mat4 mat = persp(PI * 100.0 / 180.0, resolution.x / resolution.y, 1.0, 200.0);
    vec3 eye = vec3(cos(tm) * r, sin(tm) * r * 0.0 + r, sin(tm) * r);
    vec3 target = vec3(0.0);
    vec3 up = vec3(0.0, 1.0, 0.0);
    
    mat *= cameraLookAt(eye, target, up);
    mat *= rotX(time * 0.37);
    mat *= rotY(time * 0.21);
    
    vec3 col = vec3(0.05, 0.05, 0.1);
    float found = 0.0;
    
    // Проходим по всем точкам и рисуем их
    for (float pointId = 0.0; pointId < MAX_POINTS; pointId += 1.0) {
        if (pointId > numPoints || found > 0.5) break;
        
        vec3 loc = fibonacciSphere(numPoints, pointId);
        
        float cv = pointId / numPoints;
        float su = fract(cv + -time);
        float s = getAudioValue(vec2(mix(0.1, 0.5, su), 0.0));
        
        if (s < 0.2) continue;
        
        float sc = mix(1.8, 20.0, pow(1.0 - cv, 10.0));
        
        vec4 clipPos = mat * vec4(loc * 45.0 * s, 1.0);
        vec2 ndc = clipPos.xy / clipPos.w;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - ndc);
        if (quickDist > 0.1) continue;
        
        float dist = quickDist;
        float pointSize = 1.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            float hue = 0.4 + floor(pow(s, 5.0) * 20.0) * 0.33 + time * 0.1;
            float sat = 0.1 + pow(s + 0.5, 5.0);
            float val = 1.0;
            vec3 pointColor = hsv2rgb(vec3(hue, sat, val));
            float pointAlpha = 1.0 + s;
            pointColor *= pointAlpha;
            
            col = mix(col, pointColor, alpha * pointAlpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-65": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал: chrillo - аудио-реактивные точки

float hash(float n) {
    return fract(sin(n) * 753.5453123);
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

#define MAX_VERTICES 300.0

void main() {
    float time = u_time;
    vec2 mouse = u_mouse;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    vec3 col = vec3(0.05, 0.05, 0.1);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        float i = hash(vertexId);
        float f = hash(i);
        float snd = getAudioValue(vec2(f, i)) * cos(i);
        snd = pow(snd, 2.0);
        
        float ang = vertexId / 1000.0;
        float perspective = 0.5 * (1.0 - mouse.y);
        float t = time * (f + 0.5) - mouse.x;
        float x = i * sin(ang + t) * 0.8;
        float y = i * cos(ang + t);
        y += 0.1 * snd * (1.0 - y);
        y *= perspective;
        
        float vis = snd / (y + 1.0);
        
        // Проекция точки на экран
        vec2 pointPos = vec2(x, y);
        
        float dist = length(uv - pointPos);
        float pointSize = 5.0 * vis / resolution.y;
        
        if (dist < pointSize * 2.0 && vis > 0.01) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            vec4 pointColor = vec4(
                snd * 0.7 * (2.0 - f),
                snd * 0.8 * cos(f * PI),
                snd * 2.0,
                vis
            );
            
            col = mix(col, pointColor.rgb, alpha * pointColor.a);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-66": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define K 1.0594630943592952645618

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает спектрограмму с hueRamp

vec4 hueRamp(vec4 col) {
    vec4 blu = vec4(0.1, 0.05, 0.1, 1.0);
    vec4 red = vec4(0.5, 0.1, 0.1, 1.0);
    vec4 result = mix(blu, red, col.a * 60.0 - 0.1);
    return result;
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

#define W 40.0
#define H 25.0
#define MAX_VERTICES 1000.0  // W * H = 40 * 25 = 1000

void main() {
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам сетки
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        if (found > 0.5) break;
        
        float u = mod(vertexId / W, 1.0);
        float v = floor(vertexId / W) / H;
        float uScaled = pow(2.0, u * 0.17) - 1.0;
        float vScaled = pow(abs(v - 0.5) * 1.0, 1.3);
        
        float audioValue = pow(getAudioValue(vec2(uScaled, vScaled)), 8.0);
        
        if (audioValue < 0.01) continue;
        
        vec4 colorValue = vec4(audioValue);
        vec4 pointColor = hueRamp(colorValue);
        
        float x = v * -2.0 + 1.0;
        float y = u * 2.0 - 0.8 + 0.5 * pow(x, 2.0);
        
        vec2 pointPos = vec2(x, y);
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - pointPos);
        if (quickDist > 0.3) continue;
        
        float dist = quickDist;
        float pointSize = 12.0 / resolution.y;
        
        if (dist < pointSize) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            col = mix(col, pointColor.rgb, alpha * pointColor.a);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-67": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159
#define NUM_SEGMENTS 3.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 5.0
#define MAX_COUNT 100.0

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает орбитальные структуры с сегментами

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    vec2 mouse = u_mouse;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float localTime = time + 20.0;
    
    vec2 aspect = vec2(1.0, resolution.x / resolution.y);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    
    // Проходим по всем вершинам
    for (float count = 0.0; count < MAX_COUNT; count += 1.0) {
        for (float vertexMod = 0.0; vertexMod < NUM_POINTS; vertexMod += 1.0) {
            float vertexId = count * NUM_POINTS + vertexMod;
            
            float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
            float snd = getAudioValue(vec2(fract(count / 128.0), fract(count / 20000.0)));
            float offset = count * 0.02;
            float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
            float radius = 0.2 * pow(snd, 4.0);
            float c = cos(angle + localTime) * radius;
            float s = sin(angle + localTime) * radius;
            float orbitAngle = count * 1.1;
            float innerRadius = count * 0.003;
            float oC = cos(orbitAngle + localTime * 0.4 + count * 0.1) * innerRadius;
            float oS = sin(orbitAngle + localTime + count * 0.1) * innerRadius;
            
            vec2 xy = vec2(
                oC + c,
                oS + s
            );
            vec2 pointPos = xy * aspect + mouse * 0.1;
            
            float dist = length(uv - pointPos);
            float pointSize = 2.0 / resolution.y;
            
            if (dist < pointSize * 2.0) {
                float alpha = smoothstep(pointSize, 0.0, dist);
                float hue = (localTime * 0.01 + count * 1.001);
                vec3 pointColor = hsv2rgb(vec3(hue, 1.0, 1.0));
                col = mix(col, pointColor, alpha);
            }
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-68": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define NUM_SEGMENTS 64.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 1.0
#define NUM_LINES_DOWN 32.0

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает линии с сегментами и аудио-реактивными эффектами

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

// Проверка попадания точки на линию
float pointOnLine(vec2 p, vec2 a, vec2 b, float lineWidth) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    vec2 closest = a + ba * h;
    float dist = length(p - closest);
    return smoothstep(lineWidth, 0.0, dist);
}

void main() {
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем линиям
    for (float count = 0.0; count < NUM_LINES_DOWN; count += 1.0) {
        if (found > 0.5) break;
        vec2 prevPoint = vec2(0.0);
        float firstPoint = 1.0;
        
        // Проходим по всем точкам в линии
        for (float point = 0.0; point < NUM_SEGMENTS; point += 1.0) {
            float u = point / NUM_SEGMENTS;
            float v = count / NUM_LINES_DOWN;
            float invV = 1.0 - v;
            
            // Only use the left most 1/4th of the sound texture
            float historyX = u * 0.25;
            // Match each line to a specific row in the sound texture
            float historyV = (v * NUM_LINES_DOWN + 0.5) / NUM_LINES_DOWN;
            float snd = getAudioValue(vec2(historyX, historyV));
            
            float x = u * 2.0 - 1.0;
            float y = v * 2.0 - 1.0;
            vec2 xy = vec2(
                x * mix(0.5, 1.0, invV),
                y + pow(snd, 5.0) * 1.0
            ) / (v + 0.5);
            vec2 pointPos = xy * 0.5;
            
            // Рисуем линию от предыдущей точки до текущей
            if (firstPoint < 0.5) {
                // Быстрая проверка расстояния до линии
                vec2 lineCenter = (prevPoint + pointPos) * 0.5;
                float quickDist = length(uv - lineCenter);
                if (quickDist < 0.2) {
                    float lineWidth = 0.01;
                    float lineAlpha = pointOnLine(uv, prevPoint, pointPos, lineWidth);
                    
                    if (lineAlpha > 0.01) {
                        float hue = u;
                        float sat = invV;
                        float val = invV;
                        vec3 lineColor = hsv2rgb(vec3(hue, sat, val));
                        col = mix(col, lineColor, lineAlpha);
                        found = 1.0;
                    }
                }
            }
            
            prevPoint = pointPos;
            firstPoint = 0.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-69": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.141

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает аудио-реактивные частицы

float dis(float n) {
    return fract(sin(n) * 1.50);
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

#define MAX_VERTICES 300.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        if (found > 0.5) break;
        
        float Id = dis(vertexId);
        float fr = dis(Id);
        float tex = getAudioValue(vec2(fr, Id)) * cos(Id);
        
        tex = pow(tex, 2.0);
        
        float pang = vertexId;
        float view = 0.5 * 1.2;
        float t = (time * (fr + 0.1)) * 10.0;
        float x = Id * sin(pang + t);
        float y = Id * cos(pang + t);
        
        y += 0.25 * tex * (1.0 - y);
        y *= 0.78;
        
        float sizeAfter = tex / (y + 1.0);
        
        if (sizeAfter < 0.01) continue;
        
        vec2 pointPos = vec2(x, y);
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - pointPos);
        if (quickDist > 0.3) continue;
        
        float dist = quickDist;
        float pointSize = 6.0 * sizeAfter / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            vec4 pointColor = vec4(
                tex * 0.1 * (3.0 - fr),
                tex * 0.9 * cos(fr * PI),
                tex * 9.0,
                sizeAfter
            );
            
            col = mix(col, pointColor.rgb, alpha * pointColor.a);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-70": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает круги с точками и аудио-реактивными эффектами

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float hash(float p) {
    vec2 p2 = fract(vec2(p * 5.3983, p * 5.4427));
    p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
    return fract(p2.x * p2.y * 95.4337);
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

#define POINTS_AROUND_CIRCLE 240.0
#define POINTS_PER_CIRCLE 480.0  // POINTS_AROUND_CIRCLE * 2.0 = 240 * 2 = 480
#define NUM_CIRCLES 50.0
#define MAX_VERTICES 24000.0  // NUM_CIRCLES * POINTS_PER_CIRCLE = 50 * 480 = 24000

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float pointsAroundCircle = POINTS_AROUND_CIRCLE;
    float pointsPerCircle = POINTS_PER_CIRCLE;
    float numCircles = NUM_CIRCLES;
    
    vec2 aspect = vec2(1.0, resolution.x / resolution.y);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        float circleId = floor(vertexId / pointsPerCircle);
        float vId = mod(vertexId, pointsPerCircle);
        float pointId = floor(vId / 2.0) + mod(vId, 2.0);
        float pointV = pointId / (pointsAroundCircle - 1.0);
        
        float circleV = circleId / (numCircles - 1.0);
        float odd = mod(circleId, 2.0);
        float quad = mod(floor(circleId / 2.0), 2.0);
        
        float tm = time * 4.0 - circleV;
        float angle = mix(-PI, PI, pointV) + sin(tm + pointV * PI * 8.0) * 0.5;
        float c = cos(angle);
        float s = sin(angle);
        
        float off = mix(0.0, 0.953, circleV);
        
        float su = hash(pointV * 13.7);
        float snd = getAudioValue(vec2(mix(0.001, 0.115, su), circleV * 0.5));
        
        float q = (odd + quad * 2.0) / 3.0;
        float sq = getAudioValue(vec2(mix(0.001, 0.115, 0.0), 0.0));
        
        vec2 xy = vec2(c, s) * mix(1.0, 1.0 + off, pow(snd, 17.0) / sq);
        float scale = mix(
            mix(
                mix(0.04, 0.25, circleV),
                mix(-0.4, snd / 0.7, circleV),
                odd),
            mix(
                mix(0.1, -0.15 + snd, circleV),
                mix(-0.1, -0.05, circleV),
                odd),
            quad) + pow(sq, 2.0) * 0.3;
        
        vec2 pointPos = xy * aspect * scale;
        
        float dist = length(uv - pointPos);
        float pointSize = 2.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            float hue = 0.5 + odd * 0.25 + quad * 0.125;
            float pointAlpha = 1.0 - circleV;
            vec3 pointColor = hsv2rgb(vec3(hue, 1.0, 1.0));
            pointColor *= pointAlpha;
            col = mix(col, pointColor, alpha * pointAlpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-71": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает 3D геометрию с аудио-реактивными эффектами

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

mat4 rotX(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      1.0, 0.0, 0.0, 0.0,
      0.0, c, s, 0.0,
      0.0, -s, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rotY(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rotZ(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, -s, 0.0, 0.0, 
      s, c, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0); 
}

mat4 trans(vec3 trans) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    trans.x, trans.y, trans.z, 1.0);
}

mat4 ident() {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 scale(vec3 s) {
  return mat4(
    s[0], 0.0, 0.0, 0.0,
    0.0, s[1], 0.0, 0.0,
    0.0, 0.0, s[2], 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 uniformScale(float s) {
  return mat4(
    s, 0.0, 0.0, 0.0,
    0.0, s, 0.0, 0.0,
    0.0, 0.0, s, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 persp(float fov, float aspect, float zNear, float zFar) {
  float f = tan(PI * 0.5 - 0.5 * fov);
  float rangeInv = 1.0 / (zNear - zFar);
  return mat4(
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (zNear + zFar) * rangeInv, -1.0,
    0.0, 0.0, zNear * zFar * rangeInv * 2.0, 0.0);
}

mat4 trInv(mat4 m) {
  mat3 i = mat3(
    m[0][0], m[1][0], m[2][0], 
    m[0][1], m[1][1], m[2][1], 
    m[0][2], m[1][2], m[2][2]);
  vec3 t = -i * m[3].xyz;
  return mat4(
    i[0], t[0], 
    i[1], t[1],
    i[2], t[2],
    0.0, 0.0, 0.0, 1.0);
}

mat4 transpose(mat4 m) {
  return mat4(
    m[0][0], m[1][0], m[2][0], m[3][0], 
    m[0][1], m[1][1], m[2][1], m[3][1],
    m[0][2], m[1][2], m[2][2], m[3][2],
    m[0][3], m[1][3], m[2][3], m[3][3]);
}

mat4 lookAt(vec3 eye, vec3 target, vec3 up) {
  vec3 zAxis = normalize(eye - target);
  vec3 xAxis = normalize(cross(up, zAxis));
  vec3 yAxis = cross(zAxis, xAxis);
  return mat4(
    xAxis.x, yAxis.x, zAxis.x, 0.0,
    xAxis.y, yAxis.y, zAxis.y, 0.0,
    xAxis.z, yAxis.z, zAxis.z, 0.0,
    eye.x, eye.y, eye.z, 1.0);
}

mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

mat4 cameraLookAt(vec3 eye, vec3 target, vec3 up) {
  return inverse(lookAt(eye, target, up));
}

float hash(float p) {
    vec2 p2 = fract(vec2(p * 5.3983, p * 5.4427));
    p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
    return fract(p2.x * p2.y * 95.4337);
}

float t2m1(float v) {
  return v * 2.0 - 1.0;
}

float t5p5(float v) {
  return v * 0.5 + 0.5;
}

float inv(float v) {
  return 1.0 - v;
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

#define UNITS 40.0
#define PER_SET 240.0  // UNITS * 6.0 = 40 * 6 = 240
#define NUM_GROUPS 4.0
#define NUM_SETS 5.0
#define MAX_VERTICES 4800.0  // NUM_GROUPS * NUM_SETS * PER_SET = 4 * 5 * 240 = 4800

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float units = UNITS;
    float perSet = PER_SET;
    float numGroups = NUM_GROUPS;
    float numSets = NUM_SETS;
    float perGroup = perSet * numSets;
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        if (found > 0.5) break;
        
        float id = mod(vertexId, perSet);
        float setId = floor(mod(vertexId, perGroup) / perSet);
        
        float vId = mod(vertexId, perSet);
        float ux = floor(vId / 6.0) + mod(vId, 2.0);
        float vy = mod(floor(vId / 2.0) + floor(vId / 3.0), 2.0);
        
        float gId = floor(vertexId / perGroup);
        float gu = gId / numGroups;
        
        float u = ux / units;
        
        float sv = setId / (numSets - 1.0);
        
        float s0 = getAudioValue(vec2(mix(0.05, 0.2, abs(u * 2.0 - 1.0)), sv * 0.1 + gu * 0.02));
        float s1 = getAudioValue(vec2(0.05, gu * 0.1));
        
        float tm = time * 0.25;
        mat4 mat = persp(PI * 60.0 / 180.0, resolution.x / resolution.y, 0.1, 1000.0);
        vec3 eye = vec3(0.0, 0.0, mix(7.0, 5.0, pow(s1 + 0.1, 5.0)));
        vec3 target = vec3(0.0, 0.0, 0.0);
        vec3 up = vec3(0.0, 1.0, 0.0);
        
        vec3 pos = vec3(0.0, vy + pow(s0 + 0.2, 5.0) * 3.0, 0.0);
        mat *= cameraLookAt(eye, target, up);
        mat *= rotZ(u * PI * 2.0);
        float off = abs(mix(1.0, -1.0, fract(u * 2.0)));
        mat *= trans(vec3(0.0, mix(1.0, 0.5, off) * (1.0 - vy), 0.0));
        
        vec4 clipPos = mat * vec4(pos, 1.0);
        vec2 ndc = clipPos.xy / clipPos.w;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - ndc);
        if (quickDist > 0.2) continue;
        
        float dist = quickDist;
        float pointSize = 1.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            float top = step(0.0, clipPos.y);
            
            float hue = u * 0.1 + mix(0.85, 0.5, top);
            float sat = 0.4;
            float val = mix(0.5, 0.0, top);
            vec3 color = hsv2rgb(vec3(hue, sat, val));
            float pointAlpha = 1.0 - gu;
            color *= pointAlpha;
            
            col = mix(col, color, alpha * pointAlpha);
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-72": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал: Created by Stephane Cuillerdier - Aiekick/2017
// Создает тор (torus) с полигонами

mat4 persp(float fov, float aspect, float zNear, float zFar) {
  float f = tan(PI * 0.5 - 0.5 * fov);
  float rangeInv = 1.0 / (zNear - zFar);
  return mat4(
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (zNear + zFar) * rangeInv, -1.0,
    0.0, 0.0, zNear * zFar * rangeInv * 2.0, 0.0);
}

mat4 lookAt(vec3 eye, vec3 target, vec3 up) {
  vec3 zAxis = normalize(eye - target);
  vec3 xAxis = normalize(cross(up, zAxis));
  vec3 yAxis = cross(zAxis, xAxis);
  return mat4(
    xAxis.x, yAxis.x, zAxis.x, 0.0,
    xAxis.y, yAxis.y, zAxis.y, 0.0,
    xAxis.z, yAxis.z, zAxis.z, 0.0,
    eye.x, eye.y, eye.z, 1.0);
}

mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

mat4 cameraLookAt(vec3 eye, vec3 target, vec3 up) {
  return inverse(lookAt(eye, target, up));
}

// Проверка попадания точки в треугольник
float pointInTriangle(vec2 p, vec2 a, vec2 b, vec2 c) {
    vec2 v0 = c - a;
    vec2 v1 = b - a;
    vec2 v2 = p - a;
    float dot00 = dot(v0, v0);
    float dot01 = dot(v0, v1);
    float dot02 = dot(v0, v2);
    float dot11 = dot(v1, v1);
    float dot12 = dot(v1, v2);
    float invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
    float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    float v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return step(0.0, u) * step(0.0, v) * step(u + v, 1.0);
}

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    vec2 mouse = u_mouse;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float pi = PI;
    float pi2 = PI * 2.0;
    
    // vars
    float quadsPerPolygon = clamp(floor(10.0 * (mouse.x * 0.5 + 0.5)), 3.0, 10.0);
    float countPolygon = clamp(floor(200.0 * (mouse.y * 0.5 + 0.5)), 3.0, 200.0);
    float radius = 20.0;
    float thickNess = 5.0;
    float zoom = 2.0;
    
    float countMax = 6.0 * quadsPerPolygon * countPolygon;
    
    // Камера
    float ca = 0.5;
    float cd = 100.0;
    vec3 eye = vec3(sin(ca), 0.0, cos(ca)) * cd;
    vec3 target = vec3(0.0, 0.0, 0.0);
    vec3 up = vec3(0.0, 1.0, 0.0);
    mat4 camera = persp(45.0 * PI / 180.0, resolution.x / resolution.y, 0.1, 10000.0) * 
                  cameraLookAt(eye, target, up);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Оптимизация: ограничиваем количество вершин (используем константу для GLSL ES)
    const float optimizedCountMax = 2000.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < optimizedCountMax; vertexId += 1.0) {
        if (found > 0.5) break;
        
        float index = mod(vertexId, 6.0);
        
        float indexQuad = floor(vertexId / 6.0);
        float asp = pi * 2.0 / quadsPerPolygon;
        float ap0 = asp * indexQuad;
        float ap1 = asp * (indexQuad + 1.0);
        
        float indexPolygon = floor(indexQuad / quadsPerPolygon);
        float ast = pi * 2.0 / countPolygon;
        float at0 = ast * indexPolygon;
        float at1 = ast * (indexPolygon + 1.0);
        
        vec2 st = vec2(0.0);
        
        // triangle 1
        if (index == 0.0) st = vec2(ap0, at0);
        if (index == 1.0) st = vec2(ap1, at0);
        if (index == 2.0) st = vec2(ap1, at1);
        
        // triangle 2
        if (index == 3.0) st = vec2(ap0, at0);
        if (index == 4.0) st = vec2(ap1, at1);
        if (index == 5.0) st = vec2(ap0, at1);
        
        vec3 p = vec3(cos(st.x), st.y, sin(st.x));
        
        // twist
        float ap = st.y - cos(st.y) + time;
        
        // polygon
        p.xz *= thickNess;
        p.xz *= mat2(cos(ap), sin(ap), -sin(ap), cos(ap));
        
        // torus
        p.x += radius;
        float at = p.y;
        p.y = 0.0;
        p.xy *= mat2(cos(at), sin(at), -sin(at), cos(at));
        
        // Проекция
        vec4 clipPos = camera * vec4(p, 1.0);
        vec2 ndc = clipPos.xy / clipPos.w;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - ndc);
        if (quickDist > 0.3) continue;
        
        float dist = quickDist;
        float pointSize = 3.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            float indexQuadMod = mod(indexQuad, quadsPerPolygon);
            vec4 faceColor = cos(vec4(10.0, 20.0, 30.0, 1.0) + indexQuadMod);
            faceColor = mix(faceColor, vec4(normalize(p) * 0.5 + 0.5, 1.0), 0.5);
            faceColor.a = 1.0;
            
            col = mix(col, faceColor.rgb, alpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-73": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает точки на сфере с вращением

mat4 persp(float fov, float aspect, float zNear, float zFar) {
  float f = tan(PI * 0.5 - 0.5 * fov);
  float rangeInv = 1.0 / (zNear - zFar);
  return mat4(
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (zNear + zFar) * rangeInv, -1.0,
    0.0, 0.0, zNear * zFar * rangeInv * 2.0, 0.0);
}

mat4 rotY(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

mat4 rot(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(
        oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
        0.0,                                0.0,                                0.0,                                1.0);
}

vec3 SampleSpherePos(float idx, float num) {
  idx += 0.5;
  float phi = 10.166407384630519631619018026484 * idx;
  float th_cs = 1.0 - 2.0 * idx / num;
  float th_sn = sqrt(clamp(1.0 - th_cs * th_cs, 0.0, 1.0));
  return vec3(cos(phi) * th_sn, sin(phi) * th_sn, th_cs);
}

#define VERTEX_COUNT 300.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float vertexCount = VERTEX_COUNT;
    
    mat4 mr = rot(vec3(0.019, 0.2, atan(time * 10.0) + 0.3), time);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < VERTEX_COUNT; vertexId += 1.0) {
        if (found > 0.5) break;
        
        vec3 spherePos = SampleSpherePos(vertexId, vertexCount);
        vec4 vertPos = mr * rotY(time * 0.1) * vec4(spherePos, 1.0) + rotY(mod(time * 0.05, -1.0)) * 1.0 * vec4(0.0, 0.0, -3.0, 0.0);
        
        vec4 clipPos = persp(PI * 0.25, resolution.x / resolution.y, 0.1, 100.0) * vertPos;
        vec2 ndc = clipPos.xy / clipPos.w;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - ndc);
        if (quickDist > 0.2) continue;
        
        float dist = quickDist;
        float pointSize = 7.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            vec4 pointColor = vec4(clipPos.z, vertexId / vertexCount, 0.0, 1.0);
            col = mix(col, pointColor.rgb, alpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-74": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает круги с точками и аудио-реактивными эффектами

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float hash(float p) {
    vec2 p2 = fract(vec2(p * 5.3983, p * 5.4427));
    p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
    return fract(p2.x * p2.y * 95.4337);
}

// Процедурная генерация вместо texture2D(sound, ...)
float getAudioValue(vec2 uv) {
    float t = u_time * 0.5;
    float freq = uv.x * 10.0;
    float amp = sin(freq + t) * 0.5 + 0.5;
    amp += sin(freq * 1.5 + t * 1.3) * 0.3;
    amp += sin(freq * 2.0 + t * 0.7) * 0.2;
    return pow(amp, 2.0);
}

#define POINTS_AROUND_CIRCLE 240.0
#define POINTS_PER_CIRCLE 480.0  // POINTS_AROUND_CIRCLE * 2.0 = 240 * 2 = 480
#define NUM_CIRCLES 50.0
#define MAX_VERTICES 24000.0  // NUM_CIRCLES * POINTS_PER_CIRCLE = 50 * 480 = 24000

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float pointsAroundCircle = POINTS_AROUND_CIRCLE;
    float pointsPerCircle = POINTS_PER_CIRCLE;
    float numCircles = NUM_CIRCLES;
    
    vec2 aspect = vec2(1.0, resolution.x / resolution.y);
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        if (found > 0.5) break;
        
        float circleId = floor(vertexId / pointsPerCircle);
        float vId = mod(vertexId, pointsPerCircle);
        float pointId = floor(vId / 2.0) + mod(vId, 2.0);
        float pointV = pointId / (pointsAroundCircle - 1.0);
        
        float circleV = circleId / (numCircles - 1.0);
        float odd = mod(circleId, 2.0);
        float quad = mod(floor(circleId / 2.0), 2.0);
        
        float tm = time * 4.0 - circleV;
        float angle = mix(-PI, PI, pointV) + sin(tm + pointV * PI * 8.0) * 0.05;
        float c = cos(angle);
        float s = sin(angle);
        
        float off = mix(0.0, 0.953, circleV);
        
        float su = hash(pointV * 13.7);
        float snd = getAudioValue(vec2(mix(0.001, 0.115, su), circleV * 0.5));
        
        float q = (odd + quad * 2.0) / 3.0;
        float sq = getAudioValue(vec2(mix(0.001, 0.115, 0.0), 0.0));
        
        vec2 xy = vec2(c, s) * mix(1.0, 1.0 + off, pow(snd, 5.0));
        float scale = mix(
            mix(
                mix(0.4, 0.5, circleV),
                mix(-0.4, -0.3, circleV),
                odd),
            mix(
                mix(0.1, 0.15, circleV),
                mix(-0.1, -0.05, circleV),
                odd),
            quad) + pow(sq, 10.0) * 0.1;
        
        vec2 pointPos = xy * aspect * scale;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - pointPos);
        if (quickDist > 0.3) continue;
        
        float dist = quickDist;
        float pointSize = 2.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            float hue = 0.5 + odd * 0.5 + quad * 0.125;
            float pointAlpha = 1.0 - circleV;
            vec3 pointColor = hsv2rgb(vec3(hue, 1.0, 1.0));
            pointColor *= pointAlpha;
            
            col = mix(col, pointColor, alpha * pointAlpha);
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-75": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает 3D точки с вращением

#define MAX_VERTICES 300.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < MAX_VERTICES; vertexId += 1.0) {
        if (found > 0.5) break;
        
        vec3 p = vec3(sin(PI / 80.0 * vertexId), cos(PI / 80.0 * vertexId), 0.0);
        
        mat2 rot = mat2(
            cos(PI / 80.0 * vertexId / 40.0), sin(PI / 80.0 * vertexId / 40.0),
            -sin(PI / 80.0 * vertexId / 40.0), cos(PI / 80.0 * vertexId / 40.0)
        );
        
        p.xz = p.xz * rot;
        vec3 op = p;
        
        p.xz = p.xz * mat2(cos(time), sin(time), -sin(time), cos(time));
        p.xy = p.xy * mat2(cos(time * 0.5), sin(time * 0.5), -sin(time * 0.5), cos(time * 0.5));
        
        vec2 aspect = vec2(1.0, resolution.x / resolution.y);
        p.xy *= aspect;
        
        vec2 pointPos = p.xy / (p.z + 2.0) * 0.7;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - pointPos);
        if (quickDist > 0.3) continue;
        
        float dist = quickDist;
        float pointSize = (1.0 - p.z / (p.z + 2.0)) * 10.0 / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            vec3 pointColor = (op * 0.5 + 0.5) * max(dot(p, vec3(0.5, 1.0, -1.0)), 0.0);
            col = mix(col, pointColor, alpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
  "template-76": `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.14159265359

// Адаптация вершинного шейдера с vertexshaderart.com для фрагментного шейдера
// Оригинал создает точки, которые морфируются между кубом и сферой

mat4 persp(float fov, float aspect, float zNear, float zFar) {
  float f = tan(PI * 0.5 - 0.5 * fov);
  float rangeInv = 1.0 / (zNear - zFar);
  return mat4(
    f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (zNear + zFar) * rangeInv, -1.0,
    0.0, 0.0, zNear * zFar * rangeInv * 2.0, 0.0);
}

mat4 rotY(float angleInRadians) {
    float s = sin(angleInRadians);
    float c = cos(angleInRadians);
    return mat4( 
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0);  
}

float anim(float t) {
  float st = sin(t);
  return (sign(st) * (1.0 - pow(1.0 - abs(st), 5.0))) * 0.5 + 0.5;
}

vec3 SampleSpherePos(float idx, float num) {
  idx += 0.5;
  float phi = 10.166407384630519631619018026484 * idx;
  float th_cs = 1.0 - 2.0 * idx / num;
  float th_sn = sqrt(clamp(1.0 - th_cs * th_cs, 0.0, 1.0));
  return vec3(cos(phi) * th_sn, sin(phi) * th_sn, th_cs);
}

vec3 SampleCubePos(float idx, float num) {
  float side = floor(pow(num, 1.0 / 3.0) + 0.5);
  vec3 res;
  res.x = mod(idx, side);
  res.y = floor(mod(idx, side * side) / side);
  res.z = floor(mod(idx, side * side * side) / side / side);
  res -= vec3(side * 0.5);
  res *= 1.5 / side;
  return res;
}

#define VERTEX_COUNT 300.0

void main() {
    float time = u_time;
    vec2 resolution = u_resolution;
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
    
    float vertexCount = VERTEX_COUNT;
    
    vec3 col = vec3(0.0, 0.0, 0.0);
    float found = 0.0;
    
    // Проходим по всем вершинам
    for (float vertexId = 0.0; vertexId < VERTEX_COUNT; vertexId += 1.0) {
        if (found > 0.5) break;
        
        vec3 samplePos = mix(SampleCubePos(vertexId, vertexCount), SampleSpherePos(vertexId, vertexCount), anim(time));
        
        vec4 vertPos = rotY(time * 0.1) * vec4(samplePos, 1.0) + vec4(0.0, 0.0, -3.0, 0.0);
        
        vec4 clipPos = persp(PI * 0.25, resolution.x / resolution.y, 0.1, 100.0) * vertPos;
        vec2 ndc = clipPos.xy / clipPos.w;
        
        // Быстрая проверка расстояния
        float quickDist = length(uv - ndc);
        if (quickDist > 0.2) continue;
        
        float dist = quickDist;
        float pointSize = (sin(time * 4.0 + 20.0 * samplePos.x * samplePos.y * samplePos.z) * 4.0 + 4.0) / resolution.y;
        
        if (dist < pointSize * 2.0) {
            float alpha = smoothstep(pointSize, 0.0, dist);
            
            vec3 pointColor = vec3(
                samplePos.y * samplePos.y + 0.5,
                samplePos.x * samplePos.x + 0.5,
                samplePos.z * samplePos.z + 0.5
            );
            
            col = mix(col, pointColor, alpha);
            found = 1.0;
        }
    }
    
    gl_FragColor = vec4(col, 1.0);
}
`,
};

/**
 * Получает код фрагментного шейдера по ID фона
 */
export function getShaderCode(backgroundId) {
  if (!backgroundId) {
    console.warn("getShaderCode: backgroundId is empty");
    return null;
  }
  const code = FRAGMENT_SHADERS[backgroundId];
  if (!code) {
    console.warn(`getShaderCode: shader not found for backgroundId: ${backgroundId}`);
    return null;
  }
  return code;
}

/**
 * Компилирует шейдер
 */
function compileShader(gl, type, source) {
  // Проверяем, что WebGL контекст валиден
  if (!gl) {
    console.error("Shader compilation error: WebGL context is null");
    return null;
  }
  
  // Проверяем, что контекст не потерян
  const isContextLost = gl.isContextLost ? gl.isContextLost() : false;
  if (isContextLost) {
    console.error("Shader compilation error: WebGL context is lost");
    return null;
  }

  if (!source || source.trim() === '') {
    console.error("Shader compilation error: empty shader source");
    return null;
  }

  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Shader compilation error: failed to create shader", {
      type: type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT",
      contextLost: gl.isContextLost ? gl.isContextLost() : "unknown"
    });
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  // Проверяем статус компиляции
  const compileStatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compileStatus) {
    const error = gl.getShaderInfoLog(shader);
    const errorMsg = error || "Unknown shader compilation error";
    console.error("Shader compilation error:", errorMsg, {
      type: type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT",
      sourceLength: source.length,
      contextLost: gl.isContextLost ? gl.isContextLost() : "unknown",
      canvas: gl.canvas ? { width: gl.canvas.width, height: gl.canvas.height } : 'no canvas'
    });
    gl.deleteShader(shader);
    if (!error) {
      console.error("Shader source:", source.substring(0, 200));
    }
    return null;
  }

  return shader;
}

/**
 * Создает и компилирует шейдер программу
 */
export function compileShaderProgram(gl, fragmentShaderSource) {
  if (!fragmentShaderSource || fragmentShaderSource.trim() === '') {
    console.error("compileShaderProgram: empty fragment shader source");
    return null;
  }

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  if (!vertexShader) {
    console.error("compileShaderProgram: failed to compile vertex shader");
    return null;
  }

  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShader) {
    console.error("compileShaderProgram: failed to compile fragment shader");
    gl.deleteShader(vertexShader);
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    console.error("Program linking error:", error);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

