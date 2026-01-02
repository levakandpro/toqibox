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
	vec3 ro = vec3(0., -0.2 ,u_time * 4.);
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
  if (!source || source.trim() === '') {
    console.error("Shader compilation error: empty shader source");
    return null;
  }

  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Shader compilation error: failed to create shader");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader) || "Unknown shader compilation error";
    gl.deleteShader(shader);
    console.error("Shader compilation error:", error);
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

